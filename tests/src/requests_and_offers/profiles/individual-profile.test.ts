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
  createIndividualProfile,
  getAllIndividualProfiles,
  getIndividualProfile,
  sampleIndividualProfile,
} from "./common.js";

const hAppPath = process.cwd() + "/../workdir/request-and-offers.happ";
const appSource = { appBundleSource: { path: hAppPath } };

function decodeOutputs(records: Record[]): unknown[] {
  return records.map((r) => decode((r.entry as any).Present.entry));
}

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

test("create and read IndividualProfile", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    const sample = await sampleIndividualProfile({ name: "Alice" });

    // Alice creates a IndividualProfile
    const record: Record = await createIndividualProfile(
      alice.cells[0],
      sample
    );
    assert.ok(record);

    await pause(1200);

    // Bob gets the created IndividualProfile
    const createReadOutput: Record = await getIndividualProfile(
      bob.cells[0],
      record
    );

    assert.containsAllKeys(
      sample,
      decode((createReadOutput.entry as any).Present.entry) as any
    );

    // Bob create an IndividualProfile with erroneous IndividualType
    const errSample: IndividualProfile = sampleIndividualProfile({
      individual_type: IndividualType.NonAuth,
    });

    await expect(
      createIndividualProfile(bob.cells[0], errSample)
    ).rejects.toThrow();

    await pause(1200);

    // Bob creates a IndividualProfile
    const sample2 = await sampleIndividualProfile({ name: "Bob" });
    const record2: Record = await createIndividualProfile(
      bob.cells[0],
      sample2
    );
    assert.ok(record2);

    await pause(1200);

    // Alice try to get all the individual profiles
    const record3: Record[] = await getAllIndividualProfiles(alice.cells[0]);
    assert.equal(record3.length, 2);
  });
});
