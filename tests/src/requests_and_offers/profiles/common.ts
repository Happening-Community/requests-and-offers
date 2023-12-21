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

enum IndividualType {
  Advocate,
  Developer,
}

type IndividualProfile = {
  name: string;
  nickname: string;
  bio: string;
  profilePicture: Uint8Array;
  individualType: IndividualType;
  skills: string[];
  email: string;
  phone?: string;
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
      profilePicture: new Uint8Array(0),
      individualType: IndividualType.Developer,
      skills: ["html", "css", "typescript", "rust"],
      email: "abc@abc.com",
      location: "here",
    },
    ...partialIndiviualProfile,
  };
}

export async function createIndiviualProfile(
  cell: CallableCell,
  indiviualProfile: IndividualProfile = undefined
): Promise<Record> {
  return cell.callZome({
    zome_name: "profiles",
    fn_name: "create_indiviual_profile",
    payload: indiviualProfile || (await sampleIndiviualProfile(cell)),
  });
}
