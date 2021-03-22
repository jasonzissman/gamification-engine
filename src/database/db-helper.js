const { MongoClient } = require("mongodb");
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

async function getAllCriteria() {
    const criteriaCollection = DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME);
    return criteriaCollection.find({}).toArray();
}

async function getSpecificGoals(goalIds) {
    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    return goalCollection.find({ 'id': { $in: goalIds } }).toArray();
}

async function getSpecificEntityProgress(entityIds) {
    const entityProgressCollection = DB_CONNECTION.collection(COLLECTION_ENTITY_PROGRESS_NAME);
    return entityProgressCollection.find({ 'id': { $in: entityIds } }).toArray();
}

async function updateSpecificEntityProgress(entityProgressMap) {
    const entityProgressCollection = DB_CONNECTION.collection(COLLECTION_ENTITY_PROGRESS_NAME);

    const operations = [];
    for (var entityId in entityProgressMap) {
        operations.push({
            replaceOne: {
                "filter": {
                    "id": entityId
                },
                "replacement": entityProgressMap[entityId],
                "upsert": true
            }
        });
    }

    return entityProgressCollection.bulkWrite(operations)
}

async function getSpecificCriteria(criteriaIds) {
    const criteriaCollection = DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME);
    return criteriaCollection.find({ 'id': { $in: criteriaIds } }).toArray();
}

async function addNewGoalAndCriteria(goal, criteria) {
    let retVal = {};

    logger.info(`Inserting goal ${goal.id} and criteria ${goal.criteria} into DB.`);

    const goalCollection = DB_CONNECTION.collection(COLLECTION_GOALS_NAME);
    const insertGoalPromise = goalCollection.insertOne(goal).then(() => {
        logger.info(`Successfully inserted goal ${goal.id} into DB.`);
    });

    const criteriaCollection = DB_CONNECTION.collection(COLLECTION_CRITERIA_NAME);
    const insertCriteriaPromise = criteriaCollection.insertMany(criteria).then(() => {
        logger.info(`Successfully inserted criteria ${goal.criteria} into DB.`);
    });

    await Promise.all([insertGoalPromise, insertCriteriaPromise]).then(() => {
        retVal = { status: "ok" };
    }).catch((err) => {
        retVal = { status: "Failed to insert goal", message: err };
        logger.error(`Failed to insert goal ${goal.id} and criteria ${goal.criteria} into DB.`);
    });

    return retVal;
}

module.exports = {
    initDbConnection,
    getAllCriteria,
    getSpecificCriteria,
    getSpecificGoals,
    getSpecificEntityProgress,
    updateSpecificEntityProgress,
    addNewGoalAndCriteria
};