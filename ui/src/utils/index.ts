import type { Record } from '@holochain/client';
import { decode } from '@msgpack/msgpack';

/**
 * Decodes the outputs from the records.
 * @param {Record[]} records - The records to decode.
 * @returns {unknown[]} - The decoded outputs.
 */
export function decodeRecords(records: Record[]): any[] {
  return records.map((r) => decode((r.entry as any).Present.entry));
}
