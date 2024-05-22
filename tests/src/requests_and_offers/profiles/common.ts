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
  Link,
  AgentPubKey,
} from "@holochain/client";

export type UserType = "advocate" | "creator" | "Non Authorized";
export type Status = "pending" | "accepted" | "rejected";

export type Profile = {
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
  status?: Status;
};

export function sampleProfile(partialProfile: Partial<Profile>): Profile {
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
      status: null,
    },
    ...partialProfile,
  };
}

export async function createProfile(
  cell: CallableCell,
  Profile: Profile
): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "create_profile",
    payload: Profile,
  });
}

export async function getLatestProfile(
  cell: CallableCell,
  original_profile_hash: ActionHash
): Promise<Record | null> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "get_latest_profile",
    payload: original_profile_hash,
  });
}

export async function getAgentProfile(
  cell: CallableCell,
  author: AgentPubKey
): Promise<Link[]> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "get_agent_profile",
    payload: author,
  });
}

export async function getAllProfiles(cell: CallableCell): Promise<Link[]> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "get_all_profiles",
  });
}

export async function updateProfile(
  cell: CallableCell,
  original_profile_hash: ActionHash,
  previous_profile_hash: ActionHash,
  updated_profile: Profile
): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "update_profile",
    payload: { original_profile_hash, previous_profile_hash, updated_profile },
  });
}
