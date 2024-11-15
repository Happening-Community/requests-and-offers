import type { ActionHash, Link, Record } from '@holochain/client';
import type { OrganizationInDHT } from '@/types/holochain';
import hc from '../HolochainClientService.svelte';

export class OrganizationsService {
  static async createOrganization(organization: OrganizationInDHT): Promise<Record> {
    return (await hc.callZome(
      'users_organizations',
      'create_organization',
      organization
    )) as Record;
  }

  static async getLatestOrganizationRecord(original_action_hash: ActionHash): Promise<Record | null> {
    return (await hc.callZome(
      'users_organizations',
      'get_latest_organization_record',
      original_action_hash
    )) as Record | null;
  }

  static async getAllOrganizationsLinks(): Promise<Link[]> {
    return (await hc.callZome('users_organizations', 'get_all_organizations', null)) as Link[];
  }

  static async getOrganizationStatusLink(
    organization_original_action_hash: ActionHash
  ): Promise<Link | null> {
    return (await hc.callZome(
      'users_organizations',
      'get_organization_status_link',
      organization_original_action_hash
    )) as Link | null;
  }

  static async getOrganizationMembersLinks(
    organization_original_action_hash: ActionHash
  ): Promise<Link[]> {
    return (await hc.callZome(
      'users_organizations',
      'get_organization_members_links',
      organization_original_action_hash
    )) as Link[];
  }

  static async getOrganizationCoordinatorsLinks(
    organization_original_action_hash: ActionHash
  ): Promise<Link[]> {
    return (await hc.callZome(
      'users_organizations',
      'get_organization_coordinators_links',
      organization_original_action_hash
    )) as Link[];
  }

  static async addOrganizationMember(
    organization_original_action_hash: ActionHash,
    member_original_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'add_organization_member', {
      organization_original_action_hash,
      member_original_action_hash
    })) as boolean;
  }

  static async removeOrganizationMember(
    organization_original_action_hash: ActionHash,
    member_original_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'remove_organization_member', {
      organization_original_action_hash,
      member_original_action_hash
    })) as boolean;
  }

  static async addOrganizationCoordinator(
    organization_original_action_hash: ActionHash,
    coordinator_original_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'add_organization_coordinator', {
      organization_original_action_hash,
      coordinator_original_action_hash
    })) as boolean;
  }

  static async removeOrganizationCoordinator(
    organization_original_action_hash: ActionHash,
    coordinator_original_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'remove_organization_coordinator', {
      organization_original_action_hash,
      coordinator_original_action_hash
    })) as boolean;
  }

  static async getUserOrganizationsLinks(user_original_action_hash: ActionHash): Promise<Link[]> {
    return (await hc.callZome(
      'users_organizations',
      'get_user_organizations_links',
      user_original_action_hash
    )) as Link[];
  }

  static async getUserCoordinatedOrganizationsLinks(
    user_original_action_hash: ActionHash
  ): Promise<Link[]> {
    return (await hc.callZome(
      'users_organizations',
      'get_user_coordinated_organizations_links',
      user_original_action_hash
    )) as Link[];
  }

  static async getAcceptedOrganizationsLinks(): Promise<Link[]> {
    return (await hc.callZome(
      'administration',
      'get_accepted_entities',
      'organizations'
    )) as Link[];
  }
}
