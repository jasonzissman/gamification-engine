const assert = require('assert');
const eventProcessor = require('../../src/event/event-processor');

describe("event processing", () => {

    describe("createCleanVersionOfEvent", () => {

        it("should not alter supported characters 1", () => {
            let event = {
                var1: "aaa"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=aaa": true
            };
            let knownSystemFields = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);
            assert.strictEqual(cleanEvent.var1, "aaa");
        });

        it("should support multiple fields", () => {
            let event = {
                var1: "aaa",
                var2: "bbb"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=aaa": true,
                "var2=bbb": true
            };
            let knownSystemFields = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);
            assert.strictEqual(cleanEvent.var1, "aaa");
        });

        it("should not alter supported characters 2", () => {
            let event = {
                var1: "some value with space"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=some value with space": true
            };
            let knownSystemFields = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);
            assert.strictEqual(cleanEvent.var1, "some value with space");
        });

        it("should eliminate unknown fields", () => {
            let event = {
                var1: "aaa",
                what: "atypical"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=aaa": true
            };
            let knownSystemFields = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);
            assert.strictEqual(cleanEvent.var1, "aaa");
            assert.strictEqual(cleanEvent.what, undefined);
        });

        it("should eliminate fields with unknown corresponding values even if keys are known", () => {
            let event = {
                var1: "aaa",
                what: "atypical"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=aaa": true,
                "what=123": true,
                "what=456": true,
                "what=789": true,
                "what=thisIsNotAtypical": true
            };
            let knownSystemFields = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);
            assert.strictEqual(cleanEvent.var1, "aaa");
            assert.strictEqual(cleanEvent.what, undefined);
        });

        it("should also keep entityId fields", () => {
            let event = {
                var1: "aaa",
                userGuid: "123"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=aaa": true
            };
            let knownSystemFields = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);

            assert.strictEqual(cleanEvent.var1, "aaa");
            assert.strictEqual(cleanEvent.userGuid, "123");
        });

        it("should also keep entityId fields", () => {
            let event = {
                var1: "aaa",
                stringField: "123",
                numericField: 123
            };
            let knownCriteriaKeyValuePairs = {
                "var1=aaa": true
            };
            let knownSystemFields = {
                "stringField": true,
                "numericField": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);

            assert.strictEqual(cleanEvent.var1, "aaa");
            assert.strictEqual(cleanEvent.stringField, "123");
            assert.strictEqual(cleanEvent.numericField, 123);
        });
        
    });

    describe("computeProgressUpdatesToMake", () => {

        it("should return empty array if undefined criteria", () => {
            const event = {};
            const criteria = undefined;
            const retVal = eventProcessor.computeProgressUpdatesToMake(event, criteria);
            assert.deepStrictEqual(retVal, []);
        });

        it("should return empty array if empty criteria", () => {
            const event = {};
            const criteria = [];
            const retVal = eventProcessor.computeProgressUpdatesToMake(event, criteria);
            assert.deepStrictEqual(retVal, []);
        });

        it("should return one update if everything valid", () => {
            const event = {
                userId: "john-doe-123",
                var1: "aaa"
            };
            const criteria = [{
                goalId: "goal-1234",
                id: "criterion-9999",
                targetEntityIdField: "userId",
                aggregation: {
                    type: "count"
                },
                threshold: 5
            }];
            const retVal = eventProcessor.computeProgressUpdatesToMake(event, criteria);
            assert.deepStrictEqual(retVal, [{
                goalId: "goal-1234",
                entityId: "john-doe-123",
                criterionId: "criterion-9999",
                aggregationValueToAdd: 1,
                threshold: 5
            }]);
        });
        it("should not return an update if criteria's entityID is not on event", () => {
            const event = {
                userId: "john-doe-123",
                var1: "aaa"
            };
            const criteria = [{
                goalId: "goal-1234",
                id: "criterion-9999",
                targetEntityIdField: "someUnknownField",
                aggregation: {
                    type: "count"
                },
                threshold: 5
            }];
            const retVal = eventProcessor.computeProgressUpdatesToMake(event, criteria);
            assert.deepStrictEqual(retVal, []);
        });
        it("should not return an update if criteria's entityID is empty on event", () => {
            const event = {
                userId: "",
                var1: "aaa"
            };
            const criteria = [{
                goalId: "goal-1234",
                id: "criterion-9999",
                targetEntityIdField: "userId",
                aggregation: {
                    type: "count"
                },
                threshold: 5
            }];
            const retVal = eventProcessor.computeProgressUpdatesToMake(event, criteria);
            assert.deepStrictEqual(retVal, []);
        });

        it("should return two updates if two criteria apply", () => {
            const event = {
                userId: "john-doe-123",
                var1: "aaa"
            };
            const criteria = [{
                goalId: "goal-1234",
                id: "criterion-9999",
                targetEntityIdField: "userId",
                aggregation: {
                    type: "count"
                },
                threshold: 5
            }, {
                goalId: "goal-5678",
                id: "criterion-0000",
                targetEntityIdField: "userId",
                aggregation: {
                    type: "count"
                },
                threshold: 5
            }];
            const retVal = eventProcessor.computeProgressUpdatesToMake(event, criteria);
            assert.deepStrictEqual(retVal, [{
                goalId: "goal-1234",
                entityId: "john-doe-123",
                criterionId: "criterion-9999",
                aggregationValueToAdd: 1,
                threshold: 5
            }, {
                goalId: "goal-5678",
                entityId: "john-doe-123",
                criterionId: "criterion-0000",
                aggregationValueToAdd: 1,
                threshold: 5
            }]);
        });

        it("should return one update if only one criteria matches", () => {
            const event = {
                userId: "john-doe-123",
                var1: "aaa"
            };
            const criteria = [{
                goalId: "goal-1234",
                id: "criterion-9999",
                targetEntityIdField: "userId",
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                goalId: "goal-5678",
                id: "criterion-0000",
                targetEntityIdField: "someUnknownField",
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }];
            const retVal = eventProcessor.computeProgressUpdatesToMake(event, criteria);
            assert.deepStrictEqual(retVal, [{
                goalId: "goal-1234",
                entityId: "john-doe-123",
                criterionId: "criterion-9999",
                aggregationValueToAdd: 1,
                threshold: 5
            }]);
        });

        it("should return two updates if two criteria apply on different entity IDs", () => {
            const event = {
                userId: "john-doe-123",
                groupId: "the-group-456",
                var1: "aaa"
            };
            const criteria = [{
                goalId: "goal-1234",
                id: "criterion-9999",
                targetEntityIdField: "groupId",
                aggregation: {
                    type: "count"
                },
                threshold: 5
            }, {
                goalId: "goal-5678",
                id: "criterion-0000",
                targetEntityIdField: "userId",
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }];
            const retVal = eventProcessor.computeProgressUpdatesToMake(event, criteria);
            assert.deepStrictEqual(retVal, [{
                goalId: "goal-1234",
                entityId: "the-group-456",
                criterionId: "criterion-9999",
                aggregationValueToAdd: 1,
                threshold: 5
            }, {
                goalId: "goal-5678",
                entityId: "john-doe-123",
                criterionId: "criterion-0000",
                aggregationValueToAdd: 1,
                threshold: 5
            }]);
        });

        it("should return update with appropriate agg value for sum agg", () => {
            const event = {
                userId: "john-doe-123",
                var1: "aaa"
            };
            const criteria = [{
                goalId: "goal-1234",
                id: "criterion-9999",
                targetEntityIdField: "userId",
                aggregation: {
                    type: "sum",
                    value: 3
                },
                threshold: 5
            }];
            const retVal = eventProcessor.computeProgressUpdatesToMake(event, criteria);
            assert.deepStrictEqual(retVal, [{
                goalId: "goal-1234",
                entityId: "john-doe-123",
                criterionId: "criterion-9999",
                aggregationValueToAdd: 3,
                threshold: 5
            }]);
        });

        it("should return update with appropriate agg value for sum agg", () => {
            const event = {
                userId: "john-doe-123",
                var1: "aaa",
                timeInMs: 3034
            };
            const criteria = [{
                goalId: "goal-1234",
                id: "criterion-9999",
                targetEntityIdField: "userId",
                aggregation: {
                    type: "sum",
                    valueField: "timeInMs"
                },
                threshold: 5
            }];
            const retVal = eventProcessor.computeProgressUpdatesToMake(event, criteria);
            assert.deepStrictEqual(retVal, [{
                goalId: "goal-1234",
                entityId: "john-doe-123",
                criterionId: "criterion-9999",
                aggregationValueToAdd: 3034,
                threshold: 5
            }]);
        });

        it("should return update with agg of '1' for sum agg if agg field not found", () => {
            const event = {
                userId: "john-doe-123",
                var1: "aaa"
            };
            const criteria = [{
                goalId: "goal-1234",
                id: "criterion-9999",
                targetEntityIdField: "userId",
                aggregation: {
                    type: "sum",
                    valueField: "timeInMs" // not found on event!
                },
                threshold: 5
            }];
            const retVal = eventProcessor.computeProgressUpdatesToMake(event, criteria);
            assert.deepStrictEqual(retVal, [{
                goalId: "goal-1234",
                entityId: "john-doe-123",
                criterionId: "criterion-9999",
                aggregationValueToAdd: 1,
                threshold: 5
            }]);
        });
    });
});