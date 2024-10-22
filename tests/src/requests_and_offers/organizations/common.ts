import { CallableCell } from "@holochain/tryorama";
import { ActionHash, Record, Link, AgentPubKey } from "@holochain/client";

export type UserType = "advocate" | "creator" | "Non Authorized";

export type Organization = {
  name: string;
  description: string;
  logo?: Uint8Array;
  email: string;
  urls: string[];
  location: string;
};

export function sampleOrganization(
  partialOrganization: Partial<Organization>
): Organization {
  return {
    ...{
      name: "User",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      logo: null,
      email: "abc@abc.com",
      urls: ["https://example.com"],
      location: "here",
    },
    ...partialOrganization,
  };
}
