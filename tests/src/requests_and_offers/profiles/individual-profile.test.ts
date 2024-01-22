import { promises as fs } from "fs";
import { assert, expect, test, vi } from "vitest";
import TestProfilePicture from "./assets/Test-Logo-Small-Black-transparent-1.png";

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
  updateIndividualProfile,
} from "./common.js";

const hAppPath = process.cwd() + "/../workdir/requests-and-offers.happ";
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
    let sample: IndividualProfile;
    let record: Record;
    let records: Record[];

    // Alice creates a IndividualProfile
    sample = sampleIndividualProfile({ name: "Alice" });
    record = await createIndividualProfile(alice.cells[0], sample);
    assert.ok(record);

    await pause(1200);

    // Alice get her profile
    let aliceProfileRecord = await getMyProfile(alice.cells[0]);
    assert.ok(aliceProfileRecord);

    await pause(1200);

    // Bob gets the created IndividualProfile
    const createReadOutput: Record = await getIndividualProfile(
      bob.cells[0],
      record
    );

    assert.containsAllKeys(sample, decodeOutputs([createReadOutput])[0]);

    // Bob try to get his profile before he create it
    record = await getMyProfile(bob.cells[0]);
    assert.notExists(record);

    // Bob create an IndividualProfile with erroneous IndividualType
    let errSample: IndividualProfile = sampleIndividualProfile({
      individual_type: "Non Authorized",
    });

    await expect(
      createIndividualProfile(bob.cells[0], errSample)
    ).rejects.toThrow();

    await pause(1200);

    // Bob create an IndividualProfile with erroneous profile Picture
    errSample = sampleIndividualProfile({
      name: "Bob",
      profile_picture: new Uint8Array(20),
    });
    await expect(
      createIndividualProfile(bob.cells[0], errSample)
    ).rejects.toThrow();

    await pause(1200);

    // Bob creates a IndividualProfile with a real image file
    const response = await fetch("https://picsum.photos/200/300");
    const buffer = await response.arrayBuffer();

    // TODO: test with local image
    // const buffer = await fs.readFile(TestProfilePicture);

    sample = sampleIndividualProfile({
      name: "Bob",
      profile_picture: new Uint8Array(buffer),
    });
    record = await createIndividualProfile(bob.cells[0], sample);
    assert.ok(record);

    await pause(1200);

    // Alice get all the individual profiles
    records = await getAllIndividualProfiles(alice.cells[0]);
    assert.equal(records.length, 2);
  });
});

test("create and update IndividualProfile", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    let sample: IndividualProfile;
    let record: Record;
    let records: Record[];

    sample = sampleIndividualProfile({ name: "Alice" });
    let aliceProfileRecord = await createIndividualProfile(
      alice.cells[0],
      sample
    );

    const response = await fetch("https://picsum.photos/200/300");
    const buffer = await response.arrayBuffer();

    await pause(1200);

    // Alice update her profile with a valid profile picture
    sample = sampleIndividualProfile({
      name: "Alicia",
      profile_picture: new Uint8Array(buffer),
    });
    record = await updateIndividualProfile(
      alice.cells[0],
      aliceProfileRecord.signed_action.hashed.hash,
      sample
    );

    let aliceProfile = decodeOutputs([
      await getMyProfile(alice.cells[0]),
    ])[0] as IndividualProfile;
    assert.equal(aliceProfile.name, "Alicia");

    aliceProfile = decodeOutputs([
      await getIndividualProfile(alice.cells[0], record),
    ])[0] as IndividualProfile;
    assert.equal(aliceProfile.name, "Alicia");

    await pause(1200);

    // Bob try to update Alice's profile
    sample = sampleIndividualProfile({
      name: "Bob",
    });
    await expect(
      updateIndividualProfile(
        bob.cells[0],
        aliceProfileRecord.signed_action.hashed.hash,
        sample
      )
    ).rejects.toThrow();
  });
});
