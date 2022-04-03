const neo4j = require('neo4j-driver');
const logger = require('../utility/logger.js');

const NEO4J_USER = process.env.NEO4J_USER;
const NEO4J_PW = process.env.NEO4J_PW;
const NEO4J_HOST = process.env.NEO4J_HOST;
const NEO4J_CYPHER_PORT = process.env.NEO4J_CYPHER_PORT || 7687;

let neo4jDriver;

async function initDbConnection() {

    logger.info(`Connecting to database.`);
    let neo4jAuth = neo4j.auth.basic(NEO4J_USER, NEO4J_PW);
    neo4jDriver = neo4j.driver(`bolt://${NEO4J_HOST}:${NEO4J_CYPHER_PORT}/`, neo4jAuth, { encrypted: false });

    await runNeo4jCommand(`Create :Goal(id) index.`, `CREATE INDEX ON :Goal(id)`);
    await runNeo4jCommand(`Create :EventAttribute(expression) index.`, `CREATE INDEX ON :EventAttribute(expression)`);
}

async function ping() {
    let results = await runNeo4jCommand(`Ping the database`, `RETURN 1`);
    if (results && results[0].low === 1) {
        return { status: "ok" };
    } else {
        return { status: "unable to ping database" };
    }
}

async function getAllCriteriaForGoal(goalId) {
    const query = `MATCH (g:Goal {id: $goalId}) -[:HAS_CRITERIA]-> (c:Criteria) RETURN c`;
    return runNeo4jCommand(`Get all criteria for goal ${goalId}.`, query, { goalId });
}

async function getAllGoals(limit = 25) {
    if (limit > 100) { 
        limit = 100 
    };
    const query = `MATCH (g:Goal) RETURN g LIMIT $limit`;
    return runNeo4jCommand(`Get all goals (limit ${limit}).`, query, { limit });
}

async function getSpecificGoal(goalId) {
    const query = `MATCH (g:Goal {id: $goalId}) RETURN g`;
    const resultsArray = await runNeo4jCommand(`Get goal ${goalId}.`, query, { goalId });
    if (resultsArray && resultsArray.length > 0) {
        return resultsArray[0];
    }
}

async function getSpecificGoals(goalIds, limit = 25) {
    if (limit > 100) { 
        limit = 100 
    };
    const query = `MATCH (g:Goal) WHERE g.id IN $goalIds RETURN g LIMIT $limit`;
    return await runNeo4jCommand(`Get goals ${goalIds} (limit ${limit}).`, query, { goalIds, limit });
}

async function getSpecificEntityProgress(entityId) {

    // TODO - finish this. Entities should be upserted, and then a "HAS_MADE_PROGRESS_TOWARDS" relationship
    // created in between the entity and the criteria. The relationship will have properties representing
    // the nature of that progress. Entities should also have a "HAS_FULFILLED" relationship to the parent goal,
    // when applicable

}

async function getSpecificEntitiesProgress(entityIds) {

    // TODO - finish this. Entities should be upserted, and then a "HAS_MADE_PROGRESS_TOWARDS" relationship
    // created in between the entity and the criteria. The relationship will have properties representing
    // the nature of that progress. Entities should also have a "HAS_FULFILLED" relationship to the parent goal,
    // when applicable

}

async function updateEntityProgress(entity) {

    let command = `MERGE (e:Entity {id: $entity_id}) SET e.\n`;

    // TODO - finish this. Entities should be upserted, and then a "HAS_MADE_PROGRESS_TOWARDS" relationship
    // created in between the entity and the criteria. The relationship will have properties representing
    // the nature of that progress. Entities should also have a "HAS_FULFILLED" relationship to the parent goal,
    // when applicable

}

async function updateMultipleEntityProgress(entityProgressMap) {

    // TODO - finish this. Entities should be upserted, and then a "HAS_MADE_PROGRESS_TOWARDS" relationship
    // created in between the entity and the criteria. The relationship will have properties representing
    // the nature of that progress. Entities should also have a "HAS_FULFILLED" relationship to the parent goal,
    // when applicable

    // logger.info(`Updating entity progress for entities ${Object.keys(entityProgressMap)}.`);
    // const entityProgressCollection = DB_CONNECTION.collection(COLLECTION_ENTITY_PROGRESS_NAME);

    // const operations = [];
    // for (var entityId in entityProgressMap) {
    //     operations.push({
    //         replaceOne: {
    //             "filter": {
    //                 "entityId": entityId
    //             },
    //             "replacement": entityProgressMap[entityId],
    //             "upsert": true
    //         }
    //     });
    // }

    // return entityProgressCollection.bulkWrite(operations)
}

