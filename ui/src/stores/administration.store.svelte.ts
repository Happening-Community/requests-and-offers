import type { ActionHash, AgentPubKey, Record } from '@holochain/client';
import { decodeRecords } from '@utils';
import type { UIStatus, Revision, UIUser, UIOrganization } from '@/types/ui';
import { AdministrationEntity, type StatusInDHT } from '@/types/holochain';
import { AdministrationService } from '@/services/zomes/administration.service';
import usersStore from './users.store.svelte';
import organizationsStore from './organizations.store.svelte';
import hc from '@/services/HolochainClientService.svelte';

class AdministrationStore {
  allStatusesHistory: Revision[] = $state([]);
  administrators: UIUser[] = $state([]);
  nonAdministrators: UIUser[] = $state([]);
  agentIsAdministrator = $state(false);
  allUsers: UIUser[] = $state([]);
  allOrganizations: UIOrganization[] = $state([]);

  async initialize() {
    await Promise.all([
      this.fetchAllUsers(),
      this.fetchAllOrganizations(),
      this.getAllRevisionsForAllUsers()
    ]);
  }

  async fetchAllUsers() {
    this.allUsers = await usersStore.getAllUsers();
    await this.getAllNetworkAdministrators(); // This will update administrators and nonAdministrators
    return this.allUsers;
  }

  async fetchAllOrganizations() {
    this.allOrganizations = await organizationsStore.getAllOrganizations();
    return this.allOrganizations;
  }

  // Network administrator methods
  async registerNetworkAdministrator(
    entity_original_action_hash: ActionHash,
    agent_pubkeys: AgentPubKey[]
  ): Promise<boolean> {
    try {
      const result = await AdministrationService.registerAdministrator(
        AdministrationEntity.Network,
        entity_original_action_hash,
        agent_pubkeys
      );

      if (result) {
        console.log('Successfully registered network administrator');
        // Refresh the administrators list
        await this.getAllNetworkAdministrators();
      } else {
        console.warn('Failed to register network administrator');
      }

      return result;
    } catch (error) {
      console.error('Error in registerNetworkAdministrator:', error);
      throw error;
    }
  }

  async addNetworkAdministrator(agent_pubkey: AgentPubKey): Promise<boolean> {
    return await AdministrationService.addAdministrator(AdministrationEntity.Network, agent_pubkey);
  }

  async removeNetworkAdministrator(agent_pubkey: AgentPubKey): Promise<boolean> {
    return await AdministrationService.removeAdministrator(
      AdministrationEntity.Network,
      agent_pubkey
    );
  }

  async isNetworkAdministrator(agent_pubkey: AgentPubKey): Promise<boolean> {
    return (this.agentIsAdministrator =
      await AdministrationService.checkIfAgentIsAdministrator(agent_pubkey));
  }

  async getAllNetworkAdministrators(): Promise<UIUser[]> {
    const adminLinks = await AdministrationService.getAllAdministratorsLinks(
      AdministrationEntity.Network
    );

    await this.checkIfAgentIsAdministrator((await hc.getAppInfo())!.agent_pub_key);

    // If the current agent is an administrator, use getAllUsers, otherwise use getAcceptedUsers
    const allUsers = this.agentIsAdministrator
      ? await usersStore.getAllUsers()
      : await usersStore.getAcceptedUsers();

    const admins = allUsers.filter((user) =>
      adminLinks.some((link) => link.target.toString() === user.original_action_hash?.toString())
    );

    this.administrators = admins;
    this.nonAdministrators = allUsers.filter(
      (user) =>
        !admins.some(
          (admin) =>
            admin.original_action_hash?.toString() === user.original_action_hash?.toString()
        )
    );

    return admins;
  }

  async checkIfAgentIsAdministrator(agent_pubkey: AgentPubKey): Promise<boolean> {
    const isAdmin = await AdministrationService.checkIfAgentIsAdministrator(agent_pubkey);
    this.agentIsAdministrator = isAdmin;
    return isAdmin;
  }

  // Status management methods
  private convertToUIStatus(status: StatusInDHT, timestamp?: number): UIStatus {
    let duration: number | undefined;

    if (status?.suspended_until) {
      const suspendedUntil = new Date(status.suspended_until).getTime();
      duration = suspendedUntil - (timestamp || Date.now());
    }

    return {
      ...status,
      duration
    };
  }

  async createStatus(status: StatusInDHT): Promise<void> {
    await AdministrationService.createStatus(status);
  }

