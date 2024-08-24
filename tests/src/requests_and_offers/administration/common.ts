import { CallableCell } from "@holochain/tryorama";
import { ActionHash, Record, Link, AgentPubKey } from "@holochain/client";

export type StatusType =
  | "pending"
  | "accepted"
  | "rejected"
  | "suspended temporarily"
  | "suspended indefinitely";

export type Status = {
  status_type: StatusType;
  reason?: string;
  timestamp?: number;
};

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

export async function getLatestStatusRecordForUser(
  cell: CallableCell,
  user_hash: ActionHash
): Promise<Record | null> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "get_latest_status_record_for_user",
    payload: user_hash,
  });
}

export async function getLatestStatusForUser(
  cell: CallableCell,
  user_original_action_hash: ActionHash
): Promise<Status | null> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "get_latest_status_for_user",
    payload: user_original_action_hash,
  });
}

export async function getUserStatusLink(
  cell: CallableCell,
  user_original_action_hash: ActionHash
): Promise<Link | null> {
  return cell.callZome({
    zome_name: "users",
    fn_name: "get_user_status_link",
    payload: user_original_action_hash,
  });
}

export async function updateUserStatus(
  cell: CallableCell,
  user_original_action_hash: ActionHash,
  status_original_action_hash: ActionHash,
  status_previous_action_hash: ActionHash,
  new_status: Status
): Promise<Record> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "update_user_status",
    payload: {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      new_status,
    },
  });
}

export async function suspendUserTemporarily(
  cell: CallableCell,
  user_original_action_hash: ActionHash,
  status_original_action_hash: ActionHash,
  status_previous_action_hash: ActionHash,
  reason: string,
  duration_in_days: number
): Promise<boolean> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "suspend_user_temporarily",
    payload: {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      reason,
      duration_in_days,
    },
  });
}

export async function suspendUserIndefinitely(
  cell: CallableCell,
  user_original_action_hash: ActionHash,
  status_original_action_hash: ActionHash,
  status_previous_action_hash: ActionHash,
  reason: string
): Promise<boolean> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "suspend_user_indefinitely",
    payload: {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      reason,
    },
  });
}

export async function unsuspendUser(
  cell: CallableCell,
  user_original_action_hash: ActionHash,
  status_original_action_hash: ActionHash,
  status_previous_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "unsuspend_user",
    payload: {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
    },
  });
}

export async function unsuspendUserIfTimePassed(
  cell: CallableCell,
  user_original_action_hash: ActionHash,
  status_original_action_hash: ActionHash,
  status_previous_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "unsuspend_user_if_time_passed",
    payload: {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
    },
  });
}

export async function getAllRevisionsForStatus(
  cell: CallableCell,
  status_original_action_hash: ActionHash
): Promise<Record[]> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "get_all_revisions_for_status",
    payload: status_original_action_hash,
  });
}
