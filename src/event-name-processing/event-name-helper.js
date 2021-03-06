function createMatchingEventCriteriaListenerRegexString(eventCriteria) {
    // keysSorted = Object.keys(list).sort(function(a,b){return list[a]-list[b]})
    const regexStr = Object.keys(eventCriteria).sort((a,b)=>{return eventCriteria[a]-eventCriteria[b]}).map(key => `${key}=${eventCriteria[key]}`).join("&");
    return new RegExp(regexStr);
}

function createEventBroadcastString(event) {    
    return Object.keys(event).sort((a,b)=>{return event[a]-event[b]}).map(key => `${key}=${event[key]}`).join("&");
}


module.exports = { createEventBroadcastString, createMatchingEventCriteriaListenerRegexString };