  async getAllRevisionsForStatus(original_status_hash: ActionHash): Promise<Revision[]> {
    const records = await AdministrationService.getAllRevisionsForStatus(original_status_hash);
    const revisions: Revision[] = [];

    for (const record of records) {
      const status = decodeRecords([record])[0] as StatusInDHT;
      const user = await usersStore.getLatestUser(record.signed_action.hashed.hash);
      if (!user) continue;

      revisions.push({
        user,
        status: this.convertToUIStatus(status, record.signed_action.hashed.content.timestamp),
        timestamp: record.signed_action.hashed.content.timestamp
      });
    }

    return revisions;
  }

  async getLatestStatus(original_action_hash: ActionHash): Promise<UIStatus | null> {
    const record = await AdministrationService.getLatestStatusRecord(original_action_hash);
    if (!record) return null;

    const status = decodeRecords([record])[0] as StatusInDHT;
    return this.convertToUIStatus(status);
  }

  async getLatestStatusForEntity(
    entity_original_action_hash: ActionHash,
    entity_type: AdministrationEntity
  ): Promise<Record | null> {
    const record = await AdministrationService.getLatestStatusRecordForEntity(
      entity_original_action_hash,
      entity_type
    );
    return record;
  }

  async getAllStatusesForEntity(
    entity_original_action_hash: ActionHash,
    entity_type: AdministrationEntity
  ): Promise<Revision[]> {
    const records = await AdministrationService.getAllStatusesForEntity(
      entity_original_action_hash,
      entity_type
    );

    const revisions: Revision[] = [];

    for (const record of records) {
      const status = decodeRecords([record])[0] as StatusInDHT;
      const user = await usersStore.getLatestUser(record.signed_action.hashed.hash);
      if (!user) continue;

      const timestamp = record.signed_action.hashed.content.timestamp;
      revisions.push({
        user,
        status: this.convertToUIStatus(status, timestamp),
        timestamp
      });
    }

    this.allStatusesHistory = revisions;
    return revisions;
  }

  async getAllRevisionsForAllUsers(): Promise<Revision[]> {
    const allUsers = await usersStore.getAllUsers();
    const revisions: Revision[] = [];

    for (const user of allUsers) {
      if (!user.original_action_hash) continue;
      const statusRevisions = await this.getAllStatusesForEntity(
        user.original_action_hash,
        AdministrationEntity.Users
      );
      revisions.push(...statusRevisions);
    }

    revisions.sort((a, b) => b.timestamp - a.timestamp);
    this.allStatusesHistory = revisions;
    return revisions;
  }

  // Organization status management methods
  async updateOrganizationStatus(
    entity_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    new_status: StatusInDHT
  ): Promise<boolean> {
    return await AdministrationService.updateEntityStatus(
      AdministrationEntity.Organizations,
      entity_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      new_status
    );
  }

  async getAllRevisionsForAllOrganizations(): Promise<Revision[]> {
    const revisions: Revision[] = [];

    for (const organization of this.allOrganizations) {
      if (!organization.original_action_hash) continue;
      const statusRevisions = await this.getAllStatusesForEntity(
        organization.original_action_hash,
        AdministrationEntity.Organizations
      );
      revisions.push(...statusRevisions);
    }

    revisions.sort((a, b) => b.timestamp - a.timestamp);
    return revisions;
  }

  // User status management methods
  async updateUserStatus(
    entity_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    new_status: StatusInDHT
  ): Promise<boolean> {
    return await AdministrationService.updateEntityStatus(
      AdministrationEntity.Users,
      entity_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      new_status
    );
  }

  async suspendUserIndefinitely(
    entity_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    reason: string
  ): Promise<boolean> {
    return await this.updateUserStatus(
      entity_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      {
        status_type: 'suspended indefinitely',
        reason
      }
    );
  }

  async suspendUserTemporarily(
    entity_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    reason: string,
    duration_in_days: number
  ): Promise<boolean> {
    const suspended_until = Date.now() + duration_in_days * 24 * 60 * 60 * 1000;
    return await this.updateUserStatus(
      entity_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      {
        status_type: 'suspended temporarily',
        reason,
        suspended_until: suspended_until.toString()
      }
    );
  }

  async unsuspendUser(
    entity_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash
  ): Promise<boolean> {
    return await this.updateUserStatus(
      entity_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      {
        status_type: 'accepted'
      }
    );
  }

  getRemainingSuspensionTime(status: UIStatus): number | null {
    if (!status.suspended_until) return null;
    const remaining = Number(status.suspended_until) - Date.now();
    return remaining > 0 ? remaining : null;
  }

  // Helper methods
  async refreshAll() {
    await this.initialize();
  }

  async refreshUsers() {
    await this.fetchAllUsers();
    await this.getAllRevisionsForAllUsers();
  }

  async refreshOrganizations() {
    await this.fetchAllOrganizations();
    await this.getAllRevisionsForAllOrganizations();
  }
}

const administrationStore = new AdministrationStore();
export default administrationStore;
