import type {
  Record,
  ActionHash,
  DnaHash,
  SignedActionHashed,
  EntryHash,
  AgentPubKey,
  Create,
  Update,
  Delete,
  CreateLink,
  DeleteLink,
} from "@holochain/client";

export type ProfilesSignal =
  | {
      type: "EntryCreated";
      action: SignedActionHashed<Create>;
      app_entry: EntryTypes;
    }
  | {
      type: "EntryUpdated";
      action: SignedActionHashed<Update>;
      app_entry: EntryTypes;
      original_app_entry: EntryTypes;
    }
  | {
      type: "EntryDeleted";
      action: SignedActionHashed<Delete>;
      original_app_entry: EntryTypes;
    }
  | {
      type: "LinkCreated";
      action: SignedActionHashed<CreateLink>;
      link_type: string;
    }
  | {
      type: "LinkDeleted";
      action: SignedActionHashed<DeleteLink>;
      link_type: string;
    };

export type EntryTypes = { type: "IndividualProfile" } & IndividualProfile;

export enum IndividualType {
  Advocate = "advocate",
  Developer = "developer",
  NonAuth = "Non authororized", // For testing invalid inputs
}

export interface IndividualProfile {
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
}
