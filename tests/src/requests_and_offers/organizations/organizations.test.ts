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
  getAcceptedUsersLinks,
  getAgentUser,
  sampleUser,
  User,
} from "../users/common";
import {
  checkIfAgentIsAdministrator,
  getLatestStatusForUser,
  getLatestStatusRecordForUser,
  getUserStatusLink,
  registerNetworkAdministrator,
  updateUserStatus,
} from "../administration/common";
import { createOrganization, sampleOrganization } from "./common";

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

      // Verify that Alice is an administrator
      assert.ok(
        await checkIfAgentIsAdministrator(alice.cells[0], alice.agentPubKey)
      );

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
      assert.ok(record);

      await dhtSync([alice, bob], bob.cells[0].cell_id[0]);
    }
  );
});
