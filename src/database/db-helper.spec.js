import assert from 'assert';
import { generateNeo4jInsertGoalTemplate, createNeo4jFriendlyParams } from './db-helper.js';

describe('generateNeo4jInsertGoalTemplate', () => {

    it('should return template with single criteria', () => {

        let criteria = [
            {
                "qualifyingEvent": {
                    "action": "log-in",
                    "platform": "mobile"
                },
                "aggregation": {
                    "type": "count"
                },
                "threshold": 5
            }
        ];
        const actual = generateNeo4jInsertGoalTemplate(criteria);
        assertNeo4jCommandIsEqual(actual, `CREATE (goal:Goal {id: $goal_id, name: $goal_name, state: $goal_state, description: $goal_description, points: $goal_points})
            CREATE (criteria_0:Criteria {id: $criteria_0_id, description: $criteria_0_description, targetEntityIdField: $criteria_0_targetEntityIdField, aggregation_type: $criteria_0_aggregation_type, aggregation_value: $criteria_0_aggregation_value, aggregation_value_field: $criteria_0_aggregation_value_field, threshold: $criteria_0_threshold })
            CREATE (goal) -[:HAS_CRITERIA]-> (criteria_0)
            MERGE (criteria_0_attr_0:EventAttribute { id: "$criteria_0_attr_0_id", type: "stringComparison", expression: $criteria_0_attr_0_expression })
            CREATE (criteria_0) -[:REQUIRES_EVENT_ATTRIBUTE]-> (criteria_0_attr_0)
            MERGE (criteria_0_attr_1:EventAttribute { id: "$criteria_0_attr_1_id", type: "stringComparison", expression: $criteria_0_attr_1_expression })
            CREATE (criteria_0) -[:REQUIRES_EVENT_ATTRIBUTE]-> (criteria_0_attr_1)
            RETURN goal.id
            `);
    });
});

describe('createNeo4jFriendlyParams', () => {

    it('should return template with single criteria', () => {

        const goal = {
            id: "123",
            name: "Mobile Power User",
            description: "Receive a badge when you log in at least 5 times on a mobile device",
            points: 10,
            state: "enabled"
        };

        const criteria = [
            {
                targetEntityIdField: "userId",
                description: `Log in 5 times from a mobile device`,
                id: "111",
                qualifyingEvent: {
                    action: "log-in",
                    platform: "mobile"
                },
                aggregation: {
                    type: "count"
                },
                threshold: 5
            }
        ]
        const actual = createNeo4jFriendlyParams(goal, criteria);
        removeIdsFromObject(actual)
        assert.deepStrictEqual(actual, {
            "goal_description": "Receive a badge when you log in at least 5 times on a mobile device",
            "goal_name": "Mobile Power User",
            "goal_points": 10,
            "goal_state": "enabled",
            "criteria_0_description": "Log in 5 times from a mobile device",
            "criteria_0_threshold": 5,
            "criteria_0_targetEntityIdField": "userId",
            "criteria_0_aggregation_type": "count",
            "criteria_0_aggregation_value": undefined,
            "criteria_0_aggregation_value_field": undefined,
            "criteria_0_attr_0_expression": "action=log-in",
            "criteria_0_attr_1_expression": "platform=mobile",
        });
    });
});

function assertNeo4jCommandIsEqual(actual, expected) {
    const actualLines = actual.split("\n");
    const expectedLines = expected.split("\n")
    for (let i = 0; i < expectedLines.length; i++) {
        assert.equal(actualLines[i].trim(), expectedLines[i].trim());
    }
}


function removeIdsFromObject(objectToClean) {
    for (let key in objectToClean) {
        if (key.includes("_id")) {
            delete objectToClean[key];
        }
    }
}