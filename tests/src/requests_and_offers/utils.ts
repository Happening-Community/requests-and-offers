import { Player, Scenario, runScenario } from "@holochain/tryorama";
import { Record } from "@holochain/client";
import { decode } from "@msgpack/msgpack";

const hAppPath = process.cwd() + "/../workdir/requests_and_offers.happ";
const appSource = { appBundleSource: { path: hAppPath } };

export type DnaProperties = {
  progenitor_pubkey: string;
};

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

    console.log("Running scenario with Alice and Bob");

    await callback(scenario, alice, bob);

    scenario.cleanUp();
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
 * Represents the type of a WebAssembly error.
 */
enum WasmErrorType {
  PointerMap = "PointerMap",
  Deserialize = "Deserialize",
  Serialize = "Serialize",
  ErrorWhileError = "ErrorWhileError",
  Memory = "Memory",
  Guest = "Guest",
  Host = "Host",
  HostShortCircuit = "HostShortCircuit",
  Compile = "Compile",
  CallError = "CallError",
  UninitializedSerializedModuleCache = "UninitializedSerializedModuleCache",
  Unknown = "Unknown",
}

/**
 * Represents a WebAssembly error.
 *
 * @property {WasmErrorType} type - The type of the WebAssembly error.
 * @property {string} message - The error message.
 */
type WasmError = {
  type: WasmErrorType;
  message: string;
};

/**
 * Extracts a WebAssembly error message encapsulated within a "Guest(...)" string pattern.
 *
 * @param {string} message - The error message string from which to extract the WebAssembly error.
 * @returns {WasmError} The extracted WebAssembly error containing its type and message.
 */
export function extractWasmErrorMessage(message: string): WasmError {
  const messageRegex = /Guest\("(.+)"\)/;
  const matchedMessage = message.match(messageRegex);
  console.log("message : ", matchedMessage);

  const wasmErrorTypeRegex = /type: (.+),/; // Todo: fix the regex
  const matchedWasmErrorType = message.match(wasmErrorTypeRegex);
  console.log("wasmErrorType : ", matchedWasmErrorType);

  const wasmError: WasmError = {
    type: matchedWasmErrorType
      ? (matchedWasmErrorType[1] as WasmErrorType)
      : WasmErrorType.Unknown,
    message: matchedMessage ? matchedMessage[1] : "Unknown error",
  };

  return wasmError;
}
