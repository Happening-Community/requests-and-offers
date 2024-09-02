/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ActionHash, Link, Record } from '@holochain/client';
import hc from '@services/HolochainClientService.svelte';
import { decodeRecords } from '@utils';
import type { User } from './users.svelte';
import usersStore from './users.svelte';
import { decode } from '@msgpack/msgpack';

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

class AdministratorsStore {
  allUsers: User[] = $state([]);
  administrators: User[] = $state([]);
  nonAdministrators: User[] = $state([]);
  agentIsAdministrator = $state(false);
  allStatusHistory: Revision[] = $state([]);

  private async getAllUsersLinks(): Promise<Link[]> {
    return (await hc.callZome('users', 'get_all_users', null)) as Link[];
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
      const status = await this.getLatestStatusForUser(usersLinks[i].target);

      console.log('status', status);

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

  async registerAdministrator(original_action_hash: Uint8Array): Promise<boolean> {
    return (await hc.callZome(
      'administration',
      'register_administrator',
      original_action_hash
    )) as boolean;
  }

  async checkIfAgentIsAdministrator(agentPubKey: Uint8Array): Promise<boolean> {
    const result = (await hc.callZome(
      'administration',
      'check_if_agent_is_administrator',
      agentPubKey
    )) as boolean;
    this.agentIsAdministrator = result;

    return result;
  }

  async checkIfUserIsAdministrator(action_hash: Uint8Array): Promise<boolean> {
    return (await hc.callZome(
      'administration',
      'check_if_user_is_administrator',
      action_hash
    )) as boolean;
  }

  private async getAllAdministratorsLinks(): Promise<Link[]> {
    return (await hc.callZome('administration', 'get_all_administrators_links', null)) as Link[];
  }

  async getAllAdministrators(): Promise<User[]> {
    const links = await this.getAllAdministratorsLinks();
    const administratorUsersPromises = links.map(
      async (link) => await usersStore.getLatestUser(link.target)
    );

    const administratorUsers = (await Promise.all(administratorUsersPromises)).filter(
      (p) => p !== null
    ) as User[];
    this.administrators = administratorUsers;

    return administratorUsers;
  }

  async removeAdministrator(original_action_hash: Uint8Array): Promise<boolean> {
    return (await hc.callZome(
      'administration',
      'remove_administrator',
      original_action_hash
    )) as boolean;
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

  async getLatestStatusRecordForUser(
    user_original_action_hash: ActionHash
  ): Promise<Record | null> {
    return (await hc.callZome(
      'administration',
      'get_latest_status_record_for_user',
      user_original_action_hash
    )) as Record | null;
  }

  async getLatestStatusForUser(user_original_action_hash: ActionHash): Promise<Status | null> {
    return (await hc.callZome(
      'administration',
      'get_latest_status_for_user',
      user_original_action_hash
    )) as Status | null;
  }

  async getUserStatusLink(user_original_action_hash: ActionHash): Promise<Link | null> {
    return (await hc.callZome(
      'users',
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

    const recordsForUser = (await hc.callZome(
      'administration',
      'get_all_revisions_for_status',
      status_original_action_hash
    )) as Record[];

    for (const record of recordsForUser) {
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
        const revisionsForUser = await this.getAllRevisionsForStatus(statusLink.target, user);

        for (const revision of revisionsForUser) {
          revisions.push(revision);
        }
      }
    }

    revisions.sort((a, b) => b.timestamp - a.timestamp);

    this.allStatusHistory = revisions;
    return revisions;
  }

  async updateUserStatus(
    user_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    new_status: Status
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'update_user_status', {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      new_status
    })) as boolean;
  }

  async suspendUserIndefinitely(
    user_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    reason: string
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'suspend_user_indefinitely', {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      reason
    })) as boolean;
  }

  async suspendUserTemporarily(
    user_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    reason: string,
    duration_in_days: number
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'suspend_user_temporarily', {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      reason,
      duration_in_days
    })) as boolean;
  }

  async unsuspendUser(
    user_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'unsuspend_user', {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash
    })) as boolean;
  }

  async unsuspendUserIfTimePassed(
    user_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash
  ): Promise<boolean> {
    return (await hc.callZome('administration', 'unsuspend_user_if_time_passed', {
      user_original_action_hash,
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
