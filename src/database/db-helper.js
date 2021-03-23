const { MongoClient, ObjectID, ObjectId } = require("mongodb");
const logger = require('../utility/logger.js');

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
        let clientConn = await MongoClient.connect(url, options);
        DB_CONNECTION = clientConn.db(DB_NAME);
        logger.info(`Successfully connected to DB at ${url}.`);
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

async function ping() {
    let status = await DB_CONNECTION.command({ ping: 1 });
    if (status && status["ok"] == 1) {
        return {
            status: "ok"
        }
    } else {
        return {
            status: "unable to ping database"
        }
    }
}

function replaceMongoObjectIdWithNormalId(item) {
    if (item["_id"] instanceof ObjectID) {
        item["id"] = item["_id"].toHexString();
        delete item["_id"];
    }
}

async function getAllCriteria() {
    const criteriaCollection = DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME);
    let criteria = await criteriaCollection.find({}).toArray();
    criteria.forEach(replaceMongoObjectIdWithNormalId)
    return criteria;
}

async function getAllCriteriaForGoal(goalId) {
    const criteriaCollection = DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME);
    let criteria = await criteriaCollection.find({ goalId: goalId }).toArray();
    criteria.forEach(replaceMongoObjectIdWithNormalId);
    return criteria;
}

async function getAllGoals() {
    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    let goals = await goalCollection.find({}).toArray();
    goals.forEach(replaceMongoObjectIdWithNormalId);
    return goals;
}

async function getSpecificGoal(goalId) {
    // TODO cache this, individual goals won't change often
    const mongoId = ObjectID(goalId);
    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    const goal = await goalCollection.findOne({ '_id': mongoId });
    if (goal) {
        replaceMongoObjectIdWithNormalId(goal);
    }
    return goal;
}
async function getSpecificGoals(goalIds) {
    // TODO cache this, individual goals won't change often
    const mongoIds = goalIds.map(id => ObjectID(id));
    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    let goals = await goalCollection.find({ '_id': { $in: mongoIds } }).toArray();
    goals.forEach(replaceMongoObjectIdWithNormalId);
    return goals;
}

async function getSpecificEntityProgress(entityId) {
    const entityProgressCollection = DB_CONNECTION.collection(COLLECTION_ENTITY_PROGRESS_NAME);
    return entityProgressCollection.findOne({ 'entityId': entityId });
}

async function getSpecificEntitiesProgress(entityIds) {
    const entityProgressCollection = DB_CONNECTION.collection(COLLECTION_ENTITY_PROGRESS_NAME);
    return entityProgressCollection.find({ 'entityId': { $in: entityIds } }).toArray();
}

async function updateSpecificEntityProgress(entityProgressMap) {
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
    const mongoIds = criteriaIds.map(id => ObjectID(id));
    const criteriaCollection = DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME);
    let criteria = await criteriaCollection.find({ '_id': { $in: mongoIds } }).toArray();
    criteria.forEach(replaceMongoObjectIdWithNormalId);
    return criteria;
}

async function persistGoal(goal) {
    logger.info(`Inserting goal ${goal.name} into DB.`);
    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    let insertionResult = await goalCollection.insertOne(goal);
    logger.info(`Successfully inserted goal with id '${insertionResult.insertedId}' into DB.`);
    return insertionResult.insertedId.toString();
}

async function updateGoalCriteria(goalId, criteriaIds) {
    logger.info(`Upserting goal criteria '${goalId}'.`);
    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    await goalCollection.updateOne({
        "_id": ObjectID(goalId)
    }, {
        $set: {
            criteriaIds: criteriaIds
        }
    }
    );
    logger.info(`Successfully updated goal with id '${goalId}'.`);
    return;
}

async function persistCriteria(criteria) {
    logger.info(`Inserting criteria into DB.`);
    const criteriaCollection = DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME);
    let insertionResult = await criteriaCollection.insertMany(criteria);
    logger.info(`Successfully inserted criteria ${insertionResult.insertedIds} into DB.`);
    return Object.values(insertionResult.insertedIds).map(id => id.toString());
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
    persistCriteria
};