const assert = require('assert');
const eventCriteriaHelper = require('../../src/event/event-criteria-matcher');

describe('Criteria Matching', () => {

    describe('Basic Scenarios', () => {

        it('should match received event to appropriate qualifying event - test 1', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
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
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa"
                },
                aggregation: {
                    type: "count",
                },
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
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "ccc"
                },
                aggregation: {
                    type: "count",
                },
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
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
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
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "ccc",
                    var2: "ddd"
                },
                aggregation: {
                    type: "count",
                },
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
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "ddd"
                },
                aggregation: {
                    type: "count",
                },
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
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
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
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb",
                    var3: "ccc"
                },
                aggregation: {
                    type: "count",
                },
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
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
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
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-3",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa"
                },
                aggregation: {
                    type: "count",
                },
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
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-3",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-4",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb",
                    var3: "ccc"
                },
                aggregation: {
                    type: "count",
                },
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
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-2",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-3",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }, {
                id: "criterion-4",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb",
                    var3: "ccc"
                },
                aggregation: {
                    type: "count",
                },
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

    describe('Runtime Insertion of New Criteria', () => {

        it('Lookup should not break as new criteria inserted', () => {

            const criteria = [{
                id: "criterion-1",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            }];
            eventCriteriaHelper.initCriteriaLookupMap(criteria);

            const receivedEvent1 = {
                var1: "aaa",
                var2: "bbb"
            };
            const matchingCriteria1 = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent1);

            assert.strictEqual(matchingCriteria1.length, 1);
            assert.strictEqual(matchingCriteria1[0], "criterion-1");

            const newCriteria = {
                id: "criterion-2",
                targetEntityIdField: "userId",
                qualifyingEvent: {
                    var1: "aaa",
                    var2: "bbb",
                    var3: "ccc"
                },
                aggregation: {
                    type: "count",
                },
                threshold: 5
            };
            eventCriteriaHelper.addNewCriterionToLookupMap(newCriteria);

            const receivedEvent2 = {
                var1: "aaa",
                var2: "bbb"
            };
            const matchingCriteria2 = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent2);

            assert.strictEqual(matchingCriteria2.length, 1);
            assert.strictEqual(matchingCriteria2[0], "criterion-1");

            const receivedEvent3 = {
                var1: "aaa",
                var2: "bbb",
                var3: "ccc",
                var4: "ddd"
            };
            const matchingCriteria3 = eventCriteriaHelper.lookupMatchingCriteria(receivedEvent3);

            assert.strictEqual(matchingCriteria3.length, 2);
            assert.strictEqual(matchingCriteria3.indexOf("criterion-1") > -1, true);
            assert.strictEqual(matchingCriteria3.indexOf("criterion-2") > -1, true);
        });
    });
});