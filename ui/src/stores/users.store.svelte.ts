import type { ActionHash, AgentPubKey } from '@holochain/client';
import { decodeRecords } from '@utils';
import type { UIUser } from '@/types/ui';
import type { UserInDHT } from '@/types/holochain';
import { UsersService } from '@/services/zomes/users.service';
import hc from '@services/HolochainClientService.svelte';

class UsersStore {
  allUsers: UIUser[] = $state([]);
  currentUser: UIUser | null = $state(null);
  acceptedUsers: UIUser[] = $state([]);

  async createUser(user: UserInDHT): Promise<UIUser> {
    const record = await UsersService.createUser(user);
    const newUser: UIUser = {
      ...decodeRecords([record])[0],
      original_action_hash: record.signed_action.hashed.hash,
      previous_action_hash: record.signed_action.hashed.hash
    };

    this.allUsers = [...this.allUsers, newUser];
    return newUser;
  }

  async getLatestUser(original_action_hash: ActionHash): Promise<UIUser | null> {
    const record = await UsersService.getLatestUserRecord(original_action_hash);
    if (!record) return null;

    return {
      ...decodeRecords([record])[0],
      original_action_hash: record.signed_action.hashed.hash,
      previous_action_hash: record.signed_action.hashed.hash
    };
  }

  async getAllUsers(): Promise<UIUser[]> {
    const links = await UsersService.getAllUsersLinks();
    const users: UIUser[] = [];

    for (const link of links) {
      const user = await this.getLatestUser(link.target);
      if (user) {
        const statusLink = await this.getUserStatusLink(link.target);
        if (statusLink) {
          user.status = statusLink.target;
        }
        users.push(user);
      }
    }

    this.allUsers = users;
    return users;
  }

  async getUserByActionHash(actionHash: ActionHash): Promise<UIUser | null> {
    return (
      this.allUsers.find(
        (user) => user.original_action_hash?.toString() === actionHash.toString()
      ) || null
    );
  }

  async setCurrentUser(user: UIUser) {
    this.currentUser = user;
  }

  async refreshCurrentUser(): Promise<UIUser | null> {
    const agentPubKey = (await hc.getAppInfo())?.agent_pub_key;
    if (!agentPubKey) return null;

    const links = await UsersService.getAgentUser(agentPubKey);
    if (links.length === 0) return null;

    const record = await UsersService.getLatestUserRecord(links[0].target);
    if (!record) return null;

    const statusLink = await UsersService.getUserStatusLink(links[0].target);

    this.currentUser = {
      ...decodeRecords([record])[0],
      status: statusLink?.target,
      original_action_hash: links[0].target,
      previous_action_hash: record.signed_action.hashed.hash
    };

    this.allUsers = this.allUsers.map((u) =>
      u.original_action_hash?.toString() === this.currentUser?.original_action_hash?.toString()
        ? this.currentUser!
        : u
    );

    return this.currentUser;
  }

  async updateCurrentUser(user: UserInDHT): Promise<UIUser | null> {
    const userOriginalActionHash = this.currentUser?.original_action_hash;
    const userPreviousActionHash = this.currentUser?.previous_action_hash;

    if (!userOriginalActionHash || !userPreviousActionHash) return null;

    const record = await UsersService.updateUser(
      userOriginalActionHash,
      userPreviousActionHash,
      user
    );

    const updatedUser: UIUser = {
      ...decodeRecords([record])[0],
      status: this.currentUser?.status,
      original_action_hash: userOriginalActionHash,
      previous_action_hash: record.signed_action.hashed.hash
    };

    this.setCurrentUser(updatedUser);
    this.allUsers = this.allUsers.map((u) =>
      u.original_action_hash?.toString() === this.currentUser?.original_action_hash?.toString()
        ? this.currentUser!
        : u
    );

    return updatedUser;
  }

  async getAcceptedUsers(): Promise<UIUser[]> {
    const links = await UsersService.getAcceptedUsersLinks();
    const users: UIUser[] = [];

    for (const link of links) {
      const user = await this.getLatestUser(link.target);
      if (user) {
        const statusLink = await this.getUserStatusLink(link.target);
        if (statusLink) {
          user.status = statusLink.target;
        }
        users.push(user);
      }
    }

    this.acceptedUsers = users;
    return users;
  }

  async getUserStatusLink(userHash: ActionHash) {
    return await UsersService.getUserStatusLink(userHash);
  }

  // Helper methods
  getUsersByActionHashes(actionHashes: ActionHash[]): UIUser[] {
    return this.allUsers.filter((user) =>
      actionHashes.some((hash) => hash.toString() === user.original_action_hash?.toString())
    );
  }

  async refresh(): Promise<void> {
    await this.refreshCurrentUser();
    await this.getAcceptedUsers();
  }

  async getUserAgents(actionHash: ActionHash): Promise<AgentPubKey[]> {
    return UsersService.getUserAgents(actionHash);
  }
}

const usersStore = new UsersStore();
export default usersStore;
