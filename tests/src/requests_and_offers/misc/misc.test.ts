import fs from "fs";
import { assert, expect, test } from "vitest";
import { Base64 } from "js-base64";
import {
  AgentApp,
  AppOptions,
  Conductor,
  Scenario,
  runScenario,
} from "@holochain/tryorama";
import { decode } from "@msgpack/msgpack";
import { decompressSync } from "fflate";
import { AppBundle } from "@holochain/client";
import { deserializeHash, serializeHash } from "../utils";

type DnaProperties = {
  progenitor_pubkey: string;
};

function decodeDnaProperties(buffer: Uint8Array): DnaProperties {
  return decode(buffer) as DnaProperties;
}

const HARDCODED_PROGENITOR_PUBKEY =
  "uhCAkVNjcdnXfoExk87X1hKArKH43bZnAidlsSgqBqeGvFpOPiUCT";
const hAppPath = process.cwd() + "/../workdir/requests_and_offers.happ";
const dnaPath =
  process.cwd() +
  "/../dnas/requests_and_offers/workdir/requests_and_offers.dna";
const appSource = { appBundleSource: { path: hAppPath } };

test("ping", async () => {
  await runScenario(async (scenario: Scenario) => {
    const [alice] = await scenario.addPlayersWithApps([appSource]);

    const record: String = await alice.cells[0].callZome({
      zome_name: "misc",
      fn_name: "ping",
    });
    expect(record).toEqual("Pong");
  });
});

test.only("install hApp with progenitor property", async () => {
  await runScenario(async (scenario) => {
    const aliceConductor = await scenario.addConductor();
    const adminWs = aliceConductor.adminWs();
    const agent_key = await adminWs.generateAgentPubKey();

    const appBundleBytes = fs.readFileSync(hAppPath);
    const appBundle = decode(
      decompressSync(new Uint8Array(appBundleBytes))
    ) as any;

    appBundle.manifest.roles.find(
      (r) => r.name === "requests_and_offers"
    )!.dna.modifiers = {
      network_seed: "throwaway",
      properties: {
        progenitor_pubkey: serializeHash(agent_key),
      },
    };

    const alice = await aliceConductor.installApp(
      { bundle: appBundle },
      {
        installedAppId: "requests_and_offers",
        agentPubKey: agent_key,
      }
    );
    await aliceConductor
      .adminWs()
      .enableApp({ installed_app_id: "requests_and_offers" });

    const installedProgenitorKey = decodeDnaProperties(
      alice.cell_info["requests_and_offers"][0].provisioned.dna_modifiers
        .properties
    ).progenitor_pubkey;

    assert.notEqual(installedProgenitorKey, HARDCODED_PROGENITOR_PUBKEY);
  });
});
