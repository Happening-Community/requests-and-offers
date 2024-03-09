import type { Record } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

/**
 * Check if the given object is empty.
 *
 * @param {object} obj - The object to be checked for emptiness
 * @return {boolean} True if the object is empty, otherwise false
 */
export function isEmptyObj(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Decodes the outputs from the records.
 * @param {Record[]} records - The records to decode.
 * @returns {unknown[]} - The decoded outputs.
 */
export function decodeOutputs(records: Record[]): unknown[] {
  return records.map((r) => decode((r.entry as any).Present.entry));
}
