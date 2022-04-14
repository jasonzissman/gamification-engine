import neo4j from "neo4j-driver";
import { log } from "../utility/logger.js";

let neo4jDriver;
let KNOWN_CRITERIA_KEY_VALUE_PAIRS = {};
let KNOWN_SYSTEM_FIELDS = {};

async function initDbConnection(neo4jBoltUri, neo4jUser, neo4jPassword) {

    log(`Connecting to database.`);
    let neo4jAuth = neo4j.auth.basic(neo4jUser, neo4jPassword);
    neo4jDriver = neo4j.driver(neo4jBoltUri, neo4jAuth, { encrypted: false });

    await runNeo4jCommand(`Create :Goal(id) index.`, `CREATE INDEX ON :Goal(id)`);
    await runNeo4jCommand(`Create :Entity(id) index.`, `CREATE INDEX ON :Entity(id)`);
    await runNeo4jCommand(`Create :Criteria(id) index.`, `CREATE INDEX ON :Criteria(id)`);
    await runNeo4jCommand(`Create :EventAttribute(expression) index.`, `CREATE INDEX ON :EventAttribute(expression)`);

    updateKnownFieldFilters();
}

async function updateKnownFieldFilters() {

    let batchSize = 500;

    // Fetch updated copy of all possible key/value combos
    let fieldValuePairBatch = [];
    let fvpCounter = 0;
    while (fvpCounter === 0 || fieldValuePairBatch.length > 0) {
        let query = `MATCH (n:EventAttribute) RETURN n.expression SKIP ${fvpCounter * batchSize} LIMIT ${batchSize}`;
        fieldValuePairBatch = await runNeo4jCommand(`Fetch known criteria key value pairs (iteration ${fvpCounter}).`, query);
        fieldValuePairBatch.forEach(fvp => { if (fvp) { KNOWN_CRITERIA_KEY_VALUE_PAIRS[fvp] = true } });
        fvpCounter++;
    }

    // scan all values of criterion.targetEntityField and add them to KNOWN_SYSTEM_FIELDS
    let targetEntityIdFieldsBatch = [];
    let targetEntityIdFieldsCounter = 0;
    while (targetEntityIdFieldsCounter === 0 || targetEntityIdFieldsBatch.length > 0) {
        let query = `MATCH (c:Criteria) RETURN distinct c.targetEntityIdField SKIP ${targetEntityIdFieldsCounter * batchSize} LIMIT ${batchSize}`;
        targetEntityIdFieldsBatch = await runNeo4jCommand(`Fetch targetEntityIdFields (iteration ${targetEntityIdFieldsCounter}).`, query);
        targetEntityIdFieldsBatch.forEach(idField => { if (idField) { KNOWN_SYSTEM_FIELDS[idField] = true } });
        targetEntityIdFieldsCounter++;
    }

    // scan all values of criterion.targetEntityField and add them to KNOWN_SYSTEM_FIELDS
    let aggValueFieldBatch = [];
    let aggValueFieldsCounter = 0;
    while (aggValueFieldsCounter === 0 || aggValueFieldBatch.length > 0) {
        let query = `MATCH (c:Criteria) RETURN distinct c.aggregation_value_field SKIP ${aggValueFieldsCounter * batchSize} LIMIT ${batchSize}`;
        aggValueFieldBatch = await runNeo4jCommand(`Fetch aggValueFields (iteration ${aggValueFieldsCounter}).`, query);
        aggValueFieldBatch.forEach(aggValueField => { if (aggValueField) { KNOWN_SYSTEM_FIELDS[aggValueField] = true } });
        aggValueFieldsCounter++;
    }

}

async function ping() {
    let results = await runNeo4jCommand(`Ping the database`, `RETURN 1`);
    if (results && results[0].low === 1) {
        return { status: "ok" };
    } else {
        return { status: "unable to ping database" };
    }
}

async function getSpecificGoal(goalId) {
    const query = `MATCH (g:Goal {id: $goalId}) -[:HAS_CRITERIA]-> (c:Criteria) -[:REQUIRES_EVENT_ATTRIBUTE]-> (ea:EventAttribute) RETURN g{criteria:c{.*,qualifyingEvents:ea{.*}},.*}`;
    const resultsArray = await runNeo4jCommand(`Get goal ${goalId}.`, query, { goalId });
    if (resultsArray && resultsArray.length > 0) {
        return resultsArray[0];
    }
}

