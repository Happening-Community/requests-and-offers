import { decodeRecords } from '@utils';
import hc from '@services/HolochainClientService.svelte';
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';
import administratorsStore from './administrators.svelte';

export type UserType = 'creator' | 'advocate';
export type UserStatus = 'pending' | 'accepted' | 'rejected' | 'suspended' | `suspended ${string}`;

type UserInDHT = {
  name: string;
  nickname: string;
  bio?: string;
  picture?: Uint8Array;
  user_type: UserType;
  skills?: string[];
  email: string;
  phone?: string;
  time_zone?: string;
  location?: string;
};

type UserAdditionalFields = {
  remaining_time?: number;
  original_action_hash?: ActionHash;
  previous_action_hash?: ActionHash;
  status?: UserStatus;
};

export type User = UserInDHT & UserAdditionalFields;

class UsersStore {
  acceptedUsers: User[] = $state([]);
  myProfile: User | undefined = $state();

  async createUser(user: User): Promise<Record> {
    return await hc.callZome('users', 'create_user', user);
  }

  async getLatestUserRecord(original_action_hash: ActionHash): Promise<Record | null> {
    const record = await hc.callZome('users', 'get_latest_user_record', original_action_hash);

    return record;
  }

  async getLatestUser(original_action_hash: ActionHash): Promise<User | null> {
    const record = await this.getLatestUserRecord(original_action_hash);
    const myStatus = await administratorsStore.getLatestStatusForUser(original_action_hash);

    return record
      ? {
          ...decodeRecords([record])[0],
          status: myStatus,
          original_action_hash: original_action_hash,
          previous_action_hash: record.signed_action.hashed.hash
        }
      : null;
  }

  private async getAgentUserLinks(agent: AgentPubKey): Promise<Link[]> {
    return await hc.callZome('users', 'get_agent_user', agent);
  }

  async getAgentUser(agent: AgentPubKey): Promise<User | null> {
    const links = await this.getAgentUserLinks(agent);
    if (links.length === 0) return null;

    return await this.getLatestUser(links[0].target);
  }

  async getMyProfile(): Promise<User | null> {
    const agentPubKey = (await hc.getAppInfo())!.agent_pub_key;
    const agentUser = await this.getAgentUser(agentPubKey);

    if (agentUser) this.myProfile = agentUser;

    return agentUser;
  }

  private async getAcceptedUsersLinks(): Promise<Link[]> {
    return await hc.callZome('administration', 'get_accepted_users', null);
  }

  private async getAcceptedUsersLinksAndRecords(): Promise<[Link[], Record[]]> {
    const links = await this.getAcceptedUsersLinks();
    let usersRecords: Record[] = [];

    for (let link of links) {
      const record = await this.getLatestUserRecord(link.target);
      if (record) usersRecords.push(record);
    }

    return [links, usersRecords];
  }

  async getAcceptedUsers(): Promise<User[]> {
    const [links, records] = await this.getAcceptedUsersLinksAndRecords();

    let recordsContents: User[] = [];

    for (let i = 0; i < records.length; i++) {
      let user = decodeRecords([records[i]])[0];

      let status = await administratorsStore.getLatestStatusForUser(
        records[i].signed_action.hashed.hash
      );

      recordsContents.push({
        ...user,
        status,
        remaining_time: status && administratorsStore.getRemainingSuspensionTime(status!),
        original_action_hash: links[i].target,
        previous_action_hash: records[i].signed_action.hashed.hash
      });
    }

    this.acceptedUsers = recordsContents;

    return recordsContents;
  }

  async updateMyProfile(updated_user: User): Promise<Record> {
    await this.getMyProfile();

    if (this.myProfile === null) {
      throw new Error('No user found');
    }

    const original_action_hash = this.myProfile!.original_action_hash;
    const previous_action_hash = this.myProfile!.previous_action_hash;

    const newUserRecord = await hc.callZome('users', 'update_user', {
      original_action_hash,
      previous_action_hash,
      updated_user
    });

    return newUserRecord;
  }
}

const usersStore = new UsersStore();
export default usersStore;
