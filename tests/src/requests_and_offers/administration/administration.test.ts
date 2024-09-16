import { dhtSync } from "@holochain/tryorama";
import { Record } from "@holochain/client";
import { assert, expect, test } from "vitest";
import { decodeRecords, runScenarioWithTwoAgents } from "../utils";
import {
  User,
  createUser,
  getAcceptedEntities,
  getAgentUser,
  getLatestUser,
  getUserAgents,
  sampleUser,
} from "../users/common";
import {
  checkIfAgentIsAdministrator,
  checkIfUserIsAdministrator,
  getAllAdministratorsLinks,
  getAllUsers,
  getLatestStatusForUser,
  getLatestStatusRecordForUser,
  getUserStatusLink,
  registerNetworkAdministrator,
  removeAdministrator,
  suspendUserIndefinitely,
  suspendUserTemporarily,
  unsuspendUser,
  unsuspendUserIfTimePassed,
  updateUserStatus,
  getAllRevisionsForStatus,
} from "./common";

test("create a User, register administrator and remove administrator", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    let sample: User;
    let record: Record;

    sample = sampleUser({ name: "Alice" });
    record = await createUser(alice.cells[0], sample);
    sample = sampleUser({ name: "Bob" });
    record = await createUser(bob.cells[0], sample);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    let aliceUserLink = (
      await getAgentUser(alice.cells[0], alice.agentPubKey)
    )[0];
    let bobUserLink = (await getAgentUser(bob.cells[0], bob.agentPubKey))[0];
    // Register AlicUser administrator
    await registerNetworkAdministrator(alice.cells[0], aliceUserLink.target, [
      alice.agentPubKey,
    ]);
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

    const bobAgents = await getUserAgents(bob.cells[0], bobUserLink.target);
    // Alice add bob as an administrator and then remove him
    await registerNetworkAdministrator(
      alice.cells[0],
      bobUserLink.target,
      bobAgents
    );
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    assert.ok(
      await checkIfUserIsAdministrator(bob.cells[0], bobUserLink.target)
    );

    await removeAdministrator(alice.cells[0], bobUserLink.target);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    assert.notOk(
      await checkIfUserIsAdministrator(bob.cells[0], bobUserLink.target)
    );

    assert.notOk(
      await checkIfAgentIsAdministrator(bob.cells[0], bob.agentPubKey)
    );
  });
});

test("update User status", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    let sample: User;
    let record: Record;

    sample = sampleUser({ name: "Alice" });
    record = await createUser(alice.cells[0], sample);
    sample = sampleUser({ name: "Bob" });
    record = await createUser(bob.cells[0], sample);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);
    let aliceUserLink = (
      await getAgentUser(alice.cells[0], alice.agentPubKey)
    )[0];
    let bobUserLink = (await getAgentUser(bob.cells[0], bob.agentPubKey))[0];
    // Register AlicUser administrator
    await registerNetworkAdministrator(alice.cells[0], aliceUserLink.target, [
      alice.agentPubKey,
    ]);
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Update Alice's status
    const aliceStatusOriginalActionHash = (
      await getUserStatusLink(alice.cells[0], aliceUserLink.target)
    ).target;
    const aliceLatestStatusRecord = await getLatestStatusRecordForUser(
      alice.cells[0],
      aliceUserLink.target
    );

    await updateUserStatus(
      alice.cells[0],
      aliceUserLink.target,
      aliceStatusOriginalActionHash,
      aliceLatestStatusRecord.signed_action.hashed.hash,
      {
        status_type: "accepted",
      }
    );

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Verify that Alice's status is "accepted"
    let aliceStatus = await getLatestStatusForUser(
      alice.cells[0],
      aliceUserLink.target
    );

    assert.equal(aliceStatus.status_type, "accepted");

    // Verify the all_users list
    let allUsers = await getAllUsers(alice.cells[0]);
    assert.equal(allUsers.length, 2);

    // Verify the accepted_users list
    let AcceptedEntities = await getAcceptedEntities(alice.cells[0]);

    assert.equal(AcceptedEntities.length, 1);

    // Bob can not update his status
    const bobStatusOriginalActionHash = (
      await getUserStatusLink(bob.cells[0], bobUserLink.target)
    ).target;
    let bobLatestStatusRecord = await getLatestStatusRecordForUser(
      bob.cells[0],
      bobUserLink.target
    );

    await expect(
      updateUserStatus(
        bob.cells[0],
        bobUserLink.target,
        bobStatusOriginalActionHash,
        bobLatestStatusRecord.signed_action.hashed.hash,
        {
          status_type: "accepted",
        }
      )
    ).rejects.toThrow();

    // Alice suspends Bob indefinitely
    await suspendUserIndefinitely(
      alice.cells[0],
      bobUserLink.target,
      bobStatusOriginalActionHash,
      bobLatestStatusRecord.signed_action.hashed.hash,
      "Bob is a naughty boy"
    );

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Alice verify that her status is still "accepted"
    aliceStatus = await getLatestStatusForUser(
      alice.cells[0],
      aliceUserLink.target
    );
    assert.equal(aliceStatus.status_type, "accepted");

    // Verify that Bob's status is "suspended"
    let bobStatus = await getLatestStatusForUser(
      bob.cells[0],
      bobUserLink.target
    );
    assert.equal(bobStatus.status_type, "suspended indefinitely");

    bobLatestStatusRecord = await getLatestStatusRecordForUser(
      bob.cells[0],
      bobUserLink.target
    );

    // Alice unsuspends Bob
    await unsuspendUser(
      alice.cells[0],
      bobUserLink.target,
      bobStatusOriginalActionHash,
      bobLatestStatusRecord.signed_action.hashed.hash
    );

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Verify that Bob's status is "accepted"
    bobStatus = await getLatestStatusForUser(bob.cells[0], bobUserLink.target);
    assert.equal(bobStatus.status_type, "accepted");

    // Alice suspends Bob for 7 days
    let bobUserRecord = await getLatestUser(bob.cells[0], bobUserLink.target);

    await suspendUserTemporarily(
      alice.cells[0],
      bobUserLink.target,
      bobStatusOriginalActionHash,
      bobLatestStatusRecord.signed_action.hashed.hash,
      "Bob is a naughty boy",
      7
    );

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Verify that Bob's status is suspended for 7 days
    bobStatus = await getLatestStatusForUser(bob.cells[0], bobUserLink.target);

    const suspensionTime = new Date(bobStatus.suspended_until);

    const now = new Date();

    const diffInDays = Math.round(
      (suspensionTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    assert.equal(diffInDays, 7);

    // Alice try to unsuspends Bob with the unsuspendUserIfTimePassed function
    bobUserRecord = await getLatestUser(bob.cells[0], bobUserLink.target);

    const isUnsuspended = await unsuspendUserIfTimePassed(
      alice.cells[0],
      bobUserLink.target,
      bobStatusOriginalActionHash,
      bobLatestStatusRecord.signed_action.hashed.hash
    );

    assert.equal(isUnsuspended, false);

    // Alice unsuspends Bob again
    await unsuspendUser(
      alice.cells[0],
      bobUserLink.target,
      bobStatusOriginalActionHash,
      bobLatestStatusRecord.signed_action.hashed.hash
    );
    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Alice get the suspension history of Bob
    const suspensionHistory = await getAllRevisionsForStatus(
      alice.cells[0],
      bobStatusOriginalActionHash
    );

    assert.equal(suspensionHistory.length, 5);
  });
});
