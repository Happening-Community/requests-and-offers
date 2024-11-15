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

  static async getAcceptedOrganizationsLinks(): Promise<Link[]> {
    return (await hc.callZome(
      'administration',
      'get_accepted_entities',
      'organizations'
    )) as Link[];
  }
}
