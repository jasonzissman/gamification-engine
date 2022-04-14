function generateCleanField(field) {

    if (field && typeof field === 'string') {
        return field.trim();
    } else if (!isNaN(field)) {
        return field; 
    } else {
        return undefined;
    }
}

function generateObjectWithCleanFields(object) {
    let cleanObject = {};

    for (let key in object) {
        let cleanKey = generateCleanField(key);
        let cleanValue = generateCleanField(object[key]);
        if (cleanValue && cleanValue !== null) {
            cleanObject[cleanKey] = cleanValue;
        }
    }

    return cleanObject;
}

function generateNormalizedFieldValueKey(criterionKey, criterionValue) {
    return `${criterionKey}=${criterionValue}`;
}

export {
    generateObjectWithCleanFields,
    generateCleanField,
    generateNormalizedFieldValueKey
};