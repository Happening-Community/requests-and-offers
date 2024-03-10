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
import { decode } from "@msgpack/msgpack";

export type UserType = "advocate" | "developer" | "Non Authorized";

export type Profile = {
  name: string;
  nickname: string;
  bio: string;
  profile_picture?: Uint8Array;
  user_type: UserType;
  skills: string[];
  email: string;
  phone?: string;
  time_zone: string;
  location: string;
  created_at: number;
};

export function decodeOutputs(records: Record[]): unknown[] {
  return records.map((r) => decode((r.entry as any).Present.entry));
}

export function sampleProfile(partialProfile: Partial<Profile>): Profile {
  return {
    ...{
      name: "User",
      nickname: "NickName",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      profile_picture: null,
      user_type: "developer",
      skills: ["html", "css", "typescript", "rust"],
      email: "abc@abc.com",
      phone: null,
      time_zone: "EST",
      location: "here",
      created_at: 0,
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

export async function getMyProfile(cell: CallableCell): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "get_my_profile",
  });
}

export async function getProfile(
  cell: CallableCell,
  record: Record
): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "get_profile",
    payload: record.signed_action.hashed.hash,
  });
}

export async function getAllProfiles(cell: CallableCell): Promise<Record[]> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "get_all_profiles",
  });
}

export async function updateMyProfile(
  cell: CallableCell,
  updated_profile: Profile
): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "update_my_profile",
    payload: updated_profile,
  });
}
