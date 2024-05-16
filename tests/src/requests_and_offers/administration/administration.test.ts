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
import { assert, test } from "vitest";
import { runScenarioWithTwoAgents } from "../utils";
import {
  Profile,
  createProfile,
  getAgentProfile,
  sampleProfile,
} from "../profiles/common";
import { registerAdministrator } from "./common";

test("create a Person and make it administrator", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    let sample: Profile;
    let record: Record;

    sample = sampleProfile({ name: "Alice" });
    record = await createProfile(alice.cells[0], sample);

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    let aliceProfileLink = await getAgentProfile(
      alice.cells[0],
      alice.agentPubKey
    );

    assert.ok(aliceProfileLink);

    await dhtSync([alice, bob], alice.cells[0].cell_id[0]);

    // Register Alice as an administrator
    await registerAdministrator(
      alice.cells[0],
      record.signed_action.hashed.hash
    );
  });
});
