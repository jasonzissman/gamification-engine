const assert = require('assert');
const eventFieldsHelper = require('./event-fields-helper');

describe("event processing", () => {
    describe("generateCleanField", () => {
        it("should support certain characters", ()=>{
            let actual = eventFieldsHelper.generateCleanField("abc 123 ABC _ + - \ / !@#$%^&*()[]");
            assert.deepStrictEqual(actual, "abc 123 ABC _ + - \ / !@#$%^&*()[]");
        });

        it("should trim white space", ()=>{
            assert.deepStrictEqual(eventFieldsHelper.generateCleanField("abc "), "abc");
            assert.deepStrictEqual(eventFieldsHelper.generateCleanField(" abc"), "abc");
            assert.deepStrictEqual(eventFieldsHelper.generateCleanField(" abc "), "abc");
            assert.deepStrictEqual(eventFieldsHelper.generateCleanField(" abc      "), "abc");
            assert.deepStrictEqual(eventFieldsHelper.generateCleanField("      abc      "), "abc");
            assert.deepStrictEqual(eventFieldsHelper.generateCleanField(" 5 "), "5");
        });


    });
});