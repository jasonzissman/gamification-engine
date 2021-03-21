const assert = require('assert');
const goalHelper = require('../src/goal/goal-helper');



describe('Goal Helper', () => {

    describe('Goal Validation', () => {

        it('should fail if goal undefined', () => {
            let newGoal = undefined;
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityId, and non-empty criteria.");
        });

        it('should fail if goal empty', () => {
            let newGoal = {};
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityId, and non-empty criteria.");
        });

        it('should fail if no targetEntityId', () => {
            let newGoal = {
                name: "Mobile Power User",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityId, and non-empty criteria.");
        });

        it('should fail if empty targetEntityId', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityId, and non-empty criteria.");
        });

        it('should fail if no name', () => {
            let newGoal = {
                targetEntityId: "userGuid",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityId, and non-empty criteria.");
        });

        it('should fail if empty name', () => {
            let newGoal = {
                name: "",
                targetEntityId: "userGuid",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityId, and non-empty criteria.");
        });

        it('should fail if no criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId"

            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityId, and non-empty criteria.");
        });

        it('should fail if empty criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: []
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityId, and non-empty criteria.");
        });

        it('should fail if invalid characters 1', () => {
            let newGoal = {
                name: "&&&",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Goal fields can only contain dashes (-), underscores (_), and alpha-numeric characters.");
        });

        it('should fail if invalid characters 2', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "***",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Goal fields can only contain dashes (-), underscores (_), and alpha-numeric characters.");
        });

        it('should fail if invalid characters 3', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "@@@"
                        },
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Goal fields can only contain dashes (-), underscores (_), and alpha-numeric characters.");
        });

        it('should fail if invalid characters 4', () => {
            const weirdFieldName = "###";
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            [weirdFieldName]: "mobile"
                        },
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Goal fields can only contain dashes (-), underscores (_), and alpha-numeric characters.");
        });

        it('should fail if no qualifyinEvent in 1 criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.");
        });

        it('should fail if empty qualifyinEvent in 1 criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {},
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.");
        });

        it('should fail if no aggregation in 1 criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.");
        });

        it('should fail if empty aggregation in 1 criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.");
        });

        it('should fail if no threshold in 1 criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "count"
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.");
        });

        it('should fail if "0" aggregation in 1 criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "count",
                        threshold: 0
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.");
        });

        it('should fail if one of multiple criteria is invalid', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "count",
                        threshold: 5
                    },
                    {
                        // invalid criteria!
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.");
        });

        it('should succeed if all requirements met', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "ok");
        });

        it('should succeed if all requirements met on multi-criteria goal', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: "count",
                        threshold: 5
                    },
                    {
                        qualifyingEvent: {
                            action: "log-out",
                        },
                        aggregation: "count",
                        threshold: 2
                    }
                ]
            };
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "ok");
        });

        it('should support spaces in field values', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityId: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "some new device"
                        },
                        aggregation: "count",
                        threshold: 5
                    }
                ]
            };
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "ok");
        });

        

    });

    describe('Persisting Goals', () => {

        let newGoal = {
            name: "Mobile Power User",
            targetEntityId: "userId",
            foo: "bar",
            delete: "me",
            criteria: [
                {
                    qualifyingEvent: {
                        action: "log-in",
                        platform: "mobile"
                    },
                    aggregation: "count",
                    threshold: 5
                },
                {
                    qualifyingEvent: {
                        action: "log-out",
                    },
                    aggregation: "count",
                    threshold: 2
                }
            ]
        };    

        it("should add id to goal and only include necessary fields", () => {
        
            assert.strictEqual(newGoal.id, undefined);
            assert.strictEqual(newGoal.name, "Mobile Power User");
            assert.strictEqual(newGoal.targetEntityId, "userId");
            assert.strictEqual(newGoal.criteria.length, 2);
            assert.strictEqual(newGoal.foo, "bar");
            assert.strictEqual(newGoal.delete, "me");

            const criteriaIds = [111,222];
            const goalToPersist = goalHelper.createGoalEntityFromRequestGoal(newGoal, criteriaIds);

            assert.strictEqual(Object.keys(goalToPersist).length, 4);
            assert.strictEqual(goalToPersist.id.length, 36);
            assert.strictEqual(goalToPersist.name, "Mobile Power User");
            assert.strictEqual(goalToPersist.criteria.length, 2);
            assert.strictEqual(goalToPersist.criteria[0], 111);
            assert.strictEqual(goalToPersist.criteria[1], 222);
            assert.strictEqual(goalToPersist.targetEntityId, "userId");
            assert.strictEqual(goalToPersist.foo, undefined);
            assert.strictEqual(goalToPersist.bar, undefined);
        });

    });

});