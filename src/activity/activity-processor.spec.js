import assert from 'assert';
import { createCleanVersionOfActivity, computeIncrementValue } from './activity-processor.js';

describe("activity processing", () => {

    describe("createCleanVersionOfActivity", () => {

        it("should not alter supported characters 1", () => {
            let activity = {
                var1: "aaa"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=aaa": true
            };
            let knownSystemFields = {
                "userGuid": true
            };
            let cleanActivity = createCleanVersionOfActivity(activity, knownCriteriaKeyValuePairs, knownSystemFields);
            assert.strictEqual(cleanActivity.var1, "aaa");
        });

        it("should support multiple fields", () => {
            let activity = {
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
            let cleanActivity = createCleanVersionOfActivity(activity, knownCriteriaKeyValuePairs, knownSystemFields);
            assert.strictEqual(cleanActivity.var1, "aaa");
        });

        it("should not alter supported characters 2", () => {
            let activity = {
                var1: "some value with space"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=some value with space": true
            };
            let knownSystemFields = {
                "userGuid": true
            };
            let cleanActivity = createCleanVersionOfActivity(activity, knownCriteriaKeyValuePairs, knownSystemFields);
            assert.strictEqual(cleanActivity.var1, "some value with space");
        });

        it("should eliminate unknown fields", () => {
            let activity = {
                var1: "aaa",
                what: "atypical"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=aaa": true
            };
            let knownSystemFields = {
                "userGuid": true
            };
            let cleanActivity = createCleanVersionOfActivity(activity, knownCriteriaKeyValuePairs, knownSystemFields);
            assert.strictEqual(cleanActivity.var1, "aaa");
            assert.strictEqual(cleanActivity.what, undefined);
        });

        it("should eliminate fields with unknown corresponding values even if keys are known", () => {
            let activity = {
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
            let cleanActivity = createCleanVersionOfActivity(activity, knownCriteriaKeyValuePairs, knownSystemFields);
            assert.strictEqual(cleanActivity.var1, "aaa");
            assert.strictEqual(cleanActivity.what, undefined);
        });

        it("should also keep entityId fields", () => {
            let activity = {
                var1: "aaa",
                userGuid: "123"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=aaa": true
            };
            let knownSystemFields = {
                "userGuid": true
            };
            let cleanActivity = createCleanVersionOfActivity(activity, knownCriteriaKeyValuePairs, knownSystemFields);

            assert.strictEqual(cleanActivity.var1, "aaa");
            assert.strictEqual(cleanActivity.userGuid, "123");
        });

        it("should also keep entityId fields", () => {
            let activity = {
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
            let cleanActivity = createCleanVersionOfActivity(activity, knownCriteriaKeyValuePairs, knownSystemFields);

            assert.strictEqual(cleanActivity.var1, "aaa");
            assert.strictEqual(cleanActivity.stringField, "123");
            assert.strictEqual(cleanActivity.numericField, 123);
        });

    });

    describe("computeIncrementValue", () => {

        it("should return a value of 1 for count", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should return a value of 1 for count even if another value erroneously provided", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should default to a value of 1 for sum", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should return a value of 1 for sum if a non-number 'value' is provided", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should return a value of 1 for sum if a null 'value' is provided", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should return a value of 1 for sum if a empty string 'value' is provided", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should return the value specified for sum", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 3);
        });

        it("should return the value from the field specified for sum", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 2);
        });

        it("should return the value from the field specified for sum even if fieldName has a space", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 2);
        });

        it("should return the value from the field specified for sum even if fieldName has a hyphen", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 2);
        });

        it("should default to 1 if the field specified for sum is missing", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should default to 1 if the field specified for sum is not a number", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should default to 1 if the field specified for sum is null", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 1);
        });


        it("should default to 1 if the value specified for sum is null", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 1);
        });

        it("should default to 1 if the value specified for sum is empty string", () => {
            const activity= {
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
            const retVal = computeIncrementValue(criterion, activity);
            assert.deepStrictEqual(retVal, 1);
        });

        // null test
        // invalid var name on field (e.g. has spaces or hyphens or something?)
        // malformed criteria test
        // when value and valueField are provided
        // etc.

    })
});

