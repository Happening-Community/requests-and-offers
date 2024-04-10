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

export async function fetchImageAndConvertToUInt8Array(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}