async function getEntityProgress(entityIdField, entityIdValue, goalId) {
    const retVal = {
        [entityIdField]: entityIdValue,
        goalProgress: undefined
    };
    const entityId = `${entityIdField}=${entityIdValue}`;
    const query = `MATCH (g:Goal {id: $goalId}) -[:HAS_CRITERIA]-> (c:Criteria) OPTIONAL MATCH (e:Entity {id: $entityId}) -[hmpc:HAS_MADE_PROGRESS]-> (c) OPTIONAL MATCH (g) <-[hcg:HAS_COMPLETED]- (e:Entity {id: $entityId}) RETURN g{id:g.id,name:g.name,completionTimestamp:toFloat(hcg.completionTimestamp),criteriaProgress:collect(c{id:c.id,description:c.description,threshold:c.threshold,progress:hmpc.value})}`;
    const results = await runNeo4jCommand(`Get entity progress for ${entityId}.`, query, { entityId, goalId });
    
    if (results && results[0]) {
        retVal.goalProgress = {
            ...results[0]
        };
        if (retVal.goalProgress.completionTimestamp !== null && retVal.goalProgress.completionTimestamp > 0) {
            retVal.goalProgress.isComplete = true;
        } else {
            retVal.goalProgress.isComplete = false;
            delete retVal.goalProgress["completionTimestamp"];
        }
        retVal.goalProgress.criteriaProgress?.filter(c => {
            return !c?.progress || c?.progress === null
        }).forEach(c => {
            c.progress = 0;
        });
    }

    return retVal;

}

async function updateEntityProgress(entityIdField, entityIdValue, criterion, incrementValue) {

    const criterionId = criterion.id;

    const entityId = `${entityIdField}=${entityIdValue}`;

    const command = `
        WITH datetime().epochMillis as currentTime
        MATCH (c:Criteria {id:$criterionId}) <-[:HAS_CRITERIA]- (g:Goal)

        // Create the entity if does not exist yet
        MERGE (e:Entity {id: $entityId})
        ON CREATE set e.\`${entityIdField}\`=$entityIdValue

        // Increment this entity's progress towards the criteria
        MERGE (e)-[r:HAS_MADE_PROGRESS]-> (c)
        ON CREATE set r.value = $incrementValue
        ON MATCH SET r.value = r.value+$incrementValue

        // Mark this criteria as complete for the entity if threshold met 
        FOREACH (i in CASE WHEN r.value >= c.threshold THEN [1] ELSE [] END |
            MERGE (e)-[hc:HAS_COMPLETED]-> (c)
            ON CREATE SET hc.completionTimestamp = currentTime
        )
        
        // Mark this goal as complete if all criteria completed by this entity
        WITH e,g,currentTime
        FOREACH (i in CASE WHEN all(c in [(g:Goal) -[:HAS_CRITERIA]-> (allGoalCriteria:Criteria) | allGoalCriteria] WHERE c IN [(e:Entity) -[:HAS_COMPLETED]-> (completedCriteria:Criteria) | completedCriteria]) THEN [1] ELSE [] END |
            MERGE (e)-[hcg:HAS_COMPLETED]-> (g)
            ON CREATE SET hcg.completionTimestamp = currentTime
        )

        // Return true if this event completed this goal for this entity
        WITH e,g,currentTime
        MATCH (e) -[hcg:HAS_COMPLETED]-> (g)
        return hcg.completionTimestamp = currentTime
    `;

    const params = { entityId, entityIdValue, criterionId, incrementValue }

    return runNeo4jCommand(`Update entity ${entityId} progress to criterion ${criterionId}.`, command, params);
}

async function persistGoalAndCriteria(goal, criteria) {

    log(`Inserting goal ${goal.name} into DB with id ${goal.id}.`);

    const command = generateNeo4jInsertGoalTemplate(criteria);

    const params = createNeo4jFriendlyParams(goal, criteria);

    const response = runNeo4jCommand(`persist goal and criteria`, command, params);

    criteria.forEach(c => {
        KNOWN_SYSTEM_FIELDS[c.targetEntityIdField] = true;
        if (c.aggregation.valueField) {
            KNOWN_SYSTEM_FIELDS[c.aggregation.valueField] = true;
        }
        Object.keys(c.qualifyingEvent).forEach(ea => {
            KNOWN_CRITERIA_KEY_VALUE_PAIRS[`${ea}=${c.qualifyingEvent[ea]}`] = true;
        })
    });

    return response;
}