async function getSpecificCriteria(criteriaIds, limit) {

    // TODO - this function may not ever be needed. Delete if determined so.

    if (limit > 100) { 
        limit = 100 
    };
    const query = `MATCH (c:Criteria) WHERE c.id IN $criteriaIds RETURN c LIMIT $limit`;
    return await runNeo4jCommand(`Get criteria ${criteriaIds} (limit ${limit}).`, query, { criteriaIds, limit });

}

async function persistGoalAndCriteria(goal, criteria) {

    logger.info(`Inserting goal ${goal.name} into DB with id ${goal.id}.`);

    const command = generateNeo4jInsertGoalTemplate(criteria);

    const params = createNeo4jFriendlyParams(goal, criteria);

    runNeo4jCommand(`persist goal and criteria`, command, params);
}

function generateNeo4jInsertGoalTemplate(criteria) {

    let command = `CREATE (goal:Goal {id: $goal_id, name: $goal_name, targetEntityIdField: $goal_targetEntityIdField, state: $goal_state, description: $goal_description, points: $goal_points})\n`;

    for (let i = 0; i < criteria.length; i++) {
        const criteriaVariableName = `criteria_${i}`;
        command += `CREATE (${criteriaVariableName}:Criteria {id: $${criteriaVariableName}_id, targetEntityIdField: $${criteriaVariableName}_targetEntityIdField, aggregation: $${criteriaVariableName}_aggregation, threshold: $${criteriaVariableName}_threshold })\nCREATE (goal) -[:HAS_CRITERIA]-> (${criteriaVariableName})\n`

        for (let j = 0; j < Object.keys(criteria[i].qualifyingEvent).length; j++) {
            const eventAttrVariableName = `criteria_${i}_attr_${j}`;
            command += `MERGE (${eventAttrVariableName}:EventAttribute { expression: $${eventAttrVariableName}_expression })\nCREATE (${criteriaVariableName}) -[:HAS_CRITERIA]-> (${eventAttrVariableName})\n`
        }
    }

    return command;
}

function createNeo4jFriendlyParams(goal, criteria) {
    const params = {
        goal_id: goal.id,
        goal_name: goal.name,
        goal_targetEntityIdField: goal.targetEntityIdField,
        goal_state: goal.state,
        goal_description: goal.description,
        goal_points: goal.points
    }

    for (let i = 0; i < criteria.length; i++) {
        const criterion = criteria[i];
        const criteriaVariableName = `criteria_${i}`;
        params[`${criteriaVariableName}_id`] = criterion.id;
        params[`${criteriaVariableName}_aggregation`] = criterion.aggregation;
        params[`${criteriaVariableName}_threshold`] = criterion.threshold;

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

async function closeAllDbConnections() {
    await neo4jDriver.close();
}

async function runNeo4jCommand(description, command, params = {}) {
    let results = [];

    logger.info(`Executing neo4j command "${description}"`);

    let session;

    try {
        session = await neo4jDriver.session();
        let response = await session.readTransaction(tx => tx.run(command, params));
        results = response.records.map(r => r.get(0))
    } catch (err) {
        logger.error(`Error during neo4j command "${description}": ${err.message} `);
    } finally {
        session.close();
    }

    return results;
}

module.exports = {
    initDbConnection,
    ping,
    getSpecificCriteria,
    getAllCriteriaForGoal,
    getAllGoals,
    getSpecificGoal,
    getSpecificGoals,
    getSpecificEntityProgress,
    getSpecificEntitiesProgress,
    updateEntityProgress,
    updateMultipleEntityProgress,
    persistGoalAndCriteria,
    generateNeo4jInsertGoalTemplate,
    createNeo4jFriendlyParams,
    closeAllDbConnections
};