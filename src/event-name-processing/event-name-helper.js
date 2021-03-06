function injectOmittedKnownEventKeys(eventCriteria, knownEventKeys) {
    if (knownEventKeys && knownEventKeys.length > 0) {
        knownEventKeys.forEach(knownKey => {
            if (eventCriteria[knownKey] === undefined) {
                eventCriteria[knownKey] = "___MISSING___"
            }
        });
    }

}

function createMatchingEventCriteriaListenerRegexString(eventCriteria, knownEventKeys) {
    let regexStr = "";
    injectOmittedKnownEventKeys(eventCriteria, knownEventKeys);
    const sortedKeys = Object.keys(eventCriteria).sort();
    for (const key of sortedKeys) {
        if (eventCriteria[key] === "___MISSING___") {
            regexStr += `(&${key}=.*)?`;
        } else {
            regexStr += `&${key}=${eventCriteria[key]}`;
        }
    }
    if (regexStr[0] === "(") {
        return new RegExp(regexStr.slice(0, 1) + regexStr.slice(2));
    } else {
        return new RegExp(regexStr.substring(1));
    }

}

function createEventBroadcastString(event) {
    return Object.keys(event).sort().map(key => `${key}=${event[key]}`).join("&");
}


module.exports = { createEventBroadcastString, createMatchingEventCriteriaListenerRegexString };