function generateNeo4jInsertGoalTemplate(criteria) {

    let command = `CREATE (goal:Goal {id: $goal_id, name: $goal_name, state: $goal_state, description: $goal_description, points: $goal_points})\n`;

    for (let i = 0; i < criteria.length; i++) {
        const criteriaVariableName = `criteria_${i}`;

        command += `CREATE (${criteriaVariableName}:Criteria {id: $${criteriaVariableName}_id, description: $${criteriaVariableName}_description, targetEntityIdField: $${criteriaVariableName}_targetEntityIdField, aggregation_type: $${criteriaVariableName}_aggregation_type, aggregation_value: $${criteriaVariableName}_aggregation_value, aggregation_value_field: $${criteriaVariableName}_aggregation_value_field, threshold: $${criteriaVariableName}_threshold })\nCREATE (goal) -[:HAS_CRITERIA]-> (${criteriaVariableName})\n`

        for (let j = 0; j < Object.keys(criteria[i].qualifyingEvent).length; j++) {
            const eventAttrVariableName = `criteria_${i}_attr_${j}`;
            command += `MERGE (${eventAttrVariableName}:EventAttribute { expression: $${eventAttrVariableName}_expression })\nCREATE (${criteriaVariableName}) -[:REQUIRES_EVENT_ATTRIBUTE]-> (${eventAttrVariableName})\n`
        }
    }

    command += `RETURN goal.id\n`;

    return command;
}

function createNeo4jFriendlyParams(goal, criteria) {
    const params = {
        goal_id: goal.id,
        goal_name: goal.name,
        goal_state: goal.state,
        goal_description: goal.description,
        goal_points: goal.points
    }

    for (let i = 0; i < criteria.length; i++) {
        const criterion = criteria[i];
        const criteriaVariableName = `criteria_${i}`;
        params[`${criteriaVariableName}_id`] = criterion.id;
        params[`${criteriaVariableName}_description`] = criterion.description;
        params[`${criteriaVariableName}_aggregation_type`] = criterion.aggregation.type;
        params[`${criteriaVariableName}_aggregation_value`] = criterion.aggregation.value;
        params[`${criteriaVariableName}_aggregation_value_field`] = criterion.aggregation.valueField;
        params[`${criteriaVariableName}_threshold`] = criterion.threshold;
        params[`${criteriaVariableName}_targetEntityIdField`] = criterion.targetEntityIdField;

        const qualifyingEventKeys = Object.keys(criterion.qualifyingEvent);
        for (let j = 0; j < qualifyingEventKeys.length; j++) {
            const key = qualifyingEventKeys[j];
            const eventAttrVariableName = `criteria_${i}_attr_${j}`;
            const formattedExpression = `${key}=${criterion.qualifyingEvent[key]}`;
            params[`${eventAttrVariableName}_expression`] = formattedExpression;
        }
    }

    return params;

}

async function getCriteriaFulfilledByActivity(event) {

    const receivedEventProps = Object.keys(event).map(k => `${k}=${event[k]}`);

    let query = `
        MATCH
            (c:Criteria)-[:REQUIRES_EVENT_ATTRIBUTE]->(e:EventAttribute)
        WHERE
            ALL(candidateAttribute IN [(c)-[:REQUIRES_EVENT_ATTRIBUTE]->(candidateAttributes:EventAttribute) | candidateAttributes] WHERE candidateAttribute.expression IN $receivedEventProps)
        RETURN
            distinct c{.*}
    `;

    const criteria = await runNeo4jCommand(`get criteria matching event`, query, { receivedEventProps })

    criteria.forEach((c) => {
        c.aggregation = {
            type: c.aggregation_type,
            value: c.aggregation_value,
            valueField: c.aggregation_value_field
        }
        delete c["aggregation_type"];
        delete c["aggregation_value"];
        delete c["aggregation_value_field"];
    });

    return criteria;

}

async function closeAllDbConnections() {
    await neo4jDriver.close();
}

async function runNeo4jCommand(description, command, params = {}) {
    let results = [];

    let session;

    try {
        session = await neo4jDriver.session();
        let response = await session.writeTransaction(tx => tx.run(command, params));
        results = response.records.map(r => r.get(0))
    } catch (err) {
        log(`Error during neo4j command "${description}": ${err.message} `);
    } finally {
        session.close();
    }

    return results;
}

export {
    initDbConnection,
    ping,
    getSpecificGoal,
    getEntityProgress,
    updateEntityProgress,
    persistGoalAndCriteria,
    generateNeo4jInsertGoalTemplate,
    createNeo4jFriendlyParams,
    getCriteriaFulfilledByActivity,
    closeAllDbConnections,
    KNOWN_CRITERIA_KEY_VALUE_PAIRS,
    KNOWN_SYSTEM_FIELDS
};