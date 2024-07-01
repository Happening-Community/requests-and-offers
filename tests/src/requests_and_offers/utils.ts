import { Player, Scenario, runScenario } from "@holochain/tryorama";
import { Record } from "@holochain/client";
import { decode } from "@msgpack/msgpack";

const hAppPath = process.cwd() + "/../workdir/requests_and_offers.happ";
const appSource = { appBundleSource: { path: hAppPath } };

/**
 * Runs a scenario with two agents (players) using Tryorama.
 *
 * @param {Function} callback - A callback function that takes three arguments: the scenario instance and two player instances representing Alice and Bob.
 * @returns {Promise<void>} A promise that resolves when the scenario completes.
 */
export async function runScenarioWithTwoAgents(
  callback: (scenario: Scenario, alice: Player, bob: Player) => Promise<void>
) {
  await runScenario(async (scenario) => {
    const [alice, bob] = await scenario.addPlayersWithApps([
      appSource,
      appSource,
    ]);
    await scenario.shareAllAgents();

    await callback(scenario, alice, bob);
  });
}

/**
 * Decodes a set of records using MessagePack.
 *
 * @param {Record[]} records - An array of Record objects from which to extract and decode the entry data.
 * @returns {unknown[]} An array of decoded entries.
 */
export function decodeRecords(records: Record[]): unknown[] {
  return records.map((r) => decode((r.entry as any).Present.entry));
}

/**
 * Extracts a WebAssembly error message encapsulated within a "Guest(...)" string pattern.
 *
 * @param {string} message - The error message string from which to extract the WebAssembly error.
 * @returns {string|null} The extracted error message if found, otherwise null.
 */
export function extractWasmErrorMessage(message: string): string | null {
  const regex = /Guest\("(.+)"\)/;
  const match = message.match(regex);

  return match ? match[1] : null;
}
