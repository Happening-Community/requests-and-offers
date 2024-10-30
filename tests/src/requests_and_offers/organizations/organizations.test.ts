import { assert, expect, test } from "vitest";
import TestUserPicture from "./assets/favicon.png";

import { Scenario, Player, dhtSync } from "@holochain/tryorama";
import { Record } from "@holochain/client";

import {
  decodeRecords,
  imagePathToArrayBuffer,
  runScenarioWithTwoAgents,
} from "../utils.js";
import {
  createUser,
  getAgentUser,
  getUserStatusLink,
  sampleUser,
  User,
} from "../users/common";
import {
  getLatestStatusRecordForUser,
  registerNetworkAdministrator,
  updateUserStatus,
} from "../administration/common";
import {
  addCoordinatorToOrganization,
  addMemberToOrganization,
  checkIfAgentIsOrganizationCoordinator,
  createOrganization,
  getAcceptedOrganizationsLinks,
  getAllOrganizations,
  getLatestOrganization,
  getOrganizationCoordinatorsLinks,
  getOrganizationMembersLinks,
  getOrganizationStatusLink,
  removeOrganizationCoordinator,
  removeOrganizationMember,
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
      let sampleOrg = sampleOrganization({
        name: "Bob's Organization",
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
      const bobOrganizationOriginalActionHash =
        record.signed_action.hashed.hash;
      assert.ok(record);

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

      // Bob read the Organization record
      let organization = await getLatestOrganization(
        bob.cells[0],
        bobOrganizationOriginalActionHash
      );

      console.log(organization);
      assert.equal(organization.name, sampleOrg.name);

      // Verify that Bob is an member of the Organization
      let organizationMembers = await getOrganizationMembersLinks(
        bob.cells[0],
        bobOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationMembers, 1);
      assert.deepEqual(organizationMembers[0].target, bobUserLink.target);

      // Verify that Bob is a coordinator of the Organization
      let organizationLinks = await getOrganizationCoordinatorsLinks(
        alice.cells[0],
        bobOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationLinks, 1);
      assert.ok(
        await checkIfAgentIsOrganizationCoordinator(
          bob.cells[0],
          bobOrganizationOriginalActionHash
        )
      );

      assert.deepEqual(organizationLinks[0].target, bobUserLink.target);

      // Bob add Alice as a member of the Organization
      assert.ok(
        await addMemberToOrganization(
          bob.cells[0],
          bobOrganizationOriginalActionHash,
          aliceUserLink.target
        )
      );

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Verify that Alice is a member of the Organization
      organizationMembers = await getOrganizationMembersLinks(
        bob.cells[0],
        bobOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationMembers, 2);
      assert.deepEqual(organizationMembers[1].target, aliceUserLink.target);

      // Verify that Alice is not a coordinator of the Organization
      assert.notOk(
        await checkIfAgentIsOrganizationCoordinator(
          alice.cells[0],
          bobOrganizationOriginalActionHash
        )
      );

      await expect(
        addCoordinatorToOrganization(
          alice.cells[0],
          bobOrganizationOriginalActionHash,
          aliceUserLink.target
        )
      ).rejects.toThrow();

      // Bob add Alice as a coordinator of the Organization
      assert.ok(
        await addCoordinatorToOrganization(
          bob.cells[0],
          bobOrganizationOriginalActionHash,
          aliceUserLink.target
        )
      );

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Verify that Alice is a coordinator of the Organization
      organizationLinks = await getOrganizationCoordinatorsLinks(
        alice.cells[0],
        bobOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationLinks, 2);
      assert.deepEqual(organizationLinks[1].target, aliceUserLink.target);

      // Bob remove Alice as a coordinator of the Organization
      assert.ok(
        await removeOrganizationCoordinator(
          bob.cells[0],
          bobOrganizationOriginalActionHash,
          aliceUserLink.target
        )
      );

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

      // Verify that Alice is not a coordinator of the Organization
      assert.notOk(
        await checkIfAgentIsOrganizationCoordinator(
          alice.cells[0],
          bobOrganizationOriginalActionHash
        )
      );

      organizationLinks = await getOrganizationCoordinatorsLinks(
        bob.cells[0],
        bobOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationLinks, 1);

      // Verify that Alice still is a member of the Organization
      organizationMembers = await getOrganizationMembersLinks(
        bob.cells[0],
        bobOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationMembers, 2);
      assert.deepEqual(organizationMembers[1].target, aliceUserLink.target);

      // Bob remove Alice as a member of the Organization
      assert.ok(
        await removeOrganizationMember(
          bob.cells[0],
          bobOrganizationOriginalActionHash,
          aliceUserLink.target
        )
      );

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

      // Verify that Alice is not a member of the Organization
      organizationMembers = await getOrganizationMembersLinks(
        bob.cells[0],
        bobOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationMembers, 1);

      // Alice, as a network administrator, accept her user profile
      const aliceStatusOriginalActionHash = (
        await getUserStatusLink(alice.cells[0], aliceUserLink.target)
      ).target;

      const aliceLatestStatusActionHash = (
        await getLatestStatusRecordForUser(alice.cells[0], aliceUserLink.target)
      ).signed_action.hashed.hash;

      await updateUserStatus(
        alice.cells[0],
        aliceUserLink.target,
        aliceLatestStatusActionHash,
        aliceStatusOriginalActionHash,
        {
          status_type: "accepted",
        }
      );

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Alice create her own Organization
      sampleOrg = sampleOrganization({ name: "Alice's Organization" });
      record = await createOrganization(alice.cells[0], sampleOrg);
      const aliceOrganizationOriginalActionHash =
        record.signed_action.hashed.hash;

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Verify that Alice is a member of the Organization
      organizationMembers = await getOrganizationMembersLinks(
        alice.cells[0],
        aliceOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationMembers, 1);
      assert.deepEqual(organizationMembers[0].target, aliceUserLink.target);

      // Alice can get all the Organizations because she is a network administrator
      const allOrganizationsLinks = await getAllOrganizations(alice.cells[0]);
      assert.lengthOf(allOrganizationsLinks, 2);

      // Verify that Bob can not get all the Organizations because he is not a network administrator
      await expect(getAllOrganizations(bob.cells[0])).rejects.toThrow();

      // Verify that there is no accepted Organization
      const acceptedOrganizationsLinks = await getAcceptedOrganizationsLinks(
        alice.cells[0]
      );
      assert.lengthOf(acceptedOrganizationsLinks, 0);

      // Alice, as a network administrator, accept Alice's Organization and Bob's Organization
      const bobOrganizationStatusOriginalActionHash =
        await getOrganizationStatusLink(
          bob.cells[0],
          bobOrganizationOriginalActionHash
        );
      const aliceOrganizationStatusOriginalActionHash =
        await getOrganizationStatusLink(
          alice.cells[0],
          aliceOrganizationOriginalActionHash
        );

      const bobOrganizationLatestStatusActionHash =
        await getLatestStatusRecordForUser(
          bob.cells[0],
          bobOrganizationOriginalActionHash
        );
    }
  );
});
