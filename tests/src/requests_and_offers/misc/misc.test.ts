import { expect, test } from "vitest";
import { Base64 } from "js-base64";

import { AppOptions, runScenario } from "@holochain/tryorama";
import { AppBundleSource, InstallAppRequest } from "@holochain/client";
import { decode } from "@msgpack/msgpack";

const hAppPath = process.cwd() + "/../workdir/requests_and_offers.happ";
const dnaPath =
  process.cwd() +
  "/../dnas/requests_and_offers/workdir/requests_and_offers.dna";
const appSource = { appBundleSource: { path: hAppPath } };

function serializeHash(hash: Uint8Array) {
  return `u${Base64.fromUint8Array(hash, true)}`;
}

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

test("install hApp with progenitor property", async () => {
  await runScenario(async (scenario) => {
    const aliceConductor = await scenario.addConductor();
    const adminWs = aliceConductor.adminWs();
    const agent_key = await adminWs.generateAgentPubKey();

    const hashDna = await adminWs.registerDna({
      path: dnaPath,
      modifiers: {
        properties: {
          progenitor_pubkey: serializeHash(agent_key),
        },
      },
    });

    // const appOptions: AppOptions = {
    //   agentPubKey: agent_key,
    //   installedAppId: "requests_and_offers",
    // };

    const installedHapp = await adminWs.installApp({
      agent_key,
      path: hAppPath,
      membrane_proofs: {},
    });

    console.log(
      "Installed happ:",
      decode(
        installedHapp.cell_info["requests_and_offers"][0].provisioned
          .dna_modifiers.properties
      )
    );
  });
});
