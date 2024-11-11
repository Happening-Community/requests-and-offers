/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';
import hc from '@services/HolochainClientService.svelte';
import { decodeRecords } from '@utils';
import type { User } from './users.svelte';
import usersStore from './users.svelte';
import { decode } from '@msgpack/msgpack';
import type { Organization } from './organizations.svelte';

export type StatusType =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'suspended temporarily'
  | 'suspended indefinitely';

type StatusInDHT = {
  status_type: StatusType;
  reason?: string;
  suspended_until?: number;
};

type StatusAdditionalFields = {
  duration?: number;
};

export type Status = StatusInDHT & StatusAdditionalFields;

export type Revision = {
  user: User;
  status: Status;
  timestamp: number;
};

export enum AdministrationEntity {
  Network = 'network',
  Users = 'users',
  Organizations = 'organizations'
}

class AdministratorsStore {
  allUsers: User[] = $state([]);
  allOrganizations: Organization[] = $state([]);
  administrators: User[] = $state([]);
  nonAdministrators: User[] = $state([]);
  allStatusesHistory: Revision[] = $state([]);
  agentIsAdministrator = $state(false);

  private async getAllUsersLinks(): Promise<Link[]> {
    return (await hc.callZome('users_organizations', 'get_all_users', null)) as Link[];
  }

  private async getAllUsersLinksAndRecords(): Promise<[Link[], Record[]]> {
    const usersLinks: Link[] = await this.getAllUsersLinks();
    const usersRecords: Record[] = [];

    for (const link of usersLinks) {
      const record = await usersStore.getLatestUserRecord(link.target);
      if (record) usersRecords.push(record);
    }

    return [usersLinks, usersRecords];
  }

  async getAllUsers(): Promise<User[]> {
    const [usersLinks, usersRecords] = await this.getAllUsersLinksAndRecords();

    const recordsContents: User[] = [];

    for (let i = 0; i < usersRecords.length; i++) {
      const user = decodeRecords([usersRecords[i]])[0];
      const status = await this.getLatestStatusForEntity(
        usersLinks[i].target,
        AdministrationEntity.Users
      );

      recordsContents.push({
        ...user,
        status,
        remaining_time: status ? this.getRemainingSuspensionTime(status) : 0,
        original_action_hash: usersLinks[i].target,
        previous_action_hash: usersRecords[i].signed_action.hashed.hash
      });
    }
    this.allUsers = recordsContents;

    return recordsContents;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    const organizations = (await hc.callZome(
      'users_organizations',
      'get_all_organizations',
      null
    )) as Organization[];

    console.log('organizations', organizations);

    this.allOrganizations = organizations;

    return organizations;
  }

