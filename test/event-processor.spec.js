const assert = require('assert');
const eventProcessor = require('../src/event/event-processor');

describe("input validation", () => {

    describe("createCleanVersionOfEvent", () => {

        it("should not alter supported characters 1", () => {
            let event = {
                var1: "aaa"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=aaa": true
            };
            let knownEntityIds = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownEntityIds);
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
            let knownEntityIds = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownEntityIds);
            assert.strictEqual(cleanEvent.var1, "aaa");
        });

        it("should not alter supported characters 2", () => {
            let event = {
                var1: "some value with space"
            };
            let knownCriteriaKeyValuePairs = {
                "var1=some value with space": true
            };
            let knownEntityIds = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownEntityIds);
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
            let knownEntityIds = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownEntityIds);
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
            let knownEntityIds = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownEntityIds);
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
            let knownEntityIds = {
                "userGuid": true
            };
            let cleanEvent = eventProcessor.createCleanVersionOfEvent(event, knownCriteriaKeyValuePairs, knownEntityIds);

            assert.strictEqual(cleanEvent.var1, "aaa");
            assert.strictEqual(cleanEvent.userGuid, "123");
        });
    });

})