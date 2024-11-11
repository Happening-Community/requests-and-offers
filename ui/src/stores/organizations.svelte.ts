import hc from '@/services/HolochainClientService.svelte';
import type { ActionHash, Link, Record } from '@holochain/client';
import type { User } from './users.svelte';
import type { Status } from './administrators.svelte';
import administratorsStore, { AdministrationEntity } from './administrators.svelte';
import { decodeRecords } from '@/utils';

export type OrganizationInDHT = {
  name: string;
  description: string;
  logo?: Uint8Array;
  email: string;
  urls: string[];
  location: string;
};

export type OrganizationAdditionalFields = {
  members: ActionHash[];
  coordinators: ActionHash[];
  status?: Status;
  original_action_hash?: ActionHash;
  previous_action_hash?: ActionHash;
};

export type Organization = OrganizationInDHT & OrganizationAdditionalFields;

class OrganizationsStore {
  acceptedOrganizations: Organization[] = $state([]);

  async getOrganizationStatusLink(
    organization_original_action_hash: ActionHash
  ): Promise<Link | null> {
    return (await hc.callZome(
      'users_organizations',
      'get_organization_status_link',
      organization_original_action_hash
    )) as Link | null;
  }

  async getOrganizationStatus(
    organization_original_action_hash: ActionHash
  ): Promise<Status | null> {
    const link = await this.getOrganizationStatusLink(organization_original_action_hash);

    if (!link) return null;

    const status = await administratorsStore.getLatestStatusForEntity(
      link.target,
      AdministrationEntity.Organizations
    );

    return status;
  }

  async createOrganization(organization: Organization): Promise<Record> {
    return (await hc.callZome(
      'users_organizations',
      'create_organization',
      organization
    )) as Record;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return (await hc.callZome(
      'users_organizations',
      'get_all_organizations',
      null
    )) as Organization[];
  }

  async getAcceptedOrganizationsLinks(): Promise<Link[]> {
    const acceptedOrganizationsLinks = (await hc.callZome(
      'administration',
      'get_accepted_entities',
      'organizations'
    )) as Link[];

    for (const link of acceptedOrganizationsLinks) {
      const organization = await this.getLatestOrganization(link.target);
      if (organization) {
        const status = await this.getOrganizationStatus(link.target);
        organization.status = status!;
        this.acceptedOrganizations.push(organization);
      }
    }

    return acceptedOrganizationsLinks;
  }

  async getLatestOrganizationRecord(original_action_hash: ActionHash): Promise<Record | null> {
    return (await hc.callZome(
      'users_organizations',
      'get_latest_organization_record',
      original_action_hash
    )) as Record | null;
  }

  async getLatestOrganization(original_action_hash: ActionHash): Promise<Organization | null> {
    const record = await this.getLatestOrganizationRecord(original_action_hash);
    const status = await this.getOrganizationStatus(original_action_hash);

    return record
      ? {
          ...decodeRecords([record])[0],
          original_action_hash,
          previous_action_hash: record.signed_action.hashed.hash,
          status
        }
      : null;
  }

  async addMemberToOrganization(
    organization_original_action_hash: ActionHash,
    user_original_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'add_member_to_organization', {
      organization_original_action_hash,
      user_original_action_hash
    })) as boolean;
  }

  async getOrganizationMembersLinks(
    organization_original_action_hash: ActionHash
  ): Promise<Link[]> {
    return (await hc.callZome(
      'users_organizations',
      'get_organization_members_links',
      organization_original_action_hash
    )) as Link[];
  }

  async getOrganizationMembers(organization_original_action_hash: ActionHash): Promise<User[]> {
    return (await hc.callZome(
      'users_organizations',
      'get_organization_members',
      organization_original_action_hash
    )) as User[];
  }

  async isOrganizationMember(
    organization_original_action_hash: ActionHash,
    user_original_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'is_organization_member', {
      organization_original_action_hash,
      user_original_action_hash
    })) as boolean;
  }

  async addCoordinatorToOrganization(
    organization_original_action_hash: ActionHash,
    user_original_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'add_coordinator_to_organization', {
      organization_original_action_hash,
      user_original_action_hash
    })) as boolean;
  }

  async getOrganizationCoordinatorsLinks(
    organization_original_action_hash: ActionHash
  ): Promise<Link[]> {
    return (await hc.callZome(
      'users_organizations',
      'get_organization_coordinators_links',
      organization_original_action_hash
    )) as Link[];
  }

  async getOrganizationCoordinators(
    organization_original_action_hash: ActionHash
  ): Promise<User[]> {
    return (await hc.callZome(
      'users_organizations',
      'get_organization_coordinators',
      organization_original_action_hash
    )) as User[];
  }

  async isOrganizationCoordinator(
    organization_original_action_hash: ActionHash,
    user_original_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'is_organization_coordinator', {
      organization_original_action_hash,
      user_original_action_hash
    })) as boolean;
  }

  async checkIfAgentIsOrganizationCoordinator(
    user_original_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'check_if_agent_is_organization_coordinator', {
      user_original_action_hash
    })) as boolean;
  }

  async leaveOrganization(organization_original_action_hash: ActionHash): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'leave_organization', {
      organization_original_action_hash
    })) as boolean;
  }

  async removeOrganizationMember(
    organization_original_action_hash: ActionHash,
    user_original_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'remove_organization_member', {
      organization_original_action_hash,
      user_original_action_hash
    })) as boolean;
  }

  async removeOrganizationCoordinator(
    organization_original_action_hash: ActionHash,
    user_original_action_hash: ActionHash
  ) {
    return (await hc.callZome('users_organizations', 'remove_organization_coordinator', {
      organization_original_action_hash,
      user_original_action_hash
    })) as boolean;
  }

  async updateOrganization(
    organization_original_action_hash: ActionHash,
    previous_action_hash: ActionHash,
    updated_organization: Organization
  ): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'update_organization', {
      organization_original_action_hash,
      previous_action_hash,
      updated_organization
    })) as boolean;
  }

  async deleteOrganization(organization_original_action_hash: ActionHash): Promise<boolean> {
    return (await hc.callZome('users_organizations', 'delete_organization', {
      organization_original_action_hash
    })) as boolean;
  }
}

const organizationsStore = new OrganizationsStore();
export default organizationsStore;
