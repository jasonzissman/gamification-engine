function createSanitizedEvent(event, knownEventKeys) {
    let retVal = {};
    if (knownEventKeys && knownEventKeys.length > 0) {
        knownEventKeys.forEach(knownKey => {
            if (event[knownKey] !== undefined) {
                retVal[knownKey] = event[knownKey];
            }
        });
    }
    return retVal;
}

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

    return new RegExp(regexStr);

}

function createEventBroadcastString(event, knownEventKeys) {
    const sanitizedEvent = createSanitizedEvent(event, knownEventKeys);
    return "&" + Object.keys(sanitizedEvent).sort().map(key => `${key}=${sanitizedEvent[key]}`).join("&");
}

module.exports = { createEventBroadcastString, createMatchingEventCriteriaListenerRegexString };
