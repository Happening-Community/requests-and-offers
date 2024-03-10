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

import {
  Profile,
  createProfile,
  decodeOutputs,
  getAllProfiles,
  getMyProfile,
  getProfile,
  sampleProfile,
  updateMyProfile,
} from "./common.js";

const hAppPath = process.cwd() + "/../workdir/requests_and_offers.happ";
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

test("create and read Profile", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    let sample: Profile;
    let record: Record;
    let records: Record[];

    // Alice creates a Profile
    sample = sampleProfile({ name: "Alice" });
    record = await createProfile(alice.cells[0], sample);
    assert.ok(record);

    await pause(1200);

    // Alice get her profile
    let aliceProfileRecord = await getMyProfile(alice.cells[0]);
    assert.ok(aliceProfileRecord);

    await pause(1200);

    // Bob gets the created Profile
    const createReadOutput: Record = await getProfile(bob.cells[0], record);

    assert.containsAllKeys(sample, decodeOutputs([createReadOutput])[0]);

    // Bob try to get his profile before he create it
    record = await getMyProfile(bob.cells[0]);
    assert.notExists(record);

    // Bob create an Profile with erroneous IndividualType
    let errSample: Profile = sampleProfile({
      individual_type: "Non Authorized",
    });

    await expect(createProfile(bob.cells[0], errSample)).rejects.toThrow();

    await pause(1200);

    // Bob create an Profile with erroneous profile Picture
    errSample = sampleProfile({
      name: "Bob",
      profile_picture: new Uint8Array(20),
    });
    await expect(createProfile(bob.cells[0], errSample)).rejects.toThrow();

    await pause(1200);

    // Bob creates a Profile with a real image file
    const response = await fetch("https://picsum.photos/200/300");
    const buffer = await response.arrayBuffer();

    // TODO: test with local image
    // const buffer = await fs.readFile(TestProfilePicture);

    sample = sampleProfile({
      name: "Bob",
      profile_picture: new Uint8Array(buffer),
    });
    record = await createProfile(bob.cells[0], sample);
    assert.ok(record);

    await pause(1200);

    // Alice get all the individual profiles
    records = await getAllProfiles(alice.cells[0]);
    assert.equal(records.length, 2);
  });
});

test("create and update Profile", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    let sample: Profile;
    let record: Record;

    sample = sampleProfile({ name: "Alice" });
    await createProfile(alice.cells[0], sample);

    const response = await fetch("https://picsum.photos/200/300");
    const buffer = await response.arrayBuffer();

    await pause(1200);

    // Alice update her profile with a valid profile picture
    sample = sampleProfile({
      name: "Alicia",
      nickname: "Alicialia",
      profile_picture: new Uint8Array(buffer),
    });
    record = await updateMyProfile(alice.cells[0], sample);

    let aliceProfile = decodeOutputs([
      await getMyProfile(alice.cells[0]),
    ])[0] as Profile;
    assert.equal(aliceProfile, sample);

    await pause(1200);

    // Bob try to update Alice's profile
    sample = sampleProfile({
      name: "Bob",
    });
    await expect(updateMyProfile(bob.cells[0], sample)).rejects.toThrow();
  });
});
