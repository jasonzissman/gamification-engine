const assert = require('assert');
const eventNameHelper = require('../src/event-name-processing/event-name-helper');

describe('Event Name Helper', () => {

    describe('eventCriteriaMatching', () => {

        it('simple event should match simple criteria', () => {

            let matchingEventCriteria = { var1: "foo" };
            let eventReceived = { var1: "foo" };

            const eventCriteriaRegex = eventNameHelper.createMatchingEventCriteriaListenerRegexString(matchingEventCriteria);
            const eventName = eventNameHelper.createEventBroadcastString(eventReceived);
            assert.equal(eventCriteriaRegex.test(eventName), true);
        });

        it('simple event should not match simple criteria', () => {

            let matchingEventCriteria = { var1: "foo" };
            let eventReceived = { var1: "yyy" };

            const eventCriteriaRegex = eventNameHelper.createMatchingEventCriteriaListenerRegexString(matchingEventCriteria);
            const eventName = eventNameHelper.createEventBroadcastString(eventReceived);
            assert.equal(eventCriteriaRegex.test(eventName), false);
        });

        it('kinda simple event should match kinda simple criteria', () => {

            let matchingEventCriteria = { var1: "foo", var2: "bar" };
            let eventReceived = { var1: "foo", var2: "bar" };

            const eventCriteriaRegex = eventNameHelper.createMatchingEventCriteriaListenerRegexString(matchingEventCriteria);
            const eventName = eventNameHelper.createEventBroadcastString(eventReceived);
            assert.equal(eventCriteriaRegex.test(eventName), true);
        });

        it('kinda simple event should NOT match kinda simple criteria', () => {

            let matchingEventCriteria = { var1: "foo", var2: "bar" };
            let eventReceived = { var1: "yyy", var2: "zzz" };

            const eventCriteriaRegex = eventNameHelper.createMatchingEventCriteriaListenerRegexString(matchingEventCriteria);
            const eventName = eventNameHelper.createEventBroadcastString(eventReceived);
            assert.equal(eventCriteriaRegex.test(eventName), false);
        });

        it('should not matter what order fields come in', () => {

            let matchingEventCriteria = { var2: "bar", var1: "foo" };
            let eventReceived = { var1: "foo", var2: "bar" };

            const eventCriteriaRegex = eventNameHelper.createMatchingEventCriteriaListenerRegexString(matchingEventCriteria);
            const eventName = eventNameHelper.createEventBroadcastString(eventReceived);
            assert.equal(eventCriteriaRegex.test(eventName), true);
        });

    });



});