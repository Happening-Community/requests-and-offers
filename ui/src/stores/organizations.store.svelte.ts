import type { ActionHash, Record } from '@holochain/client';
import { decodeRecords } from '@utils';
import type { UIOrganization, UIUser } from '@/types/ui';
import type { OrganizationInDHT } from '@/types/holochain';
import { OrganizationsService } from '@/services/zomes/organizations.service';
import usersStore from './users.store.svelte';

class OrganizationsStore {
  allOrganizations: UIOrganization[] = $state([]);
  currentOrganization: UIOrganization | null = $state(null);

  async createOrganization(organization: OrganizationInDHT): Promise<Record> {
    const record = await OrganizationsService.createOrganization(organization);
    const newOrganization: UIOrganization = {
      ...decodeRecords([record])[0],
      original_action_hash: record.signed_action.hashed.hash,
      previous_action_hash: record.signed_action.hashed.hash,
      members: [],
      coordinators: []
    };

    this.allOrganizations = [...this.allOrganizations, newOrganization];
    return record;
  }

  async getLatestOrganization(original_action_hash: ActionHash): Promise<UIOrganization | null> {
    const record = await OrganizationsService.getLatestOrganizationRecord(original_action_hash);
    if (!record) return null;

    const organization: UIOrganization = {
      ...decodeRecords([record])[0],
      original_action_hash: record.signed_action.hashed.hash,
      previous_action_hash: record.signed_action.hashed.hash,
      members: [],
      coordinators: []
    };

    // Get members and coordinators
    const membersLinks =
      await OrganizationsService.getOrganizationMembersLinks(original_action_hash);
    const coordinatorsLinks =
      await OrganizationsService.getOrganizationCoordinatorsLinks(original_action_hash);

    organization.members = membersLinks.map((link) => link.target);
    organization.coordinators = coordinatorsLinks.map((link) => link.target);

    return organization;
  }

  async getAllOrganizations(): Promise<UIOrganization[]> {
    const links = await OrganizationsService.getAllOrganizationsLinks();
    const organizations: UIOrganization[] = [];

    for (const link of links) {
      const organization = await this.getLatestOrganization(link.target);
      if (organization) {
        const statusLink = await OrganizationsService.getOrganizationStatusLink(link.target);
        if (statusLink) {
          organization.status = statusLink.target;
        }
        organizations.push(organization);
      }
    }

    this.allOrganizations = organizations;
    return organizations;
  }

  async getOrganizationByActionHash(actionHash: ActionHash): Promise<UIOrganization | null> {
    return (
      this.allOrganizations.find(
        (org) => org.original_action_hash?.toString() === actionHash.toString()
      ) || null
    );
  }

  async refreshOrganization(original_action_hash: ActionHash): Promise<UIOrganization | null> {
    const organization = await this.getLatestOrganization(original_action_hash);
    if (!organization) return null;

    const statusLink = await OrganizationsService.getOrganizationStatusLink(original_action_hash);
    if (statusLink) {
      organization.status = statusLink.target;
    }

    this.allOrganizations = this.allOrganizations.map((org) =>
      org.original_action_hash?.toString() === original_action_hash.toString() ? organization : org
    );

    if (
      this.currentOrganization?.original_action_hash?.toString() === original_action_hash.toString()
    ) {
      this.currentOrganization = organization;
    }

    return organization;
  }

  async setCurrentOrganization(organization: UIOrganization) {
    this.currentOrganization = organization;
  }

  async refreshCurrentOrganization(): Promise<UIOrganization | null> {
    if (!this.currentOrganization?.original_action_hash) return null;
    return this.refreshOrganization(this.currentOrganization.original_action_hash);
  }

  async addMember(organization: UIOrganization, memberActionHash: ActionHash): Promise<boolean> {
    const success = await OrganizationsService.addOrganizationMember(
      organization.original_action_hash!,
      memberActionHash
    );
    if (success) {
      await this.refreshOrganization(organization.original_action_hash!);
    }
    return success;
  }

  async removeMember(organization: UIOrganization, memberActionHash: ActionHash): Promise<boolean> {
    const success = await OrganizationsService.removeOrganizationMember(
      organization.original_action_hash!,
      memberActionHash
    );
    if (success) {
      await this.refreshOrganization(organization.original_action_hash!);
    }
    return success;
  }

  async addCoordinator(
    organization: UIOrganization,
    coordinatorActionHash: ActionHash
  ): Promise<boolean> {
    const success = await OrganizationsService.addOrganizationCoordinator(
      organization.original_action_hash!,
      coordinatorActionHash
    );
    if (success) {
      await this.refreshOrganization(organization.original_action_hash!);
    }
    return success;
  }

  async removeCoordinator(
    organization: UIOrganization,
    coordinatorActionHash: ActionHash
  ): Promise<boolean> {
    const success = await OrganizationsService.removeOrganizationCoordinator(
      organization.original_action_hash!,
      coordinatorActionHash
    );
    if (success) {
      await this.refreshOrganization(organization.original_action_hash!);
    }
    return success;
  }

  async getUserOrganizations(userActionHash: ActionHash): Promise<UIOrganization[]> {
    const links = await OrganizationsService.getUserOrganizationsLinks(userActionHash);
    return this.getOrganizationsByActionHashes(links.map((link) => link.target));
  }

  async getUserCoordinatedOrganizations(userActionHash: ActionHash): Promise<UIOrganization[]> {
    const links = await OrganizationsService.getUserCoordinatedOrganizationsLinks(userActionHash);
    return this.getOrganizationsByActionHashes(links.map((link) => link.target));
  }

  async getAcceptedOrganizations(): Promise<UIOrganization[]> {
    const links = await OrganizationsService.getAcceptedOrganizationsLinks();
    return this.getOrganizationsByActionHashes(links.map((link) => link.target));
  }

  // Helper methods
  getOrganizationsByActionHashes(actionHashes: ActionHash[]): UIOrganization[] {
    return this.allOrganizations.filter((org) =>
      actionHashes.some((hash) => hash.toString() === org.original_action_hash?.toString())
    );
  }

  async getMemberUsers(organization: UIOrganization): Promise<UIUser[]> {
    return usersStore.getUsersByActionHashes(organization.members);
  }

  async getCoordinatorUsers(organization: UIOrganization): Promise<UIUser[]> {
    return usersStore.getUsersByActionHashes(organization.coordinators);
  }

  async refresh(): Promise<void> {
    await this.getAllOrganizations();
    if (this.currentOrganization) {
      await this.refreshCurrentOrganization();
    }
  }
}

const organizationsStore = new OrganizationsStore();
export default organizationsStore;
