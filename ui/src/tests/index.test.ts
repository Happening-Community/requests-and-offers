import { isEmptyObj } from '$lib/utils';
import { expect, test } from 'vitest';

test('bufferToBase64 and base64ToBuffer functions', () => {
  console.log('test');
});

test('isEmptyObj function', () => {
  expect(isEmptyObj({})).toBeTruthy();
  expect(isEmptyObj({ 0: 11 })).toBeFalsy();
});
