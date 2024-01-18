import { assert, expect, test, vi } from "vitest";

import {
  runScenario,
  pause,
  CallableCell,
  Scenario,
  Player,
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
import { decode } from "@msgpack/msgpack";

const hAppPath = process.cwd() + "/../workdir/requests-and-offers.happ";
const appSource = { appBundleSource: { path: hAppPath } };

function decodeOutputs(records: Record[]): unknown[] {
  return records.map((r) => decode((r.entry as any).Present.entry));
}

test("ping", async () => {
  await runScenario(async (scenario) => {
    const [alice] = await scenario.addPlayersWithApps([appSource]);
    await scenario.shareAllAgents();

    const record: Record = await alice.cells[0].callZome({
      zome_name: "ping",
      fn_name: "ping",
      payload: null,
    });

    assert.notOk(record);
  });
});
