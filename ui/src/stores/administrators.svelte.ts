import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';
import hc from '@services/HolochainClientService';
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

  private async getAllUsersRecordsAndLinks(): Promise<[Link[], Record[]]> {
    const usersLinks: Link[] = await this.getAllUsersLinks();
    let usersRecords: Record[] = [];

    for (let link of usersLinks) {
      const record = await usersStore.getLatestUserRecord(link.target);
      if (record) usersRecords.push(record);
    }

    return [usersLinks, usersRecords];
  }

  async getAllUsers(): Promise<User[]> {
    const [usersLinks, usersRecords] = await this.getAllUsersRecordsAndLinks();

    let recordsContents: User[] = [];

    for (let i = 0; i < usersRecords.length; i++) {
      let user = decodeRecords([usersRecords[i]])[0];
      recordsContents.push({
        ...user,
        remaining_time: this.getRemainingSuspensionTime(user.status),
        original_action_hash: usersLinks[i].target,
        previous_action_hash: usersRecords[i].signed_action.hashed.hash
      });
    }
    this.allUsers = recordsContents;

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

  async updateUserStatus(
    original_action_hash: Uint8Array,
    previous_action_hash: Uint8Array,
    status: UserStatus
  ): Promise<boolean> {
    return await hc.callZome('users', 'update_user_status', {
      original_action_hash,
      previous_action_hash,
      status
    });
  }

  async suspendUserIndefinitely(
    original_action_hash: Uint8Array,
    previous_action_hash: Uint8Array
  ): Promise<boolean> {
    return await hc.callZome('users', 'suspend_user_indefinitely', {
      original_action_hash,
      previous_action_hash
    });
  }

  async suspendUserTemporarily(
    original_action_hash: Uint8Array,
    previous_action_hash: Uint8Array,
    duration_in_days: number
  ): Promise<boolean> {
    return await hc.callZome('users', 'suspend_user_temporarily', {
      original_action_hash,
      previous_action_hash,
      duration_in_days
    });
  }

  async unsuspendUser(
    original_action_hash: Uint8Array,
    previous_action_hash: Uint8Array
  ): Promise<boolean> {
    return await hc.callZome('users', 'unsuspend_user', {
      original_action_hash,
      previous_action_hash
    });
  }

  async unsuspendUserIfTimePassed(
    original_action_hash: Uint8Array,
    previous_action_hash: Uint8Array
  ): Promise<boolean> {
    return await hc.callZome('users', 'unsuspend_user_if_time_passed', {
      original_action_hash,
      previous_action_hash
    });
  }

  getRemainingSuspensionTime(status: UserStatus): number | null {
    const suspensionDate = new Date(status.split(' ')[1]);
    const now = new Date();

    if (!suspensionDate) return null;

    return suspensionDate.getTime() - now.getTime();
  }
}

const administratorsStore = new AdministratorsStore();
export default administratorsStore;
