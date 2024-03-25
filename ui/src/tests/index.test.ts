import type { Record } from '@holochain/client';
import { decodeRecords } from '../utils';
import { expect, test } from 'vitest';

test('decodeRecords function', () => {
  expect(decodeRecords([])).toEqual([]);

  const record: Record = { entry: { Present: { entry: new Uint8Array([11]) } } };
  expect(decodeRecords([record])).toEqual([11]);
});
