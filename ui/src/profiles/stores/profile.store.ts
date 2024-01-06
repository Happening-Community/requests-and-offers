import { writable, type Writable } from "svelte/store";
import type { IndividualProfile } from "../types";
import type { AppAgentClient, Record } from "@holochain/client";
import { decode } from "@msgpack/msgpack";
import { getContext } from "svelte";
import { clientContext } from "../../contexts";

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

function decodeIndividualProfileRecord(record: Record) {
  return decode((record.entry as any).Present.entry) as IndividualProfile;
}

export const myProfile: Writable<IndividualProfile | null> = writable();

export async function getMyProfile() {
  try {
    // const record: Record = await client.callZome({
    //   cap_secret: null,
    //   role_name: "requests_and_offers",
    //   zome_name: "profiles",
    //   fn_name: "get_my_profile",
    //   payload: null,
    // });
    // myProfile.set(decodeIndividualProfileRecord(record));
  } catch (e) {
    console.error("Zome call error :", e);
  }
}
