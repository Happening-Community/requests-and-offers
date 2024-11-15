import type { ActionHash, Record } from '@holochain/client';
import { decodeRecords } from '@utils';
import type { UIUser } from '@/types/ui';
import { UsersService } from '@/services/zomes/users.service';
import { AdministrationService } from '@/services/zomes/administration.service';
import { AdministrationEntity } from '@/types/holochain';

class UsersStore {
  acceptedUsers: UIUser[] = $state([]);
  myProfile: UIUser | undefined = $state();

  async createUser(user: UIUser): Promise<Record> {
    return await UsersService.createUser(user);
  }

  async getAllUsers(): Promise<UIUser[]> {
    const usersLinks = await UsersService.getAllUsersLinks();
    const users: UIUser[] = [];

    for (const link of usersLinks) {
      const record = await UsersService.getLatestUserRecord(link.target);
      if (!record) continue;

      const statusLink = await UsersService.getUserStatusLink(link.target);
      const status = await AdministrationService.getLatestStatusForEntity(
        link.target,
        AdministrationEntity.Users
      );

      const user = decodeRecords([record])[0];
      users.push({
        ...user,
        status: statusLink?.target,
        remaining_time: status?.suspended_until
          ? status.suspended_until - Date.now()
          : undefined,
        original_action_hash: link.target,
        previous_action_hash: record.signed_action.hashed.hash
      });
    }

    return users;
  }

  async getLatestUser(original_action_hash: ActionHash): Promise<UIUser | null> {
    const record = await UsersService.getLatestUserRecord(original_action_hash);
    if (!record) return null;

    const statusLink = await UsersService.getUserStatusLink(original_action_hash);
    const status = await AdministrationService.getLatestStatusForEntity(
      original_action_hash,
      AdministrationEntity.Users
    );

    const user = decodeRecords([record])[0];
    return {
      ...user,
      status: statusLink?.target,
      remaining_time: status?.suspended_until
        ? status.suspended_until - Date.now()
        : undefined,
      original_action_hash,
      previous_action_hash: record.signed_action.hashed.hash
    };
  }
}

const usersStore = new UsersStore();
export default usersStore;
