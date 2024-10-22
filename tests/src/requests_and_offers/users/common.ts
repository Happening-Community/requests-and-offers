import { CallableCell } from "@holochain/tryorama";
import { ActionHash, Record, Link, AgentPubKey } from "@holochain/client";

export type UserType = "advocate" | "creator" | "Non Authorized";

export type User = {
  name: string;
  nickname: string;
  bio: string;
  picture?: Uint8Array;
  user_type: UserType;
  skills: string[];
  email: string;
  phone?: string;
  time_zone: string;
  location: string;
};

export function sampleUser(partialUser: Partial<User>): User {
  return {
    ...{
      name: "User",
      nickname: "NickName",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      picture: null,
      user_type: "creator",
      skills: ["html", "css", "typescript", "rust"],
      email: "abc@abc.com",
      phone: null,
      time_zone: "EST",
      location: "here",
    },
    ...partialUser,
  };
}

export async function createUser(
  cell: CallableCell,
  User: User
): Promise<Record> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "create_user",
    payload: User,
  });
}

export async function getLatestUser(
  cell: CallableCell,
  original_action_hash: ActionHash
): Promise<Record | null> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "get_latest_user_record",
    payload: original_action_hash,
  });
}

export async function getAgentUser(
  cell: CallableCell,
  author: AgentPubKey
): Promise<Link[]> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "get_agent_user",
    payload: author,
  });
}

export async function getUserAgents(
  cell: CallableCell,
  user_original_action_hash: ActionHash
): Promise<AgentPubKey[]> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "get_user_agents",
    payload: user_original_action_hash,
  });
}

export async function getAcceptedEntities(cell: CallableCell): Promise<Link[]> {
  return cell.callZome({
    zome_name: "administration",
    fn_name: "get_accepted_entities",
    payload: "users",
  });
}

export async function updateUser(
  cell: CallableCell,
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash,
  updated_user: User
): Promise<Record> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "update_user",
    payload: { original_action_hash, previous_action_hash, updated_user },
  });
}
