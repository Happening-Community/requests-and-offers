import { assert, expect, test } from "vitest";
import { Base64 } from "js-base64";

import { AppOptions, runScenario } from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";

type DnaProperties = {
  progenitor_pubkey: string;
};

const HARDCODED_PROGENITOR_PUBKEY =
  "uhCAkVNjcdnXfoExk87X1hKArKH43bZnAidlsSgqBqeGvFpOPiUCT";
const hAppPath = process.cwd() + "/../workdir/requests_and_offers.happ";
const dnaPath =
  process.cwd() +
  "/../dnas/requests_and_offers/workdir/requests_and_offers.dna";
const appSource = { appBundleSource: { path: hAppPath } };

test("ping", async () => {
  await runScenario(async (scenario) => {
    const [alice] = await scenario.addPlayersWithApps([appSource]);

    const record: String = await alice.cells[0].callZome({
      zome_name: "misc",
      fn_name: "ping",
    });
    expect(record).toEqual("Pong");
  });
});

function serializeHash(hash: Uint8Array) {
  return `u${Base64.fromUint8Array(hash, true)}`;
}

test.only("install hApp with progenitor property", async () => {
  await runScenario(async (scenario) => {
    const aliceConductor = await scenario.addConductor();
    const adminWs = aliceConductor.adminWs();
    const agent_key = await adminWs.generateAgentPubKey();

    const dnaHash = await adminWs.registerDna({
      path: dnaPath,
      modifiers: {
        properties: {
          progenitor_pubkey: serializeHash(agent_key),
        },
      },
    });

    const appOptions: AppOptions = {
      agentPubKey: agent_key,
      installedAppId: "requests_and_offers",
    };

    const installedHapp = await aliceConductor.installApp(
      { path: hAppPath },
      appOptions
    );

    const installedProgenitorKey = (
      decode(
        installedHapp.cell_info["requests_and_offers"][0].provisioned
          .dna_modifiers.properties
      ) as DnaProperties
    ).progenitor_pubkey;

    assert.notEqual(installedProgenitorKey, HARDCODED_PROGENITOR_PUBKEY);
  });
});
