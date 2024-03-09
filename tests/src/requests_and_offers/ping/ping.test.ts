import { assert, expect, test } from "vitest";

import { runScenario } from "@holochain/tryorama";

const hAppPath = process.cwd() + "/../workdir/requests_and_offers.happ";
const appSource = { appBundleSource: { path: hAppPath } };

test.only("ping", async () => {
  await runScenario(async (scenario) => {
    const [alice] = await scenario.addPlayersWithApps([appSource]);
    await scenario.shareAllAgents();

    const record: String = await alice.cells[0].callZome({
      zome_name: "ping",
      fn_name: "ping",
      payload: null,
    });

    expect(record).toEqual("Pong");
  });
});
