function createSanitizedEvent(event, knownEventKeys) {
    let retVal = undefined;
    if (knownEventKeys && knownEventKeys.length > 0) {
        knownEventKeys.forEach(knownKey => {
            if (event[knownKey] !== undefined) {
                if (!retVal) {
                    retVal = {};
                }
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

    let retVal = undefined;

    if (eventCriteria != undefined && Object.keys(eventCriteria).length > 0) {
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

        retVal = new RegExp(regexStr);
    }

    return retVal;
}

function createEventBroadcastString(event, knownEventKeys) {
    let retVal = undefined;
    const sanitizedEvent = createSanitizedEvent(event, knownEventKeys);
    if (sanitizedEvent) {
        retVal = "&" + Object.keys(sanitizedEvent).sort().map(key => `${key}=${sanitizedEvent[key]}`).join("&");
    }
    return retVal;
}

module.exports = { createEventBroadcastString, createMatchingEventCriteriaListenerRegexString };
