import assert from 'assert';
import {  generateCleanField } from './activity-fields-helper.js';

describe("activity field cleansing", () => {
    describe("generateCleanField", () => {
        it("should support certain characters", ()=>{
            let actual = generateCleanField("abc 123 ABC _ + - \ / !@#$%^&*()[]");
            assert.deepStrictEqual(actual, "abc 123 ABC _ + - \ / !@#$%^&*()[]");
        });

        it("should trim white space", ()=>{
            assert.deepStrictEqual(generateCleanField("abc "), "abc");
            assert.deepStrictEqual(generateCleanField(" abc"), "abc");
            assert.deepStrictEqual(generateCleanField(" abc "), "abc");
            assert.deepStrictEqual(generateCleanField(" abc      "), "abc");
            assert.deepStrictEqual(generateCleanField("      abc      "), "abc");
            assert.deepStrictEqual(generateCleanField(" 5 "), "5");
        });


    });
});