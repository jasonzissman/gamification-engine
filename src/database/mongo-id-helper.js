
const { ObjectID } = require("mongodb");

//////////////////////////////////////////////////////////////////
// We intentionally hide "_id" and ObjectIDs from the outside. 
// These are Mongo-specific constructs that the rest of our app 
// does not need to know about. However, we still use ObjectIDs 
// when talking to Mongo since they provide performance improvements.
// This module helps encapsulate all Mongo ObjectID logic in one place.
//////////////////////////////////////////////////////////////////

function convertMongoObjectIdToString(mongoObjectId) {
    return mongoObjectId.toHexString();
}

function replaceMongoObjectIdWithNormalId(item) {
    if (item["_id"] instanceof ObjectID) {
        item["id"] = convertMongoObjectIdToString(item["_id"]);
        delete item["_id"];
    }
}

function generateMongoObjectId(stringId) {
    return ObjectID(stringId);
}

function stripOutMongoObjectId(obj) {
    delete obj["_id"];
}

module.exports = {
    convertMongoObjectIdToString,
    replaceMongoObjectIdWithNormalId,
    generateMongoObjectId,
    stripOutMongoObjectId
};
