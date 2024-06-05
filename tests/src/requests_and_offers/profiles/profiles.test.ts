import { assert, expect, test, vi } from "vitest";
import TestProfilePicture from "./assets/Test-Logo-Small-Black-transparent-1.png";

import {
  runScenario,
  pause,
  CallableCell,
  Scenario,
  Player,
  dhtSync,
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
  getAllProfiles,
  getAgentProfile,
  getLatestProfile,
  sampleProfile,
  updateProfile,
  registerAdministrator,
  checkIfPersonIsAdministrator,
  getAllAdministratorsLinks,
  removeAdministrator,
  updatePersonStatus,
} from "./common.js";
import { decodeOutputs, runScenarioWithTwoAgents } from "../utils";

test("create and read Profile", async () => {
  await runScenarioWithTwoAgents(
    async (_scenario: Scenario, alice: Player, bob: Player) => {
      let sample: Profile;
      let record: Record;
      let records: Record[];

      // Alice creates a Profile
      sample = sampleProfile({ name: "Alice" });
      record = await createProfile(alice.cells[0], sample);
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
      const createdProfile = decodeOutputs([createdRecord])[0] as Profile;
      assert.containsAllKeys(sample, createdProfile);

      // Verify that the profile status is "pending"
      assert.equal(createdProfile.status, "pending");

      // Bob try to get his profile before he create it
      let links = await getAgentProfile(bob.cells[0], bob.agentPubKey);
      assert.equal(links.length, 0);

      // Bob create an Profile with erroneous UserType
      let errSample: Profile = sampleProfile({
        user_type: "Non Authorized",
      });

      await expect(createProfile(bob.cells[0], errSample)).rejects.toThrow();

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Bob create an Profile with erroneous profile Picture
      errSample = sampleProfile({
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

      sample = sampleProfile({
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
    let sample: Profile;
    let record: Record;

    sample = sampleProfile({ name: "Alice" });
    record = await createProfile(alice.cells[0], sample);
    const originalProfileHash = record.signed_action.hashed.hash;

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    const response = await fetch("https://picsum.photos/200/300");
    const buffer = await response.arrayBuffer();

    // Alice update her profile with a valid profile picture
    sample = sampleProfile({
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
    let aliceProfile = decodeOutputs([latestProfileRecord])[0] as Profile;
    assert.equal(sample.name, aliceProfile.name);

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Alice update her profile with an invalid profile picture
    sample = sampleProfile({
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
    sample = sampleProfile({
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

    // Alice try to change the status of her profile
    sample = sampleProfile({
      status: "accepted",
    });

    await expect(
      updateProfile(
        alice.cells[0],
        originalProfileHash,
        latestProfileRecord.signed_action.hashed.hash,
        sample
      )
    ).rejects.toThrow();

    // Alice update here profile again
    sample = sampleProfile({
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
    aliceProfile = decodeOutputs([latestProfileRecord])[0] as Profile;
    assert.equal(aliceProfile.nickname, sample.nickname);
  });
});

test("create a profile and make it administrator", async () => {
  await runScenarioWithTwoAgents(async (_scenario, alice, bob) => {
    let sample: Profile;
    let record: Record;

    sample = sampleProfile({ name: "Alice" });
    record = await createProfile(alice.cells[0], sample);
    const aliceOriginalProfileHash = record.signed_action.hashed.hash;
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    sample = sampleProfile({ name: "Bob" });
    record = await createProfile(bob.cells[0], sample);
    const bobOriginalProfileHash = record.signed_action.hashed.hash;
    await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

    // Register Alice as an administrator
    let response = await registerAdministrator(
      alice.cells[0],
      aliceOriginalProfileHash
    );

    assert.ok(response);

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    response = await checkIfPersonIsAdministrator(
      alice.cells[0],
      aliceOriginalProfileHash
    );

    assert.ok(response);

    // Check if Bob is not an administrator
    response = await checkIfPersonIsAdministrator(
      bob.cells[0],
      bobOriginalProfileHash
    );
    assert.notOk(response);

    // Verify get_all_administrators_links returns Alice
    let administrators = await getAllAdministratorsLinks(alice.cells[0]);
    assert.equal(
      administrators[0].target.toString(),
      aliceOriginalProfileHash.toString()
    );

    // Make Bob an administrator
    response = await registerAdministrator(
      bob.cells[0],
      bobOriginalProfileHash
    );
    assert.ok(response);

    await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

    administrators = await getAllAdministratorsLinks(alice.cells[0]);
    assert.equal(administrators.length, 2);

    // Remove Alice as an administrator

    response = await removeAdministrator(
      bob.cells[0],
      aliceOriginalProfileHash
    );
    assert.ok(response);

    await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

    // Verify that Alice is not an administrator anymore
    administrators = await getAllAdministratorsLinks(alice.cells[0]);
    assert.equal(administrators.length, 1);

    // Verify that the Alice can not update het status to "accepted"
    let aliceLatestProfileRecord = await getLatestProfile(
      alice.cells[0],
      aliceOriginalProfileHash
    );

    await expect(
      updatePersonStatus(
        alice.cells[0],
        aliceOriginalProfileHash,
        aliceLatestProfileRecord.signed_action.hashed.hash,
        "accepted"
      )
    ).rejects.toThrow();

    // Bob update Alice's status to "accepted"

    record = await updatePersonStatus(
      bob.cells[0],
      aliceOriginalProfileHash,
      aliceLatestProfileRecord.signed_action.hashed.hash,
      "accepted"
    );

    assert.ok(record);

    await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

    // Verify that the Alice's profile status is "accepted"
    aliceLatestProfileRecord = await getLatestProfile(
      alice.cells[0],
      aliceOriginalProfileHash
    );

    let aliceProfile = decodeOutputs([aliceLatestProfileRecord])[0] as Profile;

    assert.equal(aliceProfile.status, "accepted");
  });
});
