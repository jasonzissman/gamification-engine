const assert = require('assert');
const eventNameHelper = require('../src/event-name-processing/event-name-helper');

describe('Event Name Helper', () => {

    describe('eventCriteriaMatching', () => {

        const assertEventCriteriaMatchesEvent = (eventCriteria, eventReceived, shouldMatch) => {

            const knownEventKeys = ["var1", "var2", "var3", "var4", "var5"];
            const eventCriteriaRegex = eventNameHelper.createMatchingEventCriteriaListenerRegexString(eventCriteria, knownEventKeys);
            const eventName = eventNameHelper.createEventBroadcastString(eventReceived);

            assert.equal(eventCriteriaRegex.test(eventName), shouldMatch);
        };

        it('simple event should match simple criteria', () => {

            let eventCriteria = { var1: "foo" };
            let eventReceived = { var1: "foo" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('simple event should not match simple criteria', () => {

            let eventCriteria = { var1: "foo" };
            let eventReceived = { var1: "yyy" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, false);
        });

        it('multi-field event should match multi-field criteria', () => {

            let eventCriteria = { var1: "foo", var2: "bar" };
            let eventReceived = { var1: "foo", var2: "bar" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('multi-field event should NOT match multi-field criteria', () => {

            let eventCriteria = { var1: "foo", var2: "bar" };
            let eventReceived = { var1: "yyy", var2: "zzz" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, false);
        });

        it('should not matter what order event fields come in', () => {

            let eventCriteria = { var2: "bar", var1: "foo" };
            let eventReceived = { var1: "foo", var2: "bar" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('should not matter what order criteria fields defined in', () => {

            let eventCriteria = { var1: "foo", var2: "bar" };
            let eventReceived = { var2: "bar", var1: "foo" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('multi-field event should match subset single-field criteria', () => {

            let eventCriteria = { var1: "foo" };
            let eventReceived = { var1: "foo", var2: "bar" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('multi-field event should NOT match non-subset single-field criteria', () => {

            let eventCriteria = { var1: "zzz" };
            let eventReceived = { var1: "foo", var2: "bar" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, false);
        });

        it('single-field event should NOT match partial subset multi-field criteria', () => {

            let eventCriteria = { var1: "foo", var2: "bar" };
            let eventReceived = { var1: "foo" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, false);
        });

        it('unsorted multi-field event should match subset single-field criteria', () => {

            let eventCriteria = { var1: "foo" };
            let eventReceived = { var2: "bar", var1: "foo" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('three-field event should match three-field criteria', () => {

            let eventCriteria = { var1: "foo", var2: "bar", var3: "zzz" };
            let eventReceived = { var1: "foo", var2: "bar", var3: "zzz" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('three-field event should match three-field criteria even if order different #1', () => {

            let eventCriteria = { var1: "foo", var2: "bar", var3: "zzz" };
            let eventReceived = { var3: "zzz", var2: "bar", var1: "foo" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('three-field event should match three-field criteria even if order different #2', () => {

            let eventCriteria = { var1: "foo", var2: "bar", var3: "zzz" };
            let eventReceived = { var2: "bar", var1: "foo", var3: "zzz" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('three-field event should match subset two-field criteria #1', () => {

            let eventCriteria = { var1: "foo", var2: "bar" };
            let eventReceived = { var1: "foo", var2: "bar", var3: "zzz" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('three-field event should match subset two-field criteria #2', () => {

            let eventCriteria = { var1: "foo", var3: "zzz" };
            let eventReceived = { var1: "foo", var2: "bar", var3: "zzz" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('three-field event should match subset two-field criteria #3', () => {

            let eventCriteria = { var2: "bar", var3: "zzz" };
            let eventReceived = { var1: "foo", var2: "bar", var3: "zzz" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('unsorted three-field event should match subset two-field criteria', () => {

            let eventCriteria = { var1: "foo", var2: "bar" };
            let eventReceived = { var2: "bar", var1: "foo", var3: "zzz" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, true);
        });

        it('unsorted three-field event should NOT match not-subset two-field criteria', () => {

            let eventCriteria = { var1: "foo", var2: "bar" };
            let eventReceived = { var2: "bar", var1: "yyy", var3: "zzz" };

            assertEventCriteriaMatchesEvent(eventCriteria, eventReceived, false);
        });

        // Test assert that we reduce even to only known keys

    });



});