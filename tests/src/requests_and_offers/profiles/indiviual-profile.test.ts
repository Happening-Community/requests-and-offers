import { assert, expect, test } from "vitest";

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

import {
  IndividualProfile,
  IndividualType,
  createIndiviualProfile,
  getIndivualProfile,
  sampleIndiviualProfile,
} from "./common.js";

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
    const sample = await sampleIndiviualProfile();

    // Alice creates a IndividualProfile
    const record: Record = await createIndiviualProfile(alice.cells[0], sample);
    assert.ok(record);

    await pause(1200);

    // Bob gets the created IndividualProfile
    const createReadOutput: Record = await getIndivualProfile(
      bob.cells[0],
      record
    );

    console.log(decode((createReadOutput.entry as any).Present.entry) as any);

    assert.deepEqual(
      sample,
      decode((createReadOutput.entry as any).Present.entry) as any
    );

    // Bob create an IndividualProfile with erroneous IndividualType
    const errSample: IndividualProfile = sampleIndiviualProfile({
      individual_type: IndividualType.NonAuth,
    });
    expect(createIndiviualProfile(bob.cells[0], errSample)).rejects.toThrow();
  });
});
