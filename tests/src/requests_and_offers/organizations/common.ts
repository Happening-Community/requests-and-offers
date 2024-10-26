import { CallableCell } from "@holochain/tryorama";
import { ActionHash, Record, Link, AgentPubKey } from "@holochain/client";
import { User } from "../users/common";

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

export function createOrganization(
  cell: CallableCell,
  organization: Organization
): Promise<Record> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "create_organization",
    payload: organization,
  });
}

export function getLatestOrganizationRecord(
  cell: CallableCell,
  original_action_hash: ActionHash
): Promise<Record | null> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "get_latest_organization_record",
    payload: original_action_hash,
  });
}

export function getLatestOrganization(
  cell: CallableCell,
  original_action_hash: ActionHash
): Promise<Organization> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "get_latest_organization",
    payload: original_action_hash,
  });
}

export function addMemberToOrganization(
  cell: CallableCell,
  organization_original_action_hash: ActionHash,
  user_original_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "add_member_to_organization",
    payload: {
      organization_original_action_hash,
      user_original_action_hash,
    },
  });
}

export function getOrganizationMembersLinks(
  cell: CallableCell,
  organization_original_action_hash: ActionHash
): Promise<Link[]> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "get_organization_members_links",
    payload: organization_original_action_hash,
  });
}

export function getOrganizationMembers(
  cell: CallableCell,
  organization_original_action_hash: ActionHash
): Promise<User[]> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "get_organization_members",
    payload: organization_original_action_hash,
  });
}

export function isOrganizationMember(
  cell: CallableCell,
  organization_original_action_hash: ActionHash,
  user_original_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "is_organization_member",
    payload: {
      organization_original_action_hash,
      user_original_action_hash,
    },
  });
}

export function getUserOrganizationsLinks(
  cell: CallableCell,
  user_original_action_hash: ActionHash
): Promise<Link[]> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "get_user_organizations_links",
    payload: user_original_action_hash,
  });
}

export function getUserOrganizations(
  cell: CallableCell,
  user_original_action_hash: ActionHash
): Promise<Organization[]> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "get_user_organizations",
    payload: user_original_action_hash,
  });
}

export function addCoordinatorToOrganization(
  cell: CallableCell,
  organization_original_action_hash: ActionHash,
  user_original_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "add_coordinator_to_organization",
    payload: {
      organization_original_action_hash,
      user_original_action_hash,
    },
  });
}

export function getOrganizationCoordinatorsLinks(
  cell: CallableCell,
  organization_original_action_hash: ActionHash
): Promise<Link[]> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "get_organization_coordinators_links",
    payload: organization_original_action_hash,
  });
}

export function getOrganizationCoordinators(
  cell: CallableCell,
  organization_original_action_hash: ActionHash
): Promise<User[]> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "get_organization_coordinators",
    payload: organization_original_action_hash,
  });
}

export function isOrganizationCoordinator(
  cell: CallableCell,
  organization_original_action_hash: ActionHash,
  user_original_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "is_organization_coordinator",
    payload: {
      organization_original_action_hash,
      user_original_action_hash,
    },
  });
}

export function checkIfAgentIsOrganizationCoordinator(
  cell: CallableCell,
  organization_original_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "check_if_agent_is_organization_coordinator",
    payload: organization_original_action_hash,
  });
}

export function leaveOrganization(
  cell: CallableCell,
  organization_original_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "leave_organization",
    payload: organization_original_action_hash,
  });
}

export function removeOrganizationMember(
  cell: CallableCell,
  organization_original_action_hash: ActionHash,
  user_original_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "remove_organization_member",
    payload: {
      organization_original_action_hash,
      user_original_action_hash,
    },
  });
}

export function removeOrganizationCoordinator(
  cell: CallableCell,
  organization_original_action_hash: ActionHash,
  user_original_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "remove_organization_coordinator",
    payload: {
      organization_original_action_hash,
      user_original_action_hash,
    },
  });
}

export function updateOrganization(
  cell: CallableCell,
  organization_original_action_hash: ActionHash,
  organization_previous_action_hash: ActionHash,
  updated_organization: Organization
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "update_organization",
    payload: {
      organization_original_action_hash,
      organization_previous_action_hash,
      updated_organization,
    },
  });
}

export function deleteOrganization(
  cell: CallableCell,
  organization_original_action_hash: ActionHash
): Promise<boolean> {
  return cell.callZome({
    zome_name: "users_organizations",
    fn_name: "delete_organization",
    payload: organization_original_action_hash,
  });
}
