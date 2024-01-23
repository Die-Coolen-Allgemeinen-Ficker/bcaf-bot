import {
    expect,
    test
} from '@jest/globals';

import {
    bIfy,
    isValidB
} from '../src/util/enforceB';

test('B-ify a string', () => {
    expect(bIfy('Binga Bongo Mann 69 🅱ruh')).toBe('🅱inga 🅱ongo 🅱ann 69 🅱ruh');
});

test('If the given strings are valid B-ified strings', () => {
    expect(isValidB('🅱inga 🅱ongo 🅱ann 69')).toBe(true);
    expect(isValidB('Binga 🅱ongo 🅱ann 69')).toBe(false);
    expect(isValidB('🅱inga Bongo 🅱ann 69')).toBe(false);
});