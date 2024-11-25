import type { ActionHash, Record } from '@holochain/client';
import { decodeRecords } from '@utils';
import type { UIOrganization, UIUser, UIStatus } from '@/types/ui';
import type { OrganizationInDHT } from '@/types/holochain';
import { AdministrationEntity } from '@/types/holochain';
import { OrganizationsService } from '@/services/zomes/organizations.service';
import usersStore from './users.store.svelte';
import administrationStore from './administration.store.svelte';

class OrganizationsStore {
  allOrganizations: UIOrganization[] = $state([]);
  acceptedOrganizations: UIOrganization[] = $state([]);
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
          const status = await administrationStore.getLatestStatusForEntity(
            statusLink.target,
            AdministrationEntity.Organizations
          );
          if (status) {
            organization.status = decodeRecords([status])[0] as UIStatus;
          }
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
      const status = await administrationStore.getLatestStatusForEntity(
        statusLink.target,
        AdministrationEntity.Organizations
      );
      if (status) {
        organization.status = decodeRecords([status])[0] as UIStatus;
      }
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
    const organizations = await Promise.all(
      links.map(async (link) => {
        const organization = await this.getLatestOrganization(link.target);
        if (!organization) return null;
        return organization;
      })
    );
    return organizations.filter((org): org is UIOrganization => org !== null);
  }

  async getUserCoordinatedOrganizations(
    userOriginalActionHash: ActionHash
  ): Promise<UIOrganization[]> {
    const links = await OrganizationsService.getUserOrganizationsLinks(userOriginalActionHash);
    const organizations = await Promise.all(
      links.map(async (link) => {
        const organization = await this.getLatestOrganization(link.target);
        if (!organization) return null;
        return organization;
      })
    );
    return organizations
      .filter((org): org is UIOrganization => org !== null)
      .filter((org) =>
        org.coordinators.some((coordinator) => coordinator === userOriginalActionHash)
      );
  }

  async getAcceptedOrganizations(): Promise<UIOrganization[]> {
    const links = await OrganizationsService.getAcceptedOrganizationsLinks();
    const organizations = await Promise.all(
      links.map(async (link) => {
        const organization = await this.getLatestOrganization(link.target);
        return organization;
      })
    );

    this.acceptedOrganizations = organizations.filter((org): org is UIOrganization => org !== null);

    return this.acceptedOrganizations;
  }

  async getOrganizationStatusLink(original_action_hash: ActionHash) {
    return await administrationStore.getEntityStatusLink(
      original_action_hash,
      AdministrationEntity.Organizations
    );
  }

  // New methods for organization management
  async updateOrganization(hash: ActionHash, updates: Partial<OrganizationInDHT>): Promise<UIOrganization | null> {
    const success = await OrganizationsService.updateOrganization(hash, updates);
    if (success) {
      return this.refreshOrganization(hash);
    }
    return null;
  }

  async deleteOrganization(hash: ActionHash): Promise<boolean> {
    const success = await OrganizationsService.deleteOrganization(hash);
    if (success) {
      this.allOrganizations = this.allOrganizations.filter(
        (org) => org.original_action_hash?.toString() !== hash.toString()
      );
      if (this.currentOrganization?.original_action_hash?.toString() === hash.toString()) {
        this.currentOrganization = null;
      }
    }
    return success;
  }

  async leaveOrganization(hash: ActionHash): Promise<boolean> {
    const success = await OrganizationsService.leaveOrganization(hash);
    if (success) {
      await this.refresh();
    }
    return success;
  }

  async isOrganizationCoordinator(orgHash: ActionHash, userHash: ActionHash): Promise<boolean> {
    return OrganizationsService.isOrganizationCoordinator(orgHash, userHash);
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
