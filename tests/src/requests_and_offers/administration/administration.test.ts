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
  Link,
} from "@holochain/client";
import { assert, expect, test } from "vitest";
import { extractWasmErrorMessage, runScenarioWithTwoAgents } from "../utils";
import {
  Profile,
  createProfile,
  getAgentProfile,
  sampleProfile,
} from "../profiles/common";
import {
  checkIfAdministrator,
  getAllAdministratorsLinks,
  registerAdministrator,
} from "./common";

test("create a Person and make it administrator", async () => {
  await runScenarioWithTwoAgents(async (scenario, alice, bob) => {
    let sample: Profile;
    let record: Record;

    sample = sampleProfile({ name: "Alice" });
    record = await createProfile(alice.cells[0], sample);

    sample = sampleProfile({ name: "Bob" });
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

    // Alice the list of the administrators
    const administrators = await getAllAdministratorsLinks(alice.cells[0]);

    // Verify that the link target is Alice
    assert.equal(
      administrators[0].target.toString(),
      aliceProfileLink.target.toString()
    );

    // Verify that Alice is an administrator
    assert.ok(
      await checkIfAdministrator(alice.cells[0], aliceProfileLink.target)
    );

    // Verify that Bob is not an administrator
    expect(
      checkIfAdministrator(bob.cells[0], bobProfileLink.target)
    ).rejects.toThrow();
  });
});
