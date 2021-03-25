const assert = require('assert');
const goalHelper = require('../../src/goal/goal-helper');

describe('Goal Helper', () => {

    describe('Goal Validation', () => {

        it('should fail if goal undefined', () => {
            let newGoal = undefined;
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityIdField, and non-empty criteria.");
        });

        it('should fail if goal empty', () => {
            let newGoal = {};
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityIdField, and non-empty criteria.");
        });

        it('should fail if no targetEntityIdField', () => {
            let newGoal = {
                name: "Mobile Power User",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {
                            type: "count",
                        },
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityIdField, and non-empty criteria.");
        });

        it('should fail if empty targetEntityIdField', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityIdField: "",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {
                            type: "count",
                        },
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityIdField, and non-empty criteria.");
        });

        it('should fail if no name', () => {
            let newGoal = {
                targetEntityIdField: "userGuid",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {
                            type: "count",
                        },
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityIdField, and non-empty criteria.");
        });

        it('should fail if empty name', () => {
            let newGoal = {
                name: "",
                targetEntityIdField: "userGuid",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {
                            type: "count",
                        },
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityIdField, and non-empty criteria.");
        });

        it('should fail if no criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityIdField: "userId"

            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityIdField, and non-empty criteria.");
        });

        it('should fail if empty criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityIdField: "userId",
                criteria: []
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Must provide valid goal name, targetEntityIdField, and non-empty criteria.");
        });

        it('should fail if invalid characters 1', () => {
            let newGoal = {
                name: "&&&",
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {
                            type: "count",
                        },
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
                targetEntityIdField: "***",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {
                            type: "count",
                        },
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
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "@@@"
                        },
                        aggregation: {
                            type: "count",
                        },
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
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            [weirdFieldName]: "mobile"
                        },
                        aggregation: {
                            type: "count",
                        },
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "Goal fields can only contain dashes (-), underscores (_), and alpha-numeric characters.");
        });

        it('should fail if no qualifyingEvent in 1 criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityIdField: "userId",
                criteria: [
                    {
                        aggregation: {
                            type: "count",
                        },
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.");
        });

        it('should fail if empty qualifyingEvent in 1 criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {},
                        aggregation: {
                            type: "count",
                        },
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.");
        });

        it('should fail if no aggregation type in 1 criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {

                        },
                        threshold: 5
                    }
                ]
            }
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
            assert.strictEqual(goalValidation.message, "All criteria should have a valid aggregation, and a valid threshold, and non-nested qualifying events with at least one name/value attribute.");
        });

        it('should fail if empty aggregation type in 1 criteria', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {
                            type: "",

                        },
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
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile",
                        },
                        aggregation: {
                            type: "count",
                        },
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
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {
                            type: "count",
                        },
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
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {
                            type: "count",
                        },
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
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {
                            type: "count",
                        },
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
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "mobile"
                        },
                        aggregation: {
                            type: "count",
                        },
                        threshold: 5
                    },
                    {
                        qualifyingEvent: {
                            action: "log-out",
                        },
                        aggregation: {
                            type: "count",
                        },
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
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "some new device"
                        },
                        aggregation: {
                            type: "count",
                        },
                        threshold: 5
                    }
                ]
            };
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "ok");
        });

        it('should accept agg value if agg type is sum', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "some new device"
                        },
                        aggregation: {
                            type: "sum",
                            value: 2
                        },
                        threshold: 5
                    }
                ]
            };
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "ok");
        });

        it('should accept agg value field if agg type is sum', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "some new device"
                        },
                        aggregation: {
                            type: "sum",
                            valueField: "the-field"
                        },
                        threshold: 5
                    }
                ]
            };
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "ok");
        });

        it('should reject if no agg value field or agg value when agg type is sum', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "some new device"
                        },
                        aggregation: {
                            type: "sum",
                        },
                        threshold: 5
                    }
                ]
            };
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
        });

        it('should reject if "0" agg value field when agg type is sum', () => {
            let newGoal = {
                name: "Mobile Power User",
                targetEntityIdField: "userId",
                criteria: [
                    {
                        qualifyingEvent: {
                            action: "log-in",
                            platform: "some new device"
                        },
                        aggregation: {
                            type: "sum",
                            value: 0
                        },
                        threshold: 5
                    }
                ]
            };
            let goalValidation = goalHelper.validateGoal(newGoal);
            assert.strictEqual(goalValidation.status, "failed validation");
        });
    });

    describe('Persisting Goals', () => {

        let newGoal = {
            name: "Mobile Power User",
            targetEntityIdField: "userId",
            description: "Log in at least 3 times on a mobile device",
            foo: "bar",
            delete: "me",
            criteria: [
                {
                    qualifyingEvent: {
                        action: "log-in",
                        platform: "mobile"
                    },
                    aggregation: {
                        type: "count",

                    },
                    threshold: 5
                },
                {
                    qualifyingEvent: {
                        action: "log-out",
                    },
                    aggregation: {
                        type: "count",
                        value: 1
                    },
                    threshold: 2
                }
            ]
        };

        it("should only include necessary fields", () => {

            assert.strictEqual(newGoal.id, undefined);
            assert.strictEqual(newGoal.name, "Mobile Power User");
            assert.strictEqual(newGoal.description, "Log in at least 3 times on a mobile device");
            assert.strictEqual(newGoal.targetEntityIdField, "userId");
            assert.strictEqual(newGoal.criteria.length, 2);
            assert.strictEqual(newGoal.foo, "bar");
            assert.strictEqual(newGoal.delete, "me");

            const goalToPersist = goalHelper.createGoalEntityFromRequestGoal(newGoal);

            assert.strictEqual(Object.keys(goalToPersist).length, 3);
            assert.strictEqual(goalToPersist.name, "Mobile Power User");
            assert.strictEqual(goalToPersist.description, "Log in at least 3 times on a mobile device");
            assert.strictEqual(goalToPersist.targetEntityIdField, "userId");
            assert.strictEqual(goalToPersist.foo, undefined);
            assert.strictEqual(goalToPersist.bar, undefined);
        });

    });

});