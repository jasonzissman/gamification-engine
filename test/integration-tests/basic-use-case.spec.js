import { v4 as uuidv4 } from "uuid";
import neo4j from "neo4j-driver";
import { Neo4jContainer } from "testcontainers";
import assert from 'assert';

import { addGoal } from './goal-test-helper.js';
import { startTestAppServer, stopAppServer, assertEqualEntityProgress } from './integration-test-helper.js';
import { sendEvent } from './activity-test-helper.js';
import { getProgress } from './entity-progress-test-helper.js';
import { log } from '../../src/utility/logger.js'

// TODO - switch to Jest - Easier syntax and allows proper shutdown of express

describe('Basic Use Cases', function () {

    let neo4jTestInstance;
    let neo4jDriver;

    this.timeout(240000);

    this.beforeAll(async () => {
        log(`starting neo4j test container`)
        neo4jTestInstance = await new Neo4jContainer().withApoc().withStartupTimeout(240000).start();
        log(`neo4j test container started at: ${neo4jTestInstance.getBoltUri()}`)
        neo4jDriver = neo4j.driver(
            neo4jTestInstance.getBoltUri(),
            neo4j.auth.basic(neo4jTestInstance.getUsername(), neo4jTestInstance.getPassword())
        );
        log(`starting test app server`)
        await startTestAppServer(neo4jTestInstance.getBoltUri(), neo4jTestInstance.getUsername(), neo4jTestInstance.getPassword());
    });

    this.afterAll(async () => {
        log(`stopping test app server`)
        await stopAppServer();
        await neo4jDriver.close();
        log(`stopping neo4j test instance`)
        await neo4jTestInstance.stop();
    });

    this.beforeEach(async () => {
        const session = neo4jDriver.session();
        await session.run("MATCH (e) DETACH DELETE e");
        session.close();
    });

    this.afterEach(async () => {
        const session = neo4jDriver.session();
        await session.run("MATCH (e) DETACH DELETE e");
        session.close();
    });

    // it('should support sample "New Guy in Town" goal from the use cases documentation', () => {

    // it('should support sample "Mobile Power User" goal from the use cases documentation', () => {

    // it('should support sample "Best Selling Author" goal from the use cases documentation', () => {

    // it('should support sample "Best Selling Title" goal from the use cases documentation', () => {

    // it('should support sample "Bookworm" goal from the use cases documentation', () => {

    it('should mark a goal as complete after enough relevant events received', async () => {

        let userId = `test-user-${uuidv4()}`;

        let createdGoal = await addGoal({
            name: "Mobile Power User",
            description: "Use our fancy new mobile app to gain additional points!",
            points: 10,
            criteria: [
                {
                    description: "Log in at least 3 times on a mobile device",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "log-in",
                        platform: "mobile",
                    },
                    aggregation: {
                        type: "count",
                    },
                    threshold: 3
                }
            ]
        });

        let goalId = createdGoal.data.goalId;

        await sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress.data, {
            id: goalId,
            isComplete: false,
            name: "Mobile Power User",
            criteriaProgress: [{
                description: "Log in at least 3 times on a mobile device",
                progress: 1,
                threshold: 3,
            }]
        });

        await sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        await sendEvent({
            clientId: "client-app-1234",
            action: "log-in",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress2 = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress2.data, {
            id: goalId,
            name: "Mobile Power User",
            isComplete: true,
            completionTimestamp: 'a-valid-timestamp',
            criteriaProgress: [{
                description: "Log in at least 3 times on a mobile device",
                progress: 3,
                threshold: 3,
            }]

        });

    }).timeout(240000);

    it('should reject request to create a goal not adhering to goal schema', async () => {

        let userId = `test-user-${uuidv4()}`;

        const res = await addGoal({
            name: "Invalid Goal",
            description: "Use our fancy new mobile app to gain additional points!",
            points: 10,
            criteria: "this-is-not-valid-criteria"
        });
        assert.equal(res.status, 400);
        assert.equal(res.statusText, "Bad Request");

    }).timeout(240000);

    it('should mark a goal with multiple criteria as complete after enough relevant events received', async () => {

        let userId = `test-user-${uuidv4()}`;

        let createdGoal = await addGoal({
            name: "Repeat Customer",
            description: "Returning customers who make multiple purchases will receieve special perks and prioritized customer support.",
            points: 10,
            criteria: [
                {
                    description: "Log in at least 3 times.",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "userLoggedIn",
                    },
                    aggregation: {
                        type: "count"
                    },
                    threshold: 3
                },
                {
                    description: "Make at least 2 purchases.",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "itemPurchased",
                    },
                    aggregation: {
                        type: "count"
                    },
                    threshold: 2
                }
            ]
        });

        let goalId = createdGoal.data.goalId;

        await sendEvent({
            clientId: "client-app-1234",
            action: "userLoggedIn",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress.data, {
            id: goalId,
            isComplete: false,
            name: "Repeat Customer",
            criteriaProgress: [{
                description: "Log in at least 3 times.",
                progress: 1,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 3,
            }, {
                description: "Make at least 2 purchases.",
                progress: 0,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 2,
            }]

        });

        await sendEvent({
            clientId: "client-app-1234",
            action: "itemPurchased",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress2 = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress2.data, {
            id: goalId,
            isComplete: false,
            name: "Repeat Customer",
            criteriaProgress: [{
                description: "Log in at least 3 times.",
                progress: 1,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 3,
            }, {
                description: "Make at least 2 purchases.",
                progress: 1,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 2,
            }]

        });

        await sendEvent({
            clientId: "client-app-1234",
            action: "userLoggedIn",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        await sendEvent({
            clientId: "client-app-1234",
            action: "userLoggedIn",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress3 = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress3.data, {
            id: goalId,
            name: "Repeat Customer",
            isComplete: false,
            criteriaProgress: [{
                description: "Log in at least 3 times.",
                progress: 3,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 3,
            }, {
                description: "Make at least 2 purchases.",
                progress: 1,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 2,
            }]

        });

        await sendEvent({
            clientId: "client-app-1234",
            action: "itemPurchased",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        let progress4 = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress4.data, {
            id: goalId,
            name: "Repeat Customer",
            isComplete: true,
            completionTimestamp: 'a-valid-timestamp',
            criteriaProgress: [{
                description: "Log in at least 3 times.",
                progress: 3,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 3,
            }, {
                description: "Make at least 2 purchases.",
                progress: 2,
                id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                threshold: 2,
            }]
        });

    }).timeout(240000);

    it('should return progress made towards multiple goals', async () => {

        let userId = `test-user-${uuidv4()}`;

        let createdGoal1 = await addGoal({
            name: "Returning Visitor",
            description: "Returning visitors who log in twice will receive this badge.",
            points: 10,
            criteria: [
                {
                    description: "Log in at least 2 times.",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "userLoggedIn",
                    },
                    aggregation: {
                        type: "count"
                    },
                    threshold: 2
                }
            ]
        });

        let goalId1 = createdGoal1.data.goalId;

        let createdGoal2 = await addGoal({
            name: "Salesman",
            description: "Users who sell an item will receive this badge.",
            points: 10,
            criteria: [
                {
                    description: "Sell at least one item.",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "itemSold",
                    },
                    aggregation: {
                        type: "count"
                    },
                    threshold: 1
                }
            ]
        });

        let goalId2 = createdGoal2.data.goalId;

        let createdGoal3 = await addGoal({
            name: "Impossible Goal",
            description: "This goal is not relevant to any current users.",
            points: 10,
            criteria: [
                {
                    description: "Do something impossible.",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        impossible: "attribute",
                    },
                    aggregation: {
                        type: "count"
                    },
                    threshold: 1
                }
            ]
        });

        let goalId3 = createdGoal3.data.goalId;

        await sendEvent({
            clientId: "client-app-1234",
            action: "userLoggedIn",
            platform: "mobile",
            userId: userId,
            foo: "bar",
        }, true);

        await sendEvent({
            clientId: "client-app-1234",
            action: "itemSold",
            platform: "mobile",
            userId: userId,
            itemId: "123",
        }, true);

        let progress = await getProgress(userId);

        assertEqualEntityProgress(progress.data, [
            {
                id: goalId1,
                isComplete: false,
                name: "Returning Visitor",
                criteriaProgress: [
                    {
                        description: "Log in at least 2 times.",
                        progress: 1,
                        id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                        threshold: 2,
                    }
                ]
            },
            {
                id: goalId2,
                isComplete: true,
                completionTimestamp: "some-valid-timestamp",
                name: "Salesman",
                criteriaProgress: [
                    {
                        description: "Sell at least one item.",
                        progress: 1,
                        id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                        threshold: 1,
                    }
                ]
            },
            {
                id: goalId3,
                isComplete: false,
                name: "Impossible Goal",
                criteriaProgress: [
                    {
                        description: "Do something impossible.",
                        progress: 0,
                        id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                        threshold: 1,
                    }
                ]
            }]);

        let onlyCompletedGoalProgress = await getProgress(userId, undefined, true);
        assertEqualEntityProgress(onlyCompletedGoalProgress.data, [
            {
                id: goalId2,
                isComplete: true,
                completionTimestamp: "some-valid-timestamp",
                name: "Salesman",
                criteriaProgress: [
                    {
                        description: "Sell at least one item.",
                        progress: 1,
                        id: "2ad583c6-0c08-4a89-83bf-11be4da93923",
                        threshold: 1,
                    }
                ]
            }]);

    }).timeout(240000);

    it('should support "less than" goal criteria comparison', async () => {

        let userId = `test-user-${uuidv4()}`;

        let createdGoal = await addGoal({
            name: "Short Attention Span",
            description: "Read at least one book for less than 60 seconds",
            criteria: [
                {
                    description: "Read book for less than 60 seconds (60,000 ms)",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "exited-reader",
                        timeSpentOnPageMs: {
                            lessThan: 60000
                        }
                    },
                    aggregation: {
                        type: "count",
                    },
                    threshold: 1
                }
            ]
        });

        let goalId = createdGoal.data.goalId;

        await sendEvent({
            clientId: "client-app-1234",
            action: "exited-reader",
            timeSpentOnPageMs: 67045,
            userId: userId,
            foo: "bar",
        }, true);

        let progress = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress.data, {
            id: goalId,
            isComplete: false,
            name: "Short Attention Span",
            criteriaProgress: [{
                description: "Read book for less than 60 seconds (60,000 ms)",
                progress: 0,
                threshold: 1,
            }]
        });

        await sendEvent({
            clientId: "client-app-1234",
            action: "exited-reader",
            timeSpentOnPageMs: 17341,
            userId: userId,
            foo: "bar",
        }, true);

        let progress2 = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress2.data, {
            id: goalId,
            isComplete: true,
            completionTimestamp: 'a-valid-timestamp',
            name: "Short Attention Span",
            criteriaProgress: [{
                description: "Read book for less than 60 seconds (60,000 ms)",
                progress: 1,
                threshold: 1,
            }]
        });

    }).timeout(240000);

    it('should support "greater than" goal criteria comparison', async () => {

        let userId = `test-user-${uuidv4()}`;

        let createdGoal = await addGoal({
            name: "Long Attention Span",
            description: "Read at least one book for more than 60 seconds",
            criteria: [
                {
                    description: "Read book for more than 60 seconds (60,000 ms)",
                    targetEntityIdField: "userId",
                    qualifyingEvent: {
                        action: "exited-reader",
                        timeSpentOnPageMs: {
                            greaterThan: 60000
                        }
                    },
                    aggregation: {
                        type: "count",
                    },
                    threshold: 1
                }
            ]
        });

        let goalId = createdGoal.data.goalId;

        await sendEvent({
            clientId: "client-app-1234",
            action: "exited-reader",
            timeSpentOnPageMs: 17045,
            userId: userId,
            foo: "bar",
        }, true);

        let progress = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress.data, {
            id: goalId,
            isComplete: false,
            name: "Long Attention Span",
            criteriaProgress: [{
                description: "Read book for more than 60 seconds (60,000 ms)",
                progress: 0,
                threshold: 1,
            }]
        });

        await sendEvent({
            clientId: "client-app-1234",
            action: "exited-reader",
            timeSpentOnPageMs: 67341,
            userId: userId,
            foo: "bar",
        }, true);

        let progress2 = await getProgress(userId, goalId);

        assertEqualEntityProgress(progress2.data, {
            id: goalId,
            isComplete: true,
            completionTimestamp: 'a-valid-timestamp',
            name: "Long Attention Span",
            criteriaProgress: [{
                description: "Read book for more than 60 seconds (60,000 ms)",
                progress: 1,
                threshold: 1,
            }]
        });

    }).timeout(240000);

    // it('should support compound goal criteria comparisons (less than and greater than simultaneously)', () => {

    // it('should support enabling and disabling of goals', () => {

    // it('should support goal expiration', () => {

    // it('should support dot notation field nesting', () => {

    // it('should let multiple entities benefit from the same event if multiple goals are applicable', async () => {

    // it('should allow fetching of existing goals', async () => {

    // it('should support sum aggregations on specific event fields', async () => {

    // it('should support sum aggregations with predefined value', async () => {

});