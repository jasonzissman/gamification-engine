const FORBIDDEN_CHARS = /[^0-9a-zA-Z_-\s]/;
const FORBIDDEN_CHARS_GLOBAL = /[^0-9a-zA-Z_-\s]/g;

function generateCleanField(field) {
    if (field) {
        return field.replace(FORBIDDEN_CHARS_GLOBAL, '');
    } else {
        return;
    }
}

function generateObjectWithCleanFields(object) {
    let cleanObject = {};

    for(let key in object) {
        let cleanKey = generateCleanField(key);
        let cleanValue = generateCleanField(object[key]);
        cleanObject[cleanKey] = cleanValue;
    }

    return cleanObject;
}

function areAllFieldsAndValuesInSafeCharSet(object) {
    return !FORBIDDEN_CHARS.test(JSON.stringify(object).replace(/[{}:",\[\]\s]/g, ''));
}

function generateNormalizedFieldValueKey(criterionKey, criterionValue) {
    return `${criterionKey}=${criterionValue}`;
}

module.exports = { 
    generateObjectWithCleanFields,
    generateCleanField,
    areAllFieldsAndValuesInSafeCharSet,
    generateNormalizedFieldValueKey
};