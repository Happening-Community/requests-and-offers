import { assert, expect, test } from "vitest";
import TestUserPicture from "./assets/favicon.png";

import { Scenario, Player, dhtSync } from "@holochain/tryorama";
import { Record } from "@holochain/client";

import { imagePathToArrayBuffer, runScenarioWithTwoAgents } from "../utils.js";
import {
  createUser,
  getAgentUser,
  getUserStatusLink,
  sampleUser,
  User,
} from "../users/common";
import {
  AdministrationEntity,
  getLatestStatusRecordForEntity,
  registerNetworkAdministrator,
  updateEntityStatus,
} from "../administration/common";
import {
  addCoordinatorToOrganization,
  addMemberToOrganization,
  checkIfAgentIsOrganizationCoordinator,
  createOrganization,
  deleteOrganization,
  getAcceptedOrganizationsLinks,
  getAllOrganizationsLinks,
  getLatestOrganization,
  getOrganizationCoordinatorsLinks,
  getOrganizationMembersLinks,
  getOrganizationStatusLink,
  getUserOrganizationsLinks,
  leaveOrganization,
  removeOrganizationCoordinator,
  removeOrganizationMember,
  sampleOrganization,
  updateOrganization,
} from "./common";

test("create and manage Organizations", async () => {
  await runScenarioWithTwoAgents(
    async (_scenario: Scenario, alice: Player, bob: Player) => {
      let sample: User;
      let record: Record;

      // Alice creates a User
      sample = sampleUser({ name: "Alice" });
      record = await createUser(alice.cells[0], sample);
      assert.ok(record);

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Bob tries to create an Organization without having a user profile
      const buffer = await imagePathToArrayBuffer(
        process.cwd() + TestUserPicture
      );
      let sampleOrg = sampleOrganization({
        name: "Organization",
        logo: new Uint8Array(buffer),
      });

      await expect(
        createOrganization(bob.cells[0], sampleOrg)
      ).rejects.toThrow();

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

      // Alice accept Bob
      let bobUserLink = (
        await getAgentUser(alice.cells[0], bob.agentPubKey)
      )[0];
      const bobStatusOriginalActionHash = (
        await getUserStatusLink(alice.cells[0], bobUserLink.target)
      ).target;

      const bobLatestStatusActionHash = (
        await getLatestStatusRecordForEntity(
          alice.cells[0],
          AdministrationEntity.Users,
          bobUserLink.target
        )
      ).signed_action.hashed.hash;

      await updateEntityStatus(
        alice.cells[0],
        AdministrationEntity.Users,
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

      // Bob update the his Organization
      sampleOrg = sampleOrganization({
        name: "Bob's Organization",
        logo: new Uint8Array(buffer),
      });
      await updateOrganization(
        bob.cells[0],
        bobOrganizationOriginalActionHash,
        bobOrganizationOriginalActionHash,
        sampleOrg
      );
      assert.ok(record);

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

      // Verify the Organization has been updated
      organization = await getLatestOrganization(
        bob.cells[0],
        bobOrganizationOriginalActionHash
      );
      assert.equal(organization.name, sampleOrg.name);

      // Bob try to add Alice as a member of the Organization without the organization being accepted
      expect(
        addMemberToOrganization(
          bob.cells[0],
          bobOrganizationOriginalActionHash,
          aliceUserLink.target
        )
      ).rejects.toThrow();

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

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

      // Bob try to add Alice as a coordinator of the Organization
      expect(
        addCoordinatorToOrganization(
          bob.cells[0],
          bobOrganizationOriginalActionHash,
          aliceUserLink.target
        )
      ).rejects.toThrow();

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Alice, as a network administrator, accept her user profile
      const aliceStatusOriginalActionHash = (
        await getUserStatusLink(alice.cells[0], aliceUserLink.target)
      ).target;

      const aliceLatestStatusActionHash = (
        await getLatestStatusRecordForEntity(
          alice.cells[0],
          AdministrationEntity.Users,
          aliceUserLink.target
        )
      ).signed_action.hashed.hash;

      await updateEntityStatus(
        alice.cells[0],
        AdministrationEntity.Users,
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
      const allOrganizationsLinks = await getAllOrganizationsLinks(
        alice.cells[0]
      );
      assert.lengthOf(allOrganizationsLinks, 2);

      // Verify that Bob can not get all the Organizations because he is not a network administrator
      await expect(getAllOrganizationsLinks(bob.cells[0])).rejects.toThrow();

      // Verify that there is no accepted Organization
      const acceptedOrganizationsLinks = await getAcceptedOrganizationsLinks(
        alice.cells[0]
      );
      assert.lengthOf(acceptedOrganizationsLinks, 0);

      // Alice, as a network administrator, accept Alice's Organization and Bob's Organization
      const bobOrganizationStatusOriginalActionHash = (
        await getOrganizationStatusLink(
          bob.cells[0],
          bobOrganizationOriginalActionHash
        )
      ).target;
      const aliceOrganizationStatusOriginalActionHash = (
        await getOrganizationStatusLink(
          alice.cells[0],
          aliceOrganizationOriginalActionHash
        )
      ).target;

      const bobOrganizationLatestStatusActionHash = (
        await getLatestStatusRecordForEntity(
          bob.cells[0],
          AdministrationEntity.Organizations,
          bobOrganizationOriginalActionHash
        )
      ).signed_action.hashed.hash;

      const aliceOrganizationLatestStatusActionHash = (
        await getLatestStatusRecordForEntity(
          alice.cells[0],
          AdministrationEntity.Organizations,
          aliceOrganizationOriginalActionHash
        )
      ).signed_action.hashed.hash;

      await updateEntityStatus(
        alice.cells[0],
        AdministrationEntity.Organizations,
        bobOrganizationOriginalActionHash,
        bobOrganizationLatestStatusActionHash,
        bobOrganizationStatusOriginalActionHash,
        {
          status_type: "accepted",
        }
      );

      await updateEntityStatus(
        alice.cells[0],
        AdministrationEntity.Organizations,
        aliceOrganizationOriginalActionHash,
        aliceOrganizationLatestStatusActionHash,
        aliceOrganizationStatusOriginalActionHash,
        {
          status_type: "accepted",
        }
      );

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Verify that the organizations are accepted
      const acceptedOrganizations = await getAcceptedOrganizationsLinks(
        alice.cells[0]
      );
      assert.lengthOf(acceptedOrganizations, 2);

      // Alice add Bob as a member of the Organization
      assert.ok(
        await addMemberToOrganization(
          alice.cells[0],
          aliceOrganizationOriginalActionHash,
          bobUserLink.target
        )
      );

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Verify that Bob is a member of the Organization
      organizationMembers = await getOrganizationMembersLinks(
        alice.cells[0],
        aliceOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationMembers, 2);
      assert.deepEqual(organizationMembers[1].target, bobUserLink.target);

      // Alice add Bob as a coordinator of the Organization
      assert.ok(
        await addCoordinatorToOrganization(
          alice.cells[0],
          aliceOrganizationOriginalActionHash,
          bobUserLink.target
        )
      );

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Verify that Bob is a coordinator of the Organization
      organizationLinks = await getOrganizationCoordinatorsLinks(
        alice.cells[0],
        aliceOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationLinks, 2);
      assert.ok(
        await checkIfAgentIsOrganizationCoordinator(
          bob.cells[0],
          aliceOrganizationOriginalActionHash
        )
      );

      // Bob remove Alice as a coordinator of the Organization
      assert.ok(
        await removeOrganizationCoordinator(
          bob.cells[0],
          aliceOrganizationOriginalActionHash,
          aliceUserLink.target
        )
      );

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

      // Verify that Alice is not a coordinator of the Organization
      assert.notOk(
        await checkIfAgentIsOrganizationCoordinator(
          alice.cells[0],
          aliceOrganizationOriginalActionHash
        )
      );

      organizationLinks = await getOrganizationCoordinatorsLinks(
        bob.cells[0],
        aliceOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationLinks, 1);
      assert.deepEqual(organizationLinks[0].target, bobUserLink.target);

      // Bob remove Alice as a member of the Organization
      assert.ok(
        await removeOrganizationMember(
          bob.cells[0],
          aliceOrganizationOriginalActionHash,
          aliceUserLink.target
        )
      );

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

      // Verify that Alice is no longer a member of the Organization
      organizationMembers = await getOrganizationMembersLinks(
        bob.cells[0],
        aliceOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationMembers, 1);
      assert.deepEqual(organizationMembers[0].target, bobUserLink.target);

      // Bob can not leave Alice's Organization because he is the last coordinator
      await expect(
        leaveOrganization(bob.cells[0], aliceOrganizationOriginalActionHash)
      ).rejects.toThrow();

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

      // Bob add Alice as a coordinator of the Organization
      assert.ok(
        await addCoordinatorToOrganization(
          bob.cells[0],
          aliceOrganizationOriginalActionHash,
          aliceUserLink.target
        )
      );

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

      // Bob can now leave Alice's Organization
      assert.ok(
        await leaveOrganization(
          bob.cells[0],
          aliceOrganizationOriginalActionHash
        )
      );

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);

      // Verify that Bob is no longer a member of Alice's Organization
      organizationMembers = await getOrganizationMembersLinks(
        alice.cells[0],
        aliceOrganizationOriginalActionHash
      );
      assert.lengthOf(organizationMembers, 1);

      // Alice delete her Organization
      assert.ok(
        await deleteOrganization(
          alice.cells[0],
          aliceOrganizationOriginalActionHash
        )
      );

      await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

      // Verify that Alice's Organization is deleted
      assert.lengthOf(await getAllOrganizationsLinks(alice.cells[0]), 1);
      assert.lengthOf(
        await getUserOrganizationsLinks(alice.cells[0], aliceUserLink.target),
        0
      );

      // Bob delete his Organization
      assert.ok(
        await deleteOrganization(
          bob.cells[0],
          bobOrganizationOriginalActionHash
        )
      );

      // Verify that Bob's Organization is deleted
      assert.lengthOf(await getAcceptedOrganizationsLinks(bob.cells[0]), 0);
      assert.lengthOf(
        await getUserOrganizationsLinks(bob.cells[0], bobUserLink.target),
        0
      );
    }
  );
});
