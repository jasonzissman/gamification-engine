import assert from 'assert';
import { createCleanVersionOfEvent, computeIncrementValue } from './event-processor.js';

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
            let cleanEvent = createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);
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
            let cleanEvent = createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);
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
            let cleanEvent = createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);
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
            let cleanEvent = createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);
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
            let cleanEvent = createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);
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
            let cleanEvent = createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);

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
            let cleanEvent = createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownSystemFields);

            assert.strictEqual(cleanEvent.var1, "aaa");
            assert.strictEqual(cleanEvent.stringField, "123");
            assert.strictEqual(cleanEvent.numericField, 123);
        });

    });

    describe("computeIncrementValue", () => {

        it("should return a value of 1 for count", () => {
            const event = {
                foo: "bar"
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "count",
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should return a value of 1 for count even if another value erroneously provided", () => {
            const event = {
                foo: "bar"
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "count",
                    value: 4
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should default to a value of 1 for sum", () => {
            const event = {
                foo: "bar"
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should return a value of 1 for sum if a non-number 'value' is provided", () => {
            const event = {
                foo: "bar"
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    value: "this-is-not-valid"
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should return a value of 1 for sum if a null 'value' is provided", () => {
            const event = {
                foo: "bar"
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    value: null
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should return a value of 1 for sum if a empty string 'value' is provided", () => {
            const event = {
                foo: "bar"
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    value: ''
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should return the value specified for sum", () => {
            const event = {
                foo: "bar"
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    value: 3
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 3);
        });

        it("should return the value from the field specified for sum", () => {
            const event = {
                foo: 2
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    valueField: "foo"
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 2);
        });

        it("should return the value from the field specified for sum even if fieldName has a space", () => {
            const event = {
                ["foo bar"]: 2
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    valueField: "foo bar"
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 2);
        });

        it("should return the value from the field specified for sum even if fieldName has a hyphen", () => {
            const event = {
                ["foo-bar"]: 2
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    valueField: "foo-bar"
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 2);
        });

        it("should default to 1 if the field specified for sum is missing", () => {
            const event = {
                foo: 2
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    valueField: "this_does_not_exist"
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should default to 1 if the field specified for sum is not a number", () => {
            const event = {
                foo: "this-is-not-a-number"
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    valueField: "foo"
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should default to 1 if the field specified for sum is null", () => {
            const event = {
                foo: 56
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    valueField: null
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 1);
        });


        it("should default to 1 if the value specified for sum is null", () => {
            const event = {
                foo: null
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    valueField: "foo"
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should default to 1 if the value specified for sum is empty string", () => {
            const event = {
                foo: 7
            };
            const criterion = {
                id: "123",
                targetEntityIdField: "userId",
                threshold: 5,
                aggregation: {
                    type: "sum",
                    valueField: ''
                }
            };
            const retVal = computeIncrementValue(criterion, event);
            assert.deepStrictEqual(retVal, 1);
        });

        // null test
        // invalid var name on field (e.g. has spaces or hyphens or something?)
        // malformed criteria test
        // when value and valueField are provided
        // etc.

    })
});

