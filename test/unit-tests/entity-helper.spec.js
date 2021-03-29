const assert = require('assert');
const entityHelper = require('../../src/entity/entity-helper');

describe('initEntityProgressTowardsCriterion', () => {

    it('should not modify well-formed existing entries', () => {

        let entityMap = {
            "john-doe-1234": {
                entityId: 'john-doe-1234',
                points: 0,
                goals: {
                    "goal-1234": {
                        criteriaIds: {
                            "criteria-9999": {
                                isComplete: false,
                                value: 1
                            }
                        },
                        isComplete: false
                    }
                }
            }
        };
        entityHelper.initEntityProgressTowardsCriterion(entityMap, "john-doe-1234", "goal-1234", "criteria-9999");
        assert.deepStrictEqual(entityMap, {
            "john-doe-1234": {
                entityId: 'john-doe-1234',
                points: 0,
                goals: {
                    "goal-1234": {
                        criteriaIds: {
                            "criteria-9999": {
                                isComplete: false,
                                value: 1
                            }
                        },
                        isComplete: false
                    }
                }
            }
        });
    });

    it('should add criterion to existing goal', () => {

        let entityMap = {
            "john-doe-1234": {
                entityId: 'john-doe-1234',
                points: 0,
                goals: {
                    "goal-1234": {
                        criteriaIds: {

                        },
                        isComplete: false
                    }
                }
            }
        };
        entityHelper.initEntityProgressTowardsCriterion(entityMap, "john-doe-1234", "goal-1234", "criteria-9999");
        assert.deepStrictEqual(entityMap, {
            "john-doe-1234": {
                entityId: 'john-doe-1234',
                points: 0,
                goals: {
                    "goal-1234": {
                        criteriaIds: {
                            "criteria-9999": {
                                isComplete: false,
                                value: 0
                            }
                        },
                        isComplete: false
                    }
                }
            }
        });
    });

    it('should add goals to the existing userId', () => {

        let entityMap = {
            "john-doe-1234": {
                entityId: 'john-doe-1234',
                points: 0,
                goals: {

                }
            }
        };
        entityHelper.initEntityProgressTowardsCriterion(entityMap, "john-doe-1234", "goal-1234", "criteria-9999");
        assert.deepStrictEqual(entityMap, {
            "john-doe-1234": {
                entityId: 'john-doe-1234',
                points: 0,
                goals: {
                    "goal-1234": {
                        criteriaIds: {
                            "criteria-9999": {
                                isComplete: false,
                                value: 0
                            }
                        },
                        isComplete: false
                    }
                }
            }
        });
    });

    it('should add all progress to the provided map', () => {

        let entityMap = {

        };
        entityHelper.initEntityProgressTowardsCriterion(entityMap, "john-doe-1234", "goal-1234", "criteria-9999");
        assert.deepStrictEqual(entityMap, {
            "john-doe-1234": {
                entityId: 'john-doe-1234',
                points: 0,
                goals: {
                    "goal-1234": {
                        criteriaIds: {
                            "criteria-9999": {
                                isComplete: false,
                                value: 0
                            }
                        },
                        isComplete: false
                    }
                }
            }
        });
    });

});