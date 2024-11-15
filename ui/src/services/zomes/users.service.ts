import type { ActionHash, Link, Record } from '@holochain/client';
import type { UserInDHT } from '@/types/holochain';
import hc from '../HolochainClientService.svelte';

export class UsersService {
  static async createUser(user: UserInDHT): Promise<Record> {
    return (await hc.callZome('users_organizations', 'create_user', user)) as Record;
  }

  static async getLatestUserRecord(original_action_hash: ActionHash): Promise<Record | null> {
    return (await hc.callZome(
      'users_organizations',
      'get_latest_user_record',
      original_action_hash
    )) as Record | null;
  }

  static async getAllUsersLinks(): Promise<Link[]> {
    return (await hc.callZome('users_organizations', 'get_all_users', null)) as Link[];
  }

  static async getUserStatusLink(user_original_action_hash: ActionHash): Promise<Link | null> {
    return (await hc.callZome(
      'users_organizations',
      'get_user_status_link',
      user_original_action_hash
    )) as Link | null;
  }
}
