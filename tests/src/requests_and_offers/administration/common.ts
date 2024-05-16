import { CallableCell } from "@holochain/tryorama";
import {
  NewEntryAction,
  ActionHash,
  Record,
  AppBundleSource,
  fakeActionHash,
  fakeAgentPubKey,
  fakeEntryHash,
  fakeDnaHash,
} from "@holochain/client";

export async function registerAdministrator(
  cell: CallableCell,
  profile_hash: ActionHash
): Promise<Record> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "register_administrator",
    payload: profile_hash,
  });
}
