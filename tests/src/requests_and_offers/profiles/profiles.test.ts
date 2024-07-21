import { assert, expect, test, vi } from "vitest";
import TestProfilePicture from "./assets/Test-Logo-Small-Black-transparent-1.png";

import { Scenario, Player, dhtSync } from "@holochain/tryorama";
import { Record } from "@holochain/client";

import {
  Profile,
  createProfile,
  getAllProfiles,
  getAgentProfile,
  getLatestProfile,
  sampleProfileInput,
  updateProfile,
  ProfileInput,
} from "./common.js";
import { decodeRecords, runScenarioWithTwoAgents } from "../utils";

test("create and read Profile", async () => {
  await runScenarioWithTwoAgents(
    async (_scenario: Scenario, alice: Player, bob: Player) => {
      let sample: ProfileInput;
      let record: Record;
      let records: Record[];

      // Alice creates a Profile
      sample = sampleProfileInput({ name: "Alice" });
      record = await createProfile(alice.cells[0], sample);
      const aliceCreatedProfile = decodeRecords([record])[0] as Profile;
      assert.ok(record);

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Alice get her profile
      let aliceProfileLink = await getAgentProfile(
        alice.cells[0],
        alice.agentPubKey
      );
      assert.ok(aliceProfileLink);

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Bob gets the created Profile
      const createdRecord: Record = await getLatestProfile(
        bob.cells[0],
        record.signed_action.hashed.hash
      );
      const bobCreatedProfile = decodeRecords([createdRecord])[0] as Profile;

      assert.containsAllKeys(aliceCreatedProfile, bobCreatedProfile);

      // Verify that the profile status is "pending"
      assert.equal(bobCreatedProfile.status, "pending");

      // Bob try to get his profile before he create it
      let links = await getAgentProfile(bob.cells[0], bob.agentPubKey);
      assert.equal(links.length, 0);

      // Bob create an Profile with erroneous UserType
      let errSample: Profile = sampleProfileInput({
        user_type: "Non Authorized",
      });

      await expect(createProfile(bob.cells[0], errSample)).rejects.toThrow();

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Bob create an Profile with erroneous profile Picture
      errSample = sampleProfileInput({
        name: "Bob",
        picture: new Uint8Array(20),
      });
      await expect(createProfile(bob.cells[0], errSample)).rejects.toThrow();

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Bob creates a Profile with a real image file
      const response = await fetch("https://picsum.photos/200/300");
      const buffer = await response.arrayBuffer();

      // TODO: test with local image
      // const buffer = await fs.readFile(TestProfilePicture);

      sample = sampleProfileInput({
        name: "Bob",
        picture: new Uint8Array(buffer),
      });
      record = await createProfile(bob.cells[0], sample);
      assert.ok(record);

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Alice get all the individual profiles
      links = await getAllProfiles(alice.cells[0]);
      assert.equal(links.length, 2);
    }
  );
});

test("create and update Profile", async () => {
  await runScenarioWithTwoAgents(async (_scenario, alice, bob) => {
    let sample: ProfileInput;
    let record: Record;

    sample = sampleProfileInput({ name: "Alice" });
    record = await createProfile(alice.cells[0], sample);
    const originalProfileHash = record.signed_action.hashed.hash;

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    const response = await fetch("https://picsum.photos/200/300");
    const buffer = await response.arrayBuffer();

    // Alice update her profile with a valid profile picture
    sample = sampleProfileInput({
      name: "Alicia",
      nickname: "Alicialia",
      picture: new Uint8Array(buffer),
    });

    await updateProfile(
      alice.cells[0],
      originalProfileHash,
      record.signed_action.hashed.hash,
      sample
    );

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    let latestProfileRecord = await getLatestProfile(
      alice.cells[0],
      originalProfileHash
    );
    let aliceProfile = decodeRecords([latestProfileRecord])[0] as Profile;
    assert.equal(sample.name, aliceProfile.name);

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Alice update her profile with an invalid profile picture
    sample = sampleProfileInput({
      name: "Alicia",
      nickname: "Alicialia",
      picture: new Uint8Array(20),
    });
    await expect(
      updateProfile(
        alice.cells[0],
        originalProfileHash,
        latestProfileRecord.signed_action.hashed.hash,
        sample
      )
    ).rejects.toThrow();

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Bob try to update Alice's profile
    sample = sampleProfileInput({
      name: "Bob",
    });
    await expect(
      updateProfile(
        bob.cells[0],
        originalProfileHash,
        latestProfileRecord.signed_action.hashed.hash,
        sample
      )
    ).rejects.toThrow();

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Alice update here profile again
    sample = sampleProfileInput({
      name: "Alice",
      nickname: "Alicia",
    });

    await updateProfile(
      alice.cells[0],
      originalProfileHash,
      latestProfileRecord.signed_action.hashed.hash,
      sample
    );

    latestProfileRecord = await getLatestProfile(
      alice.cells[0],
      originalProfileHash
    );
    aliceProfile = decodeRecords([latestProfileRecord])[0] as Profile;
    assert.equal(aliceProfile.nickname, sample.nickname);
  });
});

// test("get progenitor pubkey", async () => {
//   await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
//     let guestDnaProperties = decode(
//       alice.cells[0].dna_modifiers.properties
//     ) as DnaProperties;
//     let hostDnaProperties = await getDnaProperties(alice.cells[0]);

//     assert.equal(
//       guestDnaProperties.progenitor_pubkey,
//       hostDnaProperties.progenitor_pubkey
//     );
//   });
// });
