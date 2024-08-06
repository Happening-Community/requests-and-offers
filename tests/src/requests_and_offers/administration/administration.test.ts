import { dhtSync } from "@holochain/tryorama";
import { Record } from "@holochain/client";
import { assert, expect, test } from "vitest";
import { decodeRecords, runScenarioWithTwoAgents } from "../utils";
import {
  User,
  createUser,
  getAcceptedUsers,
  getAgentUser,
  getLatestUser,
  sampleUserInput,
} from "../users/common";
import {
  checkIfAgentIsAdministrator,
  checkIfUserIsAdministrator,
  getAllAdministratorsLinks,
  getAllUsers,
  registerAdministrator,
  removeAdministrator,
  suspendUserIndefinitely,
  suspendUserTemporarily,
  unsuspendUser,
  unsuspendUserIfTimePassed,
  updateUserStatus,
} from "./common";

test("create a User and make it administrator", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    let sample: User;
    let record: Record;
    sample = sampleUserInput({ name: "Alice" });
    record = await createUser(alice.cells[0], sample);
    sample = sampleUserInput({ name: "Bob" });
    record = await createUser(bob.cells[0], sample);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    let aliceUserLink = (
      await getAgentUser(alice.cells[0], alice.agentPubKey)
    )[0];
    let bobUserLink = (await getAgentUser(bob.cells[0], bob.agentPubKey))[0];
    // Register AlicUser administrator
    await registerAdministrator(alice.cells[0], aliceUserLink.target);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    const administrators = await getAllAdministratorsLinks(alice.cells[0]);

    // Verify that there is one administrator
    assert.equal(administrators.length, 1);

    // Verify that the link target is Alice
    assert.equal(
      administrators[0].target.toString(),
      aliceUserLink.target.toString()
    );

    // Verify that Alice is an administrator
    assert.ok(
      await checkIfUserIsAdministrator(alice.cells[0], aliceUserLink.target)
    );

    // Verify that Bob is not an administrator
    assert.notOk(
      await checkIfUserIsAdministrator(bob.cells[0], bobUserLink.target)
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
    await registerAdministrator(bob.cells[0], bobUserLink.target);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    assert.ok(
      await checkIfUserIsAdministrator(bob.cells[0], bobUserLink.target)
    );

    await removeAdministrator(bob.cells[0], bobUserLink.target);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    assert.notOk(
      await checkIfUserIsAdministrator(bob.cells[0], bobUserLink.target)
    );
  });
});

test("update User status", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    let sample: User;
    let record: Record;
    sample = sampleUserInput({ name: "Alice" });
    record = await createUser(alice.cells[0], sample);
    sample = sampleUserInput({ name: "Bob" });
    record = await createUser(bob.cells[0], sample);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    let aliceUserLink = (
      await getAgentUser(alice.cells[0], alice.agentPubKey)
    )[0];
    let bobUserLink = (await getAgentUser(bob.cells[0], bob.agentPubKey))[0];
    // Register AlicUser administrator
    await registerAdministrator(alice.cells[0], aliceUserLink.target);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Update Alice's status
    await updateUserStatus(
      alice.cells[0],
      aliceUserLink.target,
      aliceUserLink.target,
      "accepted"
    );

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Verify that Alice's status is "accepted"
    let aliceUser = decodeRecords([
      await getLatestUser(alice.cells[0], aliceUserLink.target),
    ])[0] as User;

    assert.equal(aliceUser.status, "accepted");

    // Verify the all_users list
    let allUsers = await getAllUsers(alice.cells[0]);
    assert.equal(allUsers.length, 2);

    // Verify the accepted_users list
    let acceptedUsers = await getAcceptedUsers(alice.cells[0]);
    assert.equal(acceptedUsers.length, 1);

    // Bob can not update his status
    await expect(
      updateUserStatus(
        bob.cells[0],
        bobUserLink.target,
        bobUserLink.target,
        "accepted"
      )
    ).rejects.toThrow();

    // Alice suspends Bob indefinitely
    await suspendUserIndefinitely(
      alice.cells[0],
      bobUserLink.target,
      bobUserLink.target
    );

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Verify that Bob's status is "suspended"
    let bobUserRecord = await getLatestUser(bob.cells[0], bobUserLink.target);
    let bobUser = decodeRecords([bobUserRecord])[0] as User;

    assert.equal(bobUser.status, "suspended");

    // Alice unsuspends Bob
    await unsuspendUser(
      alice.cells[0],
      bobUserLink.target,
      bobUserRecord.signed_action.hashed.hash
    );

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Verify that Bob's status is "accepted"
    bobUser = decodeRecords([
      await getLatestUser(bob.cells[0], bobUserLink.target),
    ])[0] as User;
    assert.equal(bobUser.status, "accepted");

    // Alice suspends Bob for 7 days
    await suspendUserTemporarily(
      alice.cells[0],
      bobUserLink.target,
      bobUserLink.target,
      7
    );
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    // Verify that Bob's status is suspended for 7 days
    bobUserRecord = await getLatestUser(bob.cells[0], bobUserLink.target);
    bobUser = decodeRecords([bobUserRecord])[0] as User;
    const suspensionTime = new Date(bobUser.status.split(" ")[1]);
    const now = new Date();
    const diffInDays = Math.round(
      (suspensionTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    assert.equal(diffInDays, 7);

    // Alice try to unsuspends Bob with the unsuspendUserIfTimePassed function
    const isUnsuspended = await unsuspendUserIfTimePassed(
      alice.cells[0],
      bobUserLink.target,
      bobUserRecord.signed_action.hashed.hash
    );

    assert.equal(isUnsuspended, false);
  });
});
