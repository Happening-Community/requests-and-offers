import type { Record } from '@holochain/client';
import { decodeRecords, isEmptyObj } from '../utils';
import { expect, test } from 'vitest';

test('isEmptyObj function', () => {
  expect(isEmptyObj({})).toBeTruthy();
  expect(isEmptyObj({ 0: 11 })).toBeFalsy();
});

test('decodeRecords function', () => {
  expect(decodeRecords([])).toEqual([]);

  const record: Record = { entry: { Present: { entry: new Uint8Array([11]) } } };
  expect(decodeRecords([record])).toEqual([11]);
});
