import { decodeRecords } from '@utils';
import hc from '@services/HolochainClientService.svelte';
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';
import administratorsStore, { type Revision, AdministrationEntity } from './administrators.svelte';
import type { Organization } from './organizations.svelte';
import organizationsStore from './organizations.svelte';

export type UserType = 'creator' | 'advocate';

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
  agents?: AgentPubKey[];
  remaining_time?: number;
  original_action_hash?: ActionHash;
  previous_action_hash?: ActionHash;
  status?: ActionHash;
  status_history?: Revision[];
  organizations?: ActionHash[];
};

export type User = UserInDHT & UserAdditionalFields;

class UsersStore {
  AcceptedUsers: User[] = $state([]);
  myProfile: User | undefined = $state();

  async createUser(user: User): Promise<Record> {
    return (await hc.callZome('users_organizations', 'create_user', user)) as Record;
  }

  async getLatestUserRecord(original_action_hash: ActionHash): Promise<Record | null> {
    const record = (await hc.callZome(
      'users_organizations',
      'get_latest_user_record',
      original_action_hash
    )) as Record | null;

    return record;
  }

  async getLatestUser(user_original_action_hash: ActionHash): Promise<User | null> {
    const record = await this.getLatestUserRecord(user_original_action_hash);
    const myStatus = await administratorsStore.getLatestStatusRecordForEntity(
      user_original_action_hash,
      AdministrationEntity.Users
    );

    const organizationsLinks = await this.getUserOrganizationsLinks(user_original_action_hash);

    return record
      ? {
          ...decodeRecords([record])[0],
          status: myStatus?.signed_action.hashed.hash,
          organizations: organizationsLinks.map((l) => l.target),
          original_action_hash: user_original_action_hash,
          previous_action_hash: record.signed_action.hashed.hash
        }
      : null;
  }

  private async getAgentUserLinks(agent: AgentPubKey): Promise<Link[]> {
    return (await hc.callZome('users_organizations', 'get_agent_user', agent)) as Link[];
  }

  async getAgentUser(agent: AgentPubKey): Promise<User | null> {
    const links = await this.getAgentUserLinks(agent);
    if (links.length === 0) return null;

    return await this.getLatestUser(links[0].target);
  }

  async getUserAgents(original_action_hash: ActionHash): Promise<AgentPubKey[]> {
    return (await hc.callZome(
      'users_organizations',
      'get_user_agents',
      original_action_hash
    )) as AgentPubKey[];
  }

  async getMyProfile(): Promise<User | null> {
    const agentPubKey = (await hc.getAppInfo())!.agent_pub_key;
    const agentUser = await this.getAgentUser(agentPubKey);

    if (agentUser) this.myProfile = agentUser;

    return agentUser;
  }

  private async getAcceptedUsersLinks(): Promise<Link[]> {
    return (await hc.callZome('administration', 'get_accepted_entities', 'users')) as Link[];
  }

  private async getAcceptedUsersLinksAndRecords(): Promise<[Link[], Record[]]> {
    const links = await this.getAcceptedUsersLinks();
    const usersRecords: Record[] = [];

    for (const link of links) {
      const record = await this.getLatestUserRecord(link.target);
      if (record) usersRecords.push(record);
    }

    return [links, usersRecords];
  }

  async getAcceptedUsers(): Promise<User[]> {
    const [links, records] = await this.getAcceptedUsersLinksAndRecords();

    const recordsContents: User[] = [];

    for (let i = 0; i < records.length; i++) {
      const user = decodeRecords([records[i]])[0];

      const status = await administratorsStore.getLatestStatusForEntity(
        records[i].signed_action.hashed.hash,
        AdministrationEntity.Users
      );

      recordsContents.push({
        ...user,
        status,
        remaining_time: status && administratorsStore.getRemainingSuspensionTime(status!),
        original_action_hash: links[i].target,
        previous_action_hash: records[i].signed_action.hashed.hash
      });
    }

    this.AcceptedUsers = recordsContents;

    return recordsContents;
  }

  async getUserOrganizationsLinks(user_original_action_hash: ActionHash): Promise<Link[]> {
    return (await hc.callZome(
      'users_organizations',
      'get_user_organizations_links',
      user_original_action_hash
    )) as Link[];
  }

  async getUserOrganizations(user_original_action_hash: ActionHash): Promise<Organization[]> {
    const organizationsLinks = await this.getUserOrganizationsLinks(user_original_action_hash);

    const organizations: Organization[] = [];

    for (const link of organizationsLinks) {
      const record = await organizationsStore.getLatestOrganizationRecord(link.target);

      if (!record) continue;

      const status = await organizationsStore.getOrganizationStatus(link.target);
      const members = await organizationsStore.getOrganizationMembersLinks(link.target);
      const coordinators = await organizationsStore.getOrganizationCoordinatorsLinks(link.target);

      organizations.push({
        ...decodeRecords([record])[0],
        original_action_hash: link.target,
        previous_action_hash: record.signed_action.hashed.hash,
        status,
        members,
        coordinators
      });
    }

    return organizations;
  }

  async updateMyProfile(updated_user: User): Promise<Record> {
    await this.getMyProfile();

    if (this.myProfile === null) {
      throw new Error('No user found');
    }

    const original_action_hash = this.myProfile!.original_action_hash;
    const previous_action_hash = this.myProfile!.previous_action_hash;

    const newUserRecord = (await hc.callZome('users_organizations', 'update_user', {
      original_action_hash,
      previous_action_hash,
      updated_user
    })) as Record;

    return newUserRecord;
  }
}

const usersStore = new UsersStore();
export default usersStore;
