import { dhtSync } from "@holochain/tryorama";
import { Record } from "@holochain/client";
import { assert, expect, test } from "vitest";
import { decodeRecords, runScenarioWithTwoAgents } from "../utils";
import {
  Profile,
  createProfile,
  getAgentProfile,
  getLatestProfile,
  sampleProfileInput,
} from "../profiles/common";
import {
  checkIfAgentIsAdministrator,
  checkIfPersonIsAdministrator,
  getAllAdministratorsLinks,
  registerAdministrator,
  removeAdministrator,
  suspendPersonIndefinitely,
  suspendPersonTemporarily,
  updatePersonStatus,
} from "./common";

test("create a Person and make it administrator", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    let sample: Profile;
    let record: Record;
    sample = sampleProfileInput({ name: "Alice" });
    record = await createProfile(alice.cells[0], sample);
    sample = sampleProfileInput({ name: "Bob" });
    record = await createProfile(bob.cells[0], sample);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    let aliceProfileLink = (
      await getAgentProfile(alice.cells[0], alice.agentPubKey)
    )[0];
    let bobProfileLink = (
      await getAgentProfile(bob.cells[0], bob.agentPubKey)
    )[0];
    // Register Alice as an administrator
    await registerAdministrator(alice.cells[0], aliceProfileLink.target);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    const administrators = await getAllAdministratorsLinks(alice.cells[0]);

    // Verify that there is one administrator
    assert.equal(administrators.length, 1);

    // Verify that the link target is Alice
    assert.equal(
      administrators[0].target.toString(),
      aliceProfileLink.target.toString()
    );

    // Verify that Alice is an administrator
    assert.ok(
      await checkIfPersonIsAdministrator(
        alice.cells[0],
        aliceProfileLink.target
      )
    );

    // Verify that Bob is not an administrator
    assert.notOk(
      await checkIfPersonIsAdministrator(bob.cells[0], bobProfileLink.target)
    );

    // Verify that Alice is an administrator with here AgentPubKey
    assert.ok(
      await checkIfAgentIsAdministrator(alice.cells[0], alice.agentPubKey)
    );

    // Verify that Bob is not an administrator with here AgentPubKey
    assert.notOk(
      await checkIfAgentIsAdministrator(bob.cells[0], bob.agentPubKey)
    );

    // Add bob as an administrator and then remove him
    await registerAdministrator(bob.cells[0], bobProfileLink.target);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    assert.ok(
      await checkIfPersonIsAdministrator(bob.cells[0], bobProfileLink.target)
    );

    await removeAdministrator(bob.cells[0], bobProfileLink.target);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    assert.notOk(
      await checkIfPersonIsAdministrator(bob.cells[0], bobProfileLink.target)
    );
  });
});

test.only("update Person status", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    let sample: Profile;
    let record: Record;
    sample = sampleProfileInput({ name: "Alice" });
    record = await createProfile(alice.cells[0], sample);
    sample = sampleProfileInput({ name: "Bob" });
    record = await createProfile(bob.cells[0], sample);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    let aliceProfileLink = (
      await getAgentProfile(alice.cells[0], alice.agentPubKey)
    )[0];
    let bobProfileLink = (
      await getAgentProfile(bob.cells[0], bob.agentPubKey)
    )[0];
    // Register Alice as an administrator
    await registerAdministrator(alice.cells[0], aliceProfileLink.target);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Update Alice's status
    await updatePersonStatus(
      alice.cells[0],
      aliceProfileLink.target,
      aliceProfileLink.target,
      "accepted"
    );

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Verify that Alice's status is "accepted"
    let aliceProfile = decodeRecords([
      await getLatestProfile(alice.cells[0], aliceProfileLink.target),
    ])[0] as Profile;

    assert.equal(aliceProfile.status, "accepted");

    // Bob can not update his status
    await expect(
      updatePersonStatus(
        bob.cells[0],
        bobProfileLink.target,
        bobProfileLink.target,
        "accepted"
      )
    ).rejects.toThrow();

    // Alice suspends Bob indefinitely
    await suspendPersonIndefinitely(
      alice.cells[0],
      bobProfileLink.target,
      bobProfileLink.target
    );

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Verify that Bob's status is "suspended"
    let bobProfile = decodeRecords([
      await getLatestProfile(bob.cells[0], bobProfileLink.target),
    ])[0] as Profile;

    assert.equal(bobProfile.status, "suspended");

    // Alice suspends Bob for 7 days
    await suspendPersonTemporarily(
      alice.cells[0],
      bobProfileLink.target,
      bobProfileLink.target,
      7
    );
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    // Verify that Bob's status is "suspended"
    bobProfile = decodeRecords([
      await getLatestProfile(bob.cells[0], bobProfileLink.target),
    ])[0] as Profile;
    console.log("bobProfile status :", bobProfile.status);
    // assert.equal(bobProfile.status, "suspended");
  });
});
