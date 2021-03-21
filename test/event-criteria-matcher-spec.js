const assert = require('assert');
const eventCriteriaHelper = require('../src/event/event-criteria-matcher');

describe('Criteria Matching', () => {

    describe('Contrived Scenario 1', () => {

        it('should match received event to appropriate qualifying event - test 1', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb"
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 1);
            assert.strictEqual(matchingCriteria[0], "criterion-1");
        });

        it('should match received event to appropriate qualifying event - test 2', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb"
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 1);
            assert.strictEqual(matchingCriteria[0], "criterion-1");
        });

        it('should match received event to appropriate qualifying event - test 3', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "ccc"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb"
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 0);
        });

        it('should match received event to appropriate qualifying event - test 4', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb",
                var3: "ccc"
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 1);
            assert.strictEqual(matchingCriteria[0], "criterion-1");
        });

        it('should match received event to appropriate qualifying event - test 5', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "ccc",
                    var2: "ddd"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb",
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 1);
            assert.strictEqual(matchingCriteria[0], "criterion-1");
        });

        it('should match received event to appropriate qualifying event - test 6', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "ddd"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb",
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 1);
            assert.strictEqual(matchingCriteria[0], "criterion-1");
        });

        it('should match received event to appropriate qualifying event - test 7', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb",
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 2);
            assert.strictEqual(matchingCriteria[0], "criterion-1");
            assert.strictEqual(matchingCriteria[1], "criterion-2");
        });

        it('should match received event to appropriate qualifying event - test 8', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb",
                    var3: "ccc"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb",
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 1);
            assert.strictEqual(matchingCriteria[0], "criterion-1");

        });

        it('should match received event to appropriate qualifying event - test 9', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb",
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 2);
            assert.strictEqual(matchingCriteria.indexOf("criterion-1") > -1, true);
            assert.strictEqual(matchingCriteria.indexOf("criterion-2") > -1, true);
        });

        it('should match received event to appropriate qualifying event - test 10', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }, {
                id: "criterion-3",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb",
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 3);
            assert.strictEqual(matchingCriteria.indexOf("criterion-1") > -1, true);
            assert.strictEqual(matchingCriteria.indexOf("criterion-2") > -1, true);
            assert.strictEqual(matchingCriteria.indexOf("criterion-3") > -1, true);
        });

        it('should match received event to appropriate qualifying event - test 11', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }, {
                id: "criterion-3",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa"
                },
                aggregation: "count",
                threshold: 5
            },{
                id: "criterion-4",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb",
                    var3: "ccc"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb",
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 3);
            assert.strictEqual(matchingCriteria.indexOf("criterion-1") > -1, true);
            assert.strictEqual(matchingCriteria.indexOf("criterion-2") > -1, true);
            assert.strictEqual(matchingCriteria.indexOf("criterion-3") > -1, true);
            assert.strictEqual(matchingCriteria.indexOf("criterion-4"), -1);
        });

        it('should match received event to appropriate qualifying event - test 12', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var2: "bbb"
                },
                aggregation: "count",
                threshold: 5
            }, {
                id: "criterion-3",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa"
                },
                aggregation: "count",
                threshold: 5
            },{
                id: "criterion-4",
                targetEntityId: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb",
                    var3: "ccc"
                },
                aggregation: "count",
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent = {
                var1: "aaa",
                var2: "bbb",
                var3: "ccc"
            };
            const matchingCriteria = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent);

            assert.strictEqual(matchingCriteria.length, 4);
            assert.strictEqual(matchingCriteria.indexOf("criterion-1") > -1, true);
            assert.strictEqual(matchingCriteria.indexOf("criterion-2") > -1, true);
            assert.strictEqual(matchingCriteria.indexOf("criterion-3") > -1, true);
            assert.strictEqual(matchingCriteria.indexOf("criterion-4") > -1, true);
        });

    });

});