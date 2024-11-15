import type { ActionHash, AgentPubKey } from '@holochain/client';
import { decodeRecords } from '@utils';
import type { UIUser } from '@/types/ui';
import type { UserInDHT } from '@/types/holochain';
import { UsersService } from '@/services/zomes/users.service';

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

  async refreshUser(original_action_hash: ActionHash): Promise<UIUser | null> {
    const user = await this.getLatestUser(original_action_hash);
    if (!user) return null;

    const statusLink = await UsersService.getUserStatusLink(original_action_hash);
    if (statusLink) {
      user.status = statusLink.target;
    }

    this.allUsers = this.allUsers.map((u) =>
      u.original_action_hash?.toString() === original_action_hash.toString() ? user : u
    );

    if (this.currentUser?.original_action_hash?.toString() === original_action_hash.toString()) {
      this.currentUser = user;
    }

    return user;
  }

  async setCurrentUser(user: UIUser) {
    this.currentUser = user;
  }

  async refreshCurrentUser(): Promise<UIUser | null> {
    if (!this.currentUser?.original_action_hash) return null;
    return this.refreshUser(this.currentUser.original_action_hash);
  }

  async updateCurrentUser(user: UserInDHT): Promise<UIUser | null> {
    if (!this.currentUser?.original_action_hash || !this.currentUser?.previous_action_hash)
      return null;

    const record = await UsersService.updateUser(
      this.currentUser.original_action_hash,
      this.currentUser.previous_action_hash,
      user
    );
    const updatedUser: UIUser = {
      ...decodeRecords([record])[0],
      original_action_hash: this.currentUser.original_action_hash,
      previous_action_hash: record.signed_action.hashed.hash
    };

    // Update the current user and the users list
    this.currentUser = updatedUser;
    this.allUsers = this.allUsers.map((u) =>
      u.original_action_hash?.toString() === this.currentUser?.original_action_hash?.toString()
        ? updatedUser
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
    await this.getAllUsers();
    if (this.currentUser) {
      await this.refreshCurrentUser();
    }
  }

  async getUserAgents(actionHash: ActionHash): Promise<AgentPubKey[]> {
    return UsersService.getUserAgents(actionHash);
  }
}

const usersStore = new UsersStore();
export default usersStore;
