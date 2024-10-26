import { assert, expect, test } from "vitest";
import TestUserPicture from "./assets/favicon.png";

import { Scenario, Player, dhtSync } from "@holochain/tryorama";
import { Record } from "@holochain/client";

import {
  decodeRecords,
  imagePathToArrayBuffer,
  runScenarioWithTwoAgents,
} from "../utils.js";
import { createUser, getAgentUser, sampleUser, User } from "../users/common";
import {
  getLatestStatusRecordForUser,
  getUserStatusLink,
  registerNetworkAdministrator,
  updateUserStatus,
} from "../administration/common";
import {
  addCoordinatorToOrganization,
  addMemberToOrganization,
  checkIfAgentIsOrganizationCoordinator,
  createOrganization,
  getLatestOrganization,
  getOrganizationCoordinatorsLinks,
  getOrganizationMembersLinks,
  sampleOrganization,
} from "./common";

test("create and manage Organization", async () => {
  await runScenarioWithTwoAgents(
    async (_scenario: Scenario, alice: Player, bob: Player) => {
      let sample: User;
      let record: Record;

      // Alice creates a User
      sample = sampleUser({ name: "Alice" });
      record = await createUser(alice.cells[0], sample);
      assert.ok(record);

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Bob creates a User
      sample = sampleUser({
        name: "Bob",
      });
      record = await createUser(bob.cells[0], sample);
      assert.ok(record);

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

      // Alice become an network administrator
      let aliceUserLink = (
        await getAgentUser(alice.cells[0], alice.agentPubKey)
      )[0];
      await registerNetworkAdministrator(alice.cells[0], aliceUserLink.target, [
        alice.agentPubKey,
      ]);
      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Bob create an Organization without being an accepted user
      const buffer = await imagePathToArrayBuffer(
        process.cwd() + TestUserPicture
      );
      const sampleOrg = sampleOrganization({
        name: "Organization",
        logo: new Uint8Array(buffer),
      });

      await expect(
        createOrganization(bob.cells[0], sampleOrg)
      ).rejects.toThrow();

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Alice accept Bob
      let bobUserLink = (
        await getAgentUser(alice.cells[0], bob.agentPubKey)
      )[0];
      const bobStatusOriginalActionHash = (
        await getUserStatusLink(alice.cells[0], bobUserLink.target)
      ).target;

      const bobLatestStatusActionHash = (
        await getLatestStatusRecordForUser(alice.cells[0], bobUserLink.target)
      ).signed_action.hashed.hash;

      await updateUserStatus(
        alice.cells[0],
        bobUserLink.target,
        bobLatestStatusActionHash,
        bobStatusOriginalActionHash,
        {
          status_type: "accepted",
        }
      );

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Bob retry to create an Organization
      record = await createOrganization(bob.cells[0], sampleOrg);
      const organizationOriginalActionHash = record.signed_action.hashed.hash;
      assert.ok(record);

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

      // Bob read the Organization record
      let organization = await getLatestOrganization(
        bob.cells[0],
        organizationOriginalActionHash
      );

      console.log(organization);
      assert.equal(organization.name, sampleOrg.name);

      // Verify that Bob is an member of the Organization
      let organizationMembers = await getOrganizationMembersLinks(
        bob.cells[0],
        organizationOriginalActionHash
      );
      assert.lengthOf(organizationMembers, 1);
      assert.deepEqual(organizationMembers[0].target, bobUserLink.target);

      // Verify that Bob is a coordinator of the Organization
      let organizationLinks = await getOrganizationCoordinatorsLinks(
        alice.cells[0],
        organizationOriginalActionHash
      );
      assert.lengthOf(organizationLinks, 1);
      assert.ok(
        await checkIfAgentIsOrganizationCoordinator(
          bob.cells[0],
          organizationOriginalActionHash
        )
      );

      assert.deepEqual(organizationLinks[0].target, bobUserLink.target);

      // Bob add Alice as a member of the Organization
      assert.ok(
        await addMemberToOrganization(
          bob.cells[0],
          organizationOriginalActionHash,
          aliceUserLink.target
        )
      );

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Verify that Alice is a member of the Organization
      organizationMembers = await getOrganizationMembersLinks(
        bob.cells[0],
        organizationOriginalActionHash
      );
      assert.lengthOf(organizationMembers, 2);
      assert.deepEqual(organizationMembers[1].target, aliceUserLink.target);

      // Verify that Alice is not a coordinator of the Organization
      assert.notOk(
        await checkIfAgentIsOrganizationCoordinator(
          alice.cells[0],
          organizationOriginalActionHash
        )
      );

      await expect(
        addCoordinatorToOrganization(
          alice.cells[0],
          organizationOriginalActionHash,
          aliceUserLink.target
        )
      ).rejects.toThrow();

      // Bob add Alice as a coordinator of the Organization
      assert.ok(
        await addCoordinatorToOrganization(
          bob.cells[0],
          organizationOriginalActionHash,
          aliceUserLink.target
        )
      );

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Verify that Alice is a coordinator of the Organization
      organizationLinks = await getOrganizationCoordinatorsLinks(
        alice.cells[0],
        organizationOriginalActionHash
      );
      assert.lengthOf(organizationLinks, 2);
      assert.deepEqual(organizationLinks[1].target, aliceUserLink.target);
    }
  );
});