  async registerNetworkAdministrator(
    entity_original_action_hash: Uint8Array,
    agent_pubkeys: AgentPubKey[]
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'register_administrator', {
      entity: AdministrationEntity.Network,
      entity_original_action_hash,
      agent_pubkeys
    })) as boolean;
  }

  async checkIfAgentIsAdministrator(agentPubKey: Uint8Array): Promise<boolean> {
    const result = (await hc.callZome('administration', 'check_if_agent_is_administrator', {
      entity: AdministrationEntity.Network,
      agent_pubkey: agentPubKey
    })) as boolean;
    this.agentIsAdministrator = result;

    return result;
  }

  async checkIfUserIsAdministrator(entity_original_action_hash: Uint8Array): Promise<boolean> {
    return (await hc.callZome('administration', 'check_if_entity_is_administrator', {
      entity: AdministrationEntity.Network,
      entity_original_action_hash
    })) as boolean;
  }

  private async getAllAdministratorsLinks(): Promise<Link[]> {
    return (await hc.callZome(
      'administration',
      'get_all_administrators_links',
      AdministrationEntity.Network
    )) as Link[];
  }

  async getAllAdministrators(): Promise<User[]> {
    const links = await this.getAllAdministratorsLinks();
    console.log('links', links);

    const administratorUsersPromises = links.map(
      async (link) => await usersStore.getLatestUser(link.target)
    );

    const administratorUsers = (await Promise.all(administratorUsersPromises)).filter(
      (p) => p !== null
    ) as User[];
    this.administrators = administratorUsers;

    return administratorUsers;
  }

  async removeAdministrator(
    entity_original_action_hash: Uint8Array,
    agent_pubkeys: AgentPubKey[]
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'remove_administrator', {
      entity: AdministrationEntity.Network,
      entity_original_action_hash,
      agent_pubkeys
    })) as boolean;
  }

  async getNonAdministratorUsers(): Promise<User[]> {
    const links = await this.getAllUsersLinks();
    const nonAdministratorsUsers: User[] = [];

    for (const link of links) {
      if ((await this.checkIfUserIsAdministrator(link.target)) === false) {
        const user = await usersStore.getLatestUser(link.target);
        user && nonAdministratorsUsers.push(user);
      }
    }
    this.nonAdministrators = nonAdministratorsUsers;

    return nonAdministratorsUsers;
  }

  async getLatestStatusRecordForEntity(
    entity_original_action_hash: ActionHash,
    entity: AdministrationEntity
  ): Promise<Record | null> {
    return (await hc.callZome('administration', 'get_latest_status_record_for_entity', {
      entity,
      entity_original_action_hash
    })) as Record | null;
  }

  async getLatestStatusForEntity(
    entity_original_action_hash: ActionHash,
    entity: AdministrationEntity
  ): Promise<Status | null> {
    return (await hc.callZome('administration', 'get_latest_status_for_entity', {
      entity,
      entity_original_action_hash
    })) as Status | null;
  }

  async getUserStatusLink(user_original_action_hash: ActionHash): Promise<Link | null> {
    return (await hc.callZome(
      'users_organizations',
      'get_user_status_link',
      user_original_action_hash
    )) as Link | null;
  }

  async getAllRevisionsForStatus(
    status_original_action_hash: ActionHash,
    user: User
  ): Promise<Revision[]> {
    const revisions: Revision[] = [];
    // const user = await usersStore.getLatestUser(status_original_action_hash);

    const recordsForEntity = (await hc.callZome(
      'administration',
      'get_all_revisions_for_status',
      status_original_action_hash
    )) as Record[];

    for (const record of recordsForEntity) {
      const timestamp = record.signed_action.hashed.content.timestamp / 1000;
      const status = decode((record.entry as any).Present.entry) as Status;
      const suspended_until = new Date(status.suspended_until!).getTime();
      let duration: number | undefined;

      if (status.suspended_until) {
        duration = suspended_until - timestamp;
      }

      revisions.push({
        user,
        status: {
          ...status,
          duration
        },
        timestamp: record.signed_action.hashed.content.timestamp
      });
    }

    revisions.sort((a, b) => b.timestamp - a.timestamp);

    return revisions;
  }

  async getAllRevisionsForAllUsers(): Promise<Revision[]> {
    const userLinks = await this.getAllUsersLinks();
    const revisions: Revision[] = [];

    for (const userLink of userLinks) {
      const user = await usersStore.getLatestUser(userLink.target);
      const statusLink = await this.getUserStatusLink(userLink.target);
      if (user && statusLink) {
        const revisionsForEntity = await this.getAllRevisionsForStatus(statusLink.target, user);

        for (const revision of revisionsForEntity) {
          revisions.push(revision);
        }
      }
    }

    revisions.sort((a, b) => b.timestamp - a.timestamp);

    this.allStatusesHistory = revisions;
    return revisions;
  }

  async updateUserStatus(
    entity_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    new_status: Status
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'update_entity_status', {
      entity: AdministrationEntity.Users,
      entity_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      new_status
    })) as boolean;
  }

  async suspendUserIndefinitely(
    entity_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    reason: string
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'suspend_entity_indefinitely', {
      entity: AdministrationEntity.Users,
      entity_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      reason
    })) as boolean;
  }

  async suspendUserTemporarily(
    entity_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    reason: string,
    duration_in_days: number
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'suspend_entity_temporarily', {
      entity: AdministrationEntity.Users,
      entity_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      reason,
      duration_in_days
    })) as boolean;
  }

  async unsuspendUser(
    entity_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'unsuspend_user', {
      entity: AdministrationEntity.Users,
      entity_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash
    })) as boolean;
  }

  async unsuspendUserIfTimePassed(
    entity_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'unsuspend_entity_if_time_passed', {
      entity: AdministrationEntity.Users,
      entity_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash
    })) as boolean;
  }

  getRemainingSuspensionTime(status: Status): number | null {
    if (!status) return null;
    if (!status.suspended_until) return null;

    const suspensionDate = new Date(status.suspended_until);
    const now = new Date();

    return suspensionDate.getTime() - now.getTime();
  }
}

const administratorsStore = new AdministratorsStore();
export default administratorsStore;
