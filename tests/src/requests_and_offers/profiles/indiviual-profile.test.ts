import { assert, test } from "vitest";

import {
  runScenario,
  pause,
  CallableCell,
  Scenario,
  Player,
} from "@holochain/tryorama";
import {
  NewEntryAction,
  ActionHash,
  Record,
  AppBundleSource,
  fakeDnaHash,
  fakeActionHash,
  fakeAgentPubKey,
  fakeEntryHash,
} from "@holochain/client";
import { decode } from "@msgpack/msgpack";

import { createIndiviualProfile, sampleIndiviualProfile } from "./common.js";

const hAppPath = process.cwd() + "/../workdir/request-and-offers.happ";
const appSource = { appBundleSource: { path: hAppPath } };

async function runScenarioWithTwoAgents(
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

test("create and read IndiviualProfile", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    const sample = await sampleIndiviualProfile(alice.cells[0]);

    // Alice creates a IndiviualProfile
    const record: Record = await createIndiviualProfile(alice.cells[0], sample);
    assert.ok(record);

    await pause(1200);

    // Bob gets the created IndiviualProfile
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "profiles",
      fn_name: "get_indiviual_profile",
      payload: record.signed_action.hashed.hash,
    });

    console.log(decode((createReadOutput.entry as any).Present.entry) as any);

    assert.deepEqual(
      sample,
      decode((createReadOutput.entry as any).Present.entry) as any
    );
  });
});
