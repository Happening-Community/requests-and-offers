import { expect, test } from "vitest";
import { Base64 } from "js-base64";

import { runScenario } from "@holochain/tryorama";
import { InstallAppRequest } from "@holochain/client";
import { decode } from "@msgpack/msgpack";

const hAppPath = process.cwd() + "/../workdir/requests_and_offers.happ";
const appSource = { appBundleSource: { path: hAppPath } };

function serializeHash(hash: Uint8Array) {
  return `u${Base64.fromUint8Array(hash, true)}`;
}

test("ping", async () => {
  await runScenario(async (scenario) => {
    const [alice] = await scenario.addPlayersWithApps([appSource]);

    await scenario.shareAllAgents();

    const record: String = await alice.cells[0].callZome({
      zome_name: "ping",
      fn_name: "ping",
    });
    expect(record).toEqual("Pong");
  });
});

test("install hApp with progenitor properties", async () => {
  await runScenario(async (scenario) => {
    const aliceConductor = await scenario.addConductor();
    const adminWs = aliceConductor.adminWs();
    const agent_key = await adminWs.generateAgentPubKey();
    console.log("Agent key:", serializeHash(agent_key));
    const hashDna = await adminWs.registerDna({
      path: hAppPath,
      modifiers: {
        properties: {
          progenitor_pubkey: serializeHash(agent_key),
        },
      },
    });

    const req: InstallAppRequest = {
      installed_app_id: "requests_and_offers",
      agent_key,
      membrane_proofs: {},
      path: hAppPath,
    };

    const installedHapp = await aliceConductor.installApp(req);
    console.log(
      "Installed happ:",
      decode(
        installedHapp.cell_info["requests_and_offers"][0].provisioned
          .dna_modifiers.properties
      )
    );
  });
});
