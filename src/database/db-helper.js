const { MongoClient } = require("mongodb");
const logger = require('../utility/logger.js');
const mongoIdHelper = require('./mongo-id-helper');

let CLIENT_CONN;
let DB_CONNECTION; // acts as connection pool
let DB_NAME = "gamification";
let COLLECTION_GOALS_NAME = "goals";
let COLLECTION_CRITERIA_NAME = "criteria";
let COLLECTION_ENTITY_PROGRESS_NAME = "entityProgress";

async function initDbConnection(url) {

    let retVal = {};

    logger.info(`Connecting to database.`);
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    try {
        CLIENT_CONN = await MongoClient.connect(url, options);
        DB_CONNECTION = CLIENT_CONN.db(DB_NAME);
        logger.info(`Successfully connected to DB at ${url}.`);
        await ensureIndicesExist();
        logger.info(`DB indices are configured.`);
        retVal = {
            status: "ok"
        }
    } catch (err) {
        retVal = {
            status: "Failed to connect to db.",
            message: err
        };
    }

    return retVal;
}

async function ensureIndicesExist() {
    // createIndex() will create the index if not already there
    return Promise.all([
        DB_CONNECTION.collection(COLLECTION_ENTITY_PROGRESS_NAME).createIndex({ entityId: 1 }),
        DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME).createIndex({ goalID: 1 })
    ]);
}

async function ping() {
    let status = await DB_CONNECTION.command({ ping: 1 });
    if (status && status["ok"] == 1) {
        return { status: "ok" };
    } else {
        return { status: "unable to ping database" };
    }
}

async function getAllCriteria() {
    const criteriaCollection = DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME);
    let criteria = await criteriaCollection.find({}).toArray();
    criteria.forEach(mongoIdHelper.replaceMongoObjectIdWithNormalId);
    return criteria;
}

async function getAllCriteriaForGoal(goalId) {
    const criteriaCollection = DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME);
    let criteria = await criteriaCollection.find({ goalId: goalId }).toArray();
    criteria.forEach(mongoIdHelper.replaceMongoObjectIdWithNormalId);
    return criteria;
}

async function getAllGoals() {
    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    let goals = await goalCollection.find({}).toArray();
    goals.forEach(mongoIdHelper.replaceMongoObjectIdWithNormalId);
    return goals;
}

async function getSpecificGoal(goalId) {
    // TODO cache this, individual goals won't change often
    const mongoId = mongoIdHelper.generateMongoObjectId(goalId);
    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    const goal = await goalCollection.findOne({ '_id': mongoId });
    if (goal) {
        mongoIdHelper.replaceMongoObjectIdWithNormalId(goal);
    }
    return goal;
}

async function getSpecificGoals(goalIds) {
    // TODO cache this, individual goals won't change often
    const mongoIds = goalIds.map(id => mongoIdHelper.generateMongoObjectId(id));
    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    let goals = await goalCollection.find({ '_id': { $in: mongoIds } }).toArray();
    goals.forEach(mongoIdHelper.replaceMongoObjectIdWithNormalId);
    return goals;
}

async function getSpecificEntityProgress(entityId) {
    const entityProgressCollection = DB_CONNECTION.collection(COLLECTION_ENTITY_PROGRESS_NAME);
    let entityProgress = await entityProgressCollection.findOne({ 'entityId': entityId });
    mongoIdHelper.stripOutMongoObjectId(entityProgress);
    return entityProgress;
}

async function getSpecificEntitiesProgress(entityIds) {
    const entityProgressCollection = DB_CONNECTION.collection(COLLECTION_ENTITY_PROGRESS_NAME);
    let entitiesProgress = await entityProgressCollection.find({ 'entityId': { $in: entityIds } }).toArray();
    entitiesProgress.forEach(mongoIdHelper.stripOutMongoObjectId);
    return entitiesProgress;
}

async function updateSpecificEntityProgress(entityProgressMap) {
    logger.info(`Updating entity progress for entities ${Object.keys(entityProgressMap)}.`);
    const entityProgressCollection = DB_CONNECTION.collection(COLLECTION_ENTITY_PROGRESS_NAME);

    const operations = [];
    for (var entityId in entityProgressMap) {
        operations.push({
            replaceOne: {
                "filter": {
                    "entityId": entityId
                },
                "replacement": entityProgressMap[entityId],
                "upsert": true
            }
        });
    }

    return entityProgressCollection.bulkWrite(operations)
}

async function getSpecificCriteria(criteriaIds) {
    // TODO cache this, individual criteria won't change often
    const mongoIds = criteriaIds.map(id => mongoIdHelper.generateMongoObjectId(id));
    const criteriaCollection = DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME);
    let criteria = await criteriaCollection.find({ '_id': { $in: mongoIds } }).toArray();
    criteria.forEach(mongoIdHelper.replaceMongoObjectIdWithNormalId);
    return criteria;
}

async function persistGoal(goal) {
    logger.info(`Inserting goal ${goal.name} into DB.`);
    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    let insertionResult = await goalCollection.insertOne(goal);
    logger.info(`Successfully inserted goal with id '${insertionResult.insertedId}' into DB.`);
    return mongoIdHelper.convertMongoObjectIdToString(insertionResult.insertedId);
}

async function updateGoalCriteria(goalId, criteriaIds) {
    logger.info(`Upserting goal criteria '${goalId}'.`);
    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    let resultingGoal = await goalCollection.findOneAndUpdate({
        "_id": mongoIdHelper.generateMongoObjectId(goalId)
    }, {
        $set: {
            criteriaIds: criteriaIds
        }
    },
        { returnOriginal: false }
    );
    logger.info(`Successfully updated criteria on goal with id '${goalId}'.`);
    mongoIdHelper.replaceMongoObjectIdWithNormalId(resultingGoal.value);
    return resultingGoal.value;
}

async function persistCriteria(criteria) {
    logger.info(`Inserting criteria into DB.`);
    const criteriaCollection = DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME);
    let insertionResult = await criteriaCollection.insertMany(criteria);
    logger.info(`Successfully inserted criteria ${insertionResult.insertedIds} into DB.`);
    criteria.forEach(mongoIdHelper.replaceMongoObjectIdWithNormalId);
    return Object.values(insertionResult.insertedIds).map(id => mongoIdHelper.convertMongoObjectIdToString(id));
}

async function closeAllDbConnections() {
    CLIENT_CONN.close();
}

module.exports = {
    initDbConnection,
    ping,
    getAllCriteria,
    getSpecificCriteria,
    getAllCriteriaForGoal,
    getAllGoals,
    getSpecificGoal,
    getSpecificGoals,
    getSpecificEntityProgress,
    getSpecificEntitiesProgress,
    updateSpecificEntityProgress,
    persistGoal,
    updateGoalCriteria,
    persistCriteria,
    closeAllDbConnections
};