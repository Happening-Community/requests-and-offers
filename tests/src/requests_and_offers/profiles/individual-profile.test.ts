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
  getMyProfile,
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
    let sample = await sampleIndividualProfile({ name: "Alice" });

    let record: Record;
    let records: Record[];

    // Alice creates a IndividualProfile
    record = await createIndividualProfile(alice.cells[0], sample);
    assert.ok(record);

    await pause(1200);

    // Alice get her profile
    record = await getMyProfile(alice.cells[0]);

    await pause(1200);

    // Bob gets the created IndividualProfile
    const createReadOutput: Record = await getIndividualProfile(
      bob.cells[0],
      record
    );

    assert.containsAllKeys(sample, decodeOutputs([createReadOutput])[0]);

    // Bob try to get his profile before he create it
    await expect(getMyProfile(bob.cells[0])).rejects.toThrow();

    // Bob create an IndividualProfile with erroneous IndividualType
    let errSample: IndividualProfile = sampleIndividualProfile({
      individual_type: IndividualType.NonAuth,
    });

    await expect(
      createIndividualProfile(bob.cells[0], errSample)
    ).rejects.toThrow();

    await pause(1200);

    // Bob creates a IndividualProfile
    sample = await sampleIndividualProfile({ name: "Bob" });
    record = await createIndividualProfile(bob.cells[0], sample);
    assert.ok(record);

    await pause(1200);

    // Alice try to get all the individual profiles
    records = await getAllIndividualProfiles(alice.cells[0]);
    assert.equal(records.length, 2);

    // Alice try to update her profile with an invalid profile picture

    // Bob try to update Alice's profile
  });
});
