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

export type IndividualType = "advocate" | "developer" | "Non Authorized";

export type IndividualProfile = {
  name: string;
  nickname: string;
  bio: string;
  profile_picture?: Uint8Array;
  individual_type: IndividualType;
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

export function sampleIndividualProfile(
  partialIndividualProfile: Partial<IndividualProfile>
): IndividualProfile {
  return {
    ...{
      name: "User",
      nickname: "NickName",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      profile_picture: null,
      individual_type: "developer",
      skills: ["html", "css", "typescript", "rust"],
      email: "abc@abc.com",
      phone: null,
      time_zone: "EST",
      location: "here",
      created_at: 0,
    },
    ...partialIndividualProfile,
  };
}

export async function createProfile(
  cell: CallableCell,
  individualProfile: IndividualProfile
): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "create_profile",
    payload: individualProfile,
  });
}

export async function getMyProfile(cell: CallableCell): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "get_my_profile",
  });
}

export async function getIndividualProfile(
  cell: CallableCell,
  record: Record
): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "get_individual_profile",
    payload: record.signed_action.hashed.hash,
  });
}

export async function getAllProfiles(cell: CallableCell): Promise<Record[]> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "get_all_profiles",
  });
}

export async function updateIndividualProfile(
  cell: CallableCell,
  individual_profile_hash: ActionHash,
  updated_individual_profile: IndividualProfile
): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "update_individual_profile",
    payload: { individual_profile_hash, updated_individual_profile },
  });
}
