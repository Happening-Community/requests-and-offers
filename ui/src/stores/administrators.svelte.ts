import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';
import hc from '@services/HolochainClientService.svelte';
import { decodeRecords } from '@utils';
import type { User, UserStatus } from './users.svelte';
import usersStore from './users.svelte';

class AdministratorsStore {
  allUsers: User[] = $state([]);
  administrators: User[] = $state([]);
  nonAdministrators: User[] = $state([]);
  agentIsAdministrator = $state(false);

  private async getAllUsersLinks(): Promise<Link[]> {
    return await hc.callZome('users', 'get_all_users', null);
  }

  private async getAllUsersLinksAndRecords(): Promise<[Link[], Record[]]> {
    const usersLinks: Link[] = await this.getAllUsersLinks();
    let usersRecords: Record[] = [];

    for (let link of usersLinks) {
      const record = await usersStore.getLatestUserRecord(link.target);
      if (record) usersRecords.push(record);
    }

    return [usersLinks, usersRecords];
  }

  async getAllUsers(): Promise<User[]> {
    const [usersLinks, usersRecords] = await this.getAllUsersLinksAndRecords();

    let recordsContents: User[] = [];

    for (let i = 0; i < usersRecords.length; i++) {
      let user = decodeRecords([usersRecords[i]])[0];
      let status = await this.getLatestStatusForUser(usersRecords[i].signed_action.hashed.hash);

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
    return await hc.callZome('administration', 'register_administrator', original_action_hash);
  }

  async checkIfAgentIsAdministrator(agentPubKey: Uint8Array): Promise<boolean> {
    const result = await hc.callZome(
      'administration',
      'check_if_agent_is_administrator',
      agentPubKey
    );
    this.agentIsAdministrator = result;

    return result;
  }

  async checkIfUserIsAdministrator(action_hash: Uint8Array): Promise<boolean> {
    return await hc.callZome('administration', 'check_if_user_is_administrator', action_hash);
  }

  private async getAllAdministratorsLinks(): Promise<Link[]> {
    return (await hc.callZome('administration', 'get_all_administrators_links', null)) as Link[];
  }

  async getAllAdministrators(): Promise<User[]> {
    const links = await this.getAllAdministratorsLinks();
    let administratorUsersPromises = links.map(
      async (link) => await usersStore.getLatestUser(link.target)
    );

    const administratorUsers = (await Promise.all(administratorUsersPromises)).filter(
      (p) => p !== null
    ) as User[];
    this.administrators = administratorUsers;

    return administratorUsers;
  }

  async removeAdministrator(original_action_hash: Uint8Array): Promise<boolean> {
    return await hc.callZome('administration', 'remove_administrator', original_action_hash);
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
    return await hc.callZome(
      'administration',
      'get_latest_status_record_for_user',
      user_original_action_hash
    );
  }

  async getLatestStatusForUser(user_original_action_hash: ActionHash): Promise<UserStatus | null> {
    return await hc.callZome(
      'administration',
      'get_latest_status_for_user',
      user_original_action_hash
    );
  }

  async getProfileStatusLink(user_original_action_hash: ActionHash): Promise<Link | null> {
    return await hc.callZome('users', 'get_profile_status_link', user_original_action_hash);
  }

  async updateUserStatus(
    user_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    new_status: UserStatus
  ): Promise<boolean> {
    return await hc.callZome('administration', 'update_user_status', {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      new_status
    });
  }

  async suspendUserIndefinitely(
    user_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash
  ): Promise<boolean> {
    return await hc.callZome('administration', 'suspend_user_indefinitely', {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash
    });
  }

  async suspendUserTemporarily(
    user_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash,
    duration_in_days: number
  ): Promise<boolean> {
    return await hc.callZome('administration', 'suspend_user_temporarily', {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash,
      duration_in_days
    });
  }

  async unsuspendUser(
    user_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash
  ): Promise<boolean> {
    return await hc.callZome('administration', 'unsuspend_user', {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash
    });
  }

  async unsuspendUserIfTimePassed(
    user_original_action_hash: ActionHash,
    status_original_action_hash: ActionHash,
    status_previous_action_hash: ActionHash
  ): Promise<boolean> {
    return await hc.callZome('administration', 'unsuspend_user_if_time_passed', {
      user_original_action_hash,
      status_original_action_hash,
      status_previous_action_hash
    });
  }

  getRemainingSuspensionTime(status: UserStatus): number | null {
    if (!status) return null;
    const suspensionDate = new Date(status.split(' ')[1]);
    const now = new Date();

    if (!suspensionDate) return null;

    return suspensionDate.getTime() - now.getTime();
  }
}

const administratorsStore = new AdministratorsStore();
export default administratorsStore;
