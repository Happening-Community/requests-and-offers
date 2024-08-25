import type { ActionHash, Link, Record } from '@holochain/client';
import hc from '@services/HolochainClientService.svelte';
import { decodeRecords } from '@utils';
import type { User } from './users.svelte';
import usersStore from './users.svelte';

export type StatusType =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'suspended temporarily'
  | 'suspended indefinitely';

export type Status = {
  status_type: StatusType;
  reason?: string;
  timestamp?: number;
};

class AdministratorsStore {
  allUsers: User[] = $state([]);
  administrators: User[] = $state([]);
  nonAdministrators: User[] = $state([]);
  agentIsAdministrator = $state(false);

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

    console.log('all users', recordsContents);

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
    if (!status.timestamp) return null;

    const suspensionDate = new Date(status.timestamp);
    const now = new Date();

    return suspensionDate.getTime() - now.getTime();
  }
}

const administratorsStore = new AdministratorsStore();
export default administratorsStore;
