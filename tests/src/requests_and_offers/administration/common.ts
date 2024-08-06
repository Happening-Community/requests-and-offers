import { CallableCell } from "@holochain/tryorama";
import { ActionHash, Record, Link, AgentPubKey } from "@holochain/client";
import { Status } from "../users/common";

export async function getAllUsers(cell: CallableCell): Promise<Link[]> {
  return cell.callZome({
    zome_name: "users",
    fn_name: "get_all_users",
  });
}

export async function registerAdministrator(
  cell: CallableCell,
  user_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "register_administrator",
    payload: user_hash,
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

export function checkIfUserIsAdministrator(
  cell: CallableCell,
  user_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "check_if_user_is_administrator",
    payload: user_hash,
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
  user_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "remove_administrator",
    payload: user_hash,
  });
}

export async function updateUserStatus(
  cell: CallableCell,
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash,
  status: Status
): Promise<Record> {
  return cell.callZome({
    zome_name: "users",
    fn_name: "update_user_status",
    payload: { original_action_hash, previous_action_hash, status },
  });
}

export async function suspendUserTemporarily(
  cell: CallableCell,
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash,
  duration_in_days: number
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users",
    fn_name: "suspend_user_temporarily",
    payload: {
      original_action_hash,
      previous_action_hash,
      duration_in_days,
    },
  });
}

export async function suspendUserIndefinitely(
  cell: CallableCell,
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users",
    fn_name: "suspend_user_indefinitely",
    payload: {
      original_action_hash,
      previous_action_hash,
    },
  });
}

export async function unsuspendUser(
  cell: CallableCell,
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users",
    fn_name: "unsuspend_user",
    payload: {
      original_action_hash,
      previous_action_hash,
    },
  });
}

export async function unsuspendUserIfTimePassed(
  cell: CallableCell,
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users",
    fn_name: "unsuspend_user_if_time_passed",
    payload: {
      original_action_hash,
      previous_action_hash,
    },
  });
}
