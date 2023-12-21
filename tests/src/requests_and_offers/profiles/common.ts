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

type IndividualProfile = {
  name: string;
  nickname: string;
  bio: string;
  profile_picture?: Uint8Array;
  individual_type: string;
  skills: string[];
  email: string;
  phone?: string;
  time_zone: string;
  location: string;
};

export async function sampleIndiviualProfile(
  cell: CallableCell,
  partialIndiviualProfile = {}
) {
  return {
    ...{
      name: "User",
      nickname: "NickName",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      profile_picture: new Uint8Array(500),
      individual_type: "developer",
      skills: ["html", "css", "typescript", "rust"],
      email: "abc@abc.com",
      phone: null,
      time_zone: "EST",
      location: "here",
    },
    ...partialIndiviualProfile,
  };
}

export async function createIndiviualProfile(
  cell: CallableCell,
  indiviualProfile: IndividualProfile
): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "create_indiviual_profile",
    payload: indiviualProfile,
  });
}
