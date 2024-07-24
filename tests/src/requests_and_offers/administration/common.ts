import { CallableCell } from "@holochain/tryorama";
import { ActionHash, Record, Link, AgentPubKey } from "@holochain/client";
import { Status } from "../profiles/common";

export async function registerAdministrator(
  cell: CallableCell,
  profile_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "register_administrator",
    payload: profile_hash,
  });
}

export async function getAllAdministratorsLinks(
  cell: CallableCell
): Promise<Link[]> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "get_all_administrators_links",
  });
}

export function checkIfPersonIsAdministrator(
  cell: CallableCell,
  profile_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "check_if_person_is_administrator",
    payload: profile_hash,
  });
}

export async function checkIfAgentIsAdministrator(
  cell: CallableCell,
  agent_pub_key: AgentPubKey
): Promise<boolean> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "check_if_agent_is_administrator",
    payload: agent_pub_key,
  });
}

export async function removeAdministrator(
  cell: CallableCell,
  person_profile_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "remove_administrator",
    payload: person_profile_hash,
  });
}

export async function updatePersonStatus(
  cell: CallableCell,
  original_profile_hash: ActionHash,
  previous_profile_hash: ActionHash,
  status: Status
): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "update_person_status",
    payload: { original_profile_hash, previous_profile_hash, status },
  });
}

export async function suspendPersonTemporarily(
  cell: CallableCell,
  original_profile_hash: ActionHash,
  previous_profile_hash: ActionHash,
  duration_in_days: number
): Promise<boolean> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "suspend_person_temporarily",
    payload: {
      original_profile_hash,
      previous_profile_hash,
      duration_in_days,
    },
  });
}

export async function suspendPersonIndefinitely(
  cell: CallableCell,
  original_profile_hash: ActionHash,
  previous_profile_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "suspend_person_indefinitely",
    payload: {
      original_profile_hash,
      previous_profile_hash,
    },
  });
}

export async function unsuspendPerson(
  cell: CallableCell,
  original_profile_hash: ActionHash,
  previous_profile_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "unsuspend_person",
    payload: {
      original_profile_hash,
      previous_profile_hash,
    },
  });
}

export async function unsuspendPersonIfTimePassed(
  cell: CallableCell,
  original_profile_hash: ActionHash,
  previous_profile_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "unsuspend_person_if_time_passed",
    payload: {
      original_profile_hash,
      previous_profile_hash,
    },
  });
}
