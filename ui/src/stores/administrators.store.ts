import { writable, type Writable } from 'svelte/store';
import { getLatestUser, getLatestUserRecord, type User, type UserStatus } from './users.store';
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';
import hc from '@services/HolochainClientService';
import { decodeRecords } from '@utils';

/**
 * Svelte writable store for all users.
 */
export const allUsers: Writable<User[]> = writable([]);

/**
 * Svelte writable store for all administrators.
 */
export const administrators: Writable<User[]> = writable([]);

/**
 * Svelte writable store for all non-administrators.
 */
export const nonAmdinistrators: Writable<User[]> = writable([]);

/**
 * Svelte writable store for the current user's user.
 */
export const agentIsAdministrator: Writable<boolean> = writable(false);

/**
 * Retrieve all user links by calling the specified zome function.
 *
 * @returns {Promise<Link[]>} A promise that resolves to the links to all users.
 */
export async function getAllUsersLinks(): Promise<Link[]> {
  const links: Link[] = await hc.callZome('users', 'get_all_users', null);

  return links;
}

/**
 * Retrieves the latest user records and links for all agent users.
 */
async function getAllUserRecordsAndLinks(): Promise<[Link[], Record[]]> {
  const usersLinks: Link[] = await getAllUsersLinks();
  let usersRecords: Record[] = [];

  for (let link of usersLinks) {
    const record = await getLatestUserRecord(link.target);
    if (record) usersRecords.push(record);
  }

  return [usersLinks, usersRecords];
}

/**
 * Retrieves all users and saves them in the users store.
 */
export async function getAllUsers(): Promise<User[]> {
  const [usersLinks, usersRecords] = await getAllUserRecordsAndLinks();

  let recordsContents: User[] = [];

  for (let i = 0; i < usersRecords.length; i++) {
    let user = decodeRecords([usersRecords[i]])[0];
    recordsContents.push({
      ...user,
      remaining_time: getRemainingSuspensionTime(user.status),
      original_action_hash: usersLinks[i].target,
      previous_action_hash: usersRecords[i].signed_action.hashed.hash
    });
  }

  allUsers.set(recordsContents);

  return recordsContents;
}

/**
 * Registers an administrator by their original user hash.
 */
export async function registerAdministrator(original_action_hash: ActionHash): Promise<boolean> {
  return await hc.callZome('administration', 'register_administrator', original_action_hash);
}

/**
 * Checks if an agent is an administrator and updates the agentIsAdministrator store accordingly.
 */
export async function checkIfAgentIsAdministrator(agentPubKey: AgentPubKey): Promise<boolean> {
  const result = await hc.callZome(
    'administration',
    'check_if_agent_is_administrator',
    agentPubKey
  );
  agentIsAdministrator.set(result);

  return result;
}

export async function checkIfUserIsAdministrator(action_hash: ActionHash): Promise<boolean> {
  return await hc.callZome('administration', 'check_if_user_is_administrator', action_hash);
}

/**
 * Retrieves all links associated with administrators.
 */
export async function getAllAdministratorsLinks(): Promise<Link[]> {
  return (await hc.callZome('administration', 'get_all_administrators_links', null)) as Link[];
}

/**
 * Retrieves all administrators and updates the administrators store.
 */
export async function getAllAdministrators(): Promise<User[]> {
  const links = await getAllAdministratorsLinks();
  let administratorUsersPromises = links.map(async (link) => await getLatestUser(link.target));

  const administratorUsers = (await Promise.all(administratorUsersPromises)).filter(
    (p) => p !== null
  ) as User[];

  administrators.set(administratorUsers);

  return administratorUsers;
}

/**
 * Removes an administrator by their original user hash.d
 */
export async function removeAdministrator(original_action_hash: ActionHash): Promise<boolean> {
  return await hc.callZome('administration', 'remove_administrator', original_action_hash);
}

/**
 * Retrieves users that are not administrators.
 */
export async function getNonAdministratorUsers(): Promise<User[]> {
  const links = await getAllUsersLinks();
  const nonAmdinistratorsUsers: User[] = [];

  for (const link of links) {
    if ((await checkIfUserIsAdministrator(link.target)) === false) {
      const user = await getLatestUser(link.target);
      user && nonAmdinistratorsUsers.push(user);
    }
  }

  nonAmdinistrators.set(nonAmdinistratorsUsers);

  return nonAmdinistratorsUsers;
}

/**
 * Updates the status of a user's user by their original user hash, their previous user hash, and their new status.
 */
export async function updateUserStatus(
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash,
  status: UserStatus
): Promise<boolean> {
  return await hc.callZome('users', 'update_user_status', {
    original_action_hash,
    previous_action_hash,
    status
  });
}

export async function suspendUserIndefinitely(
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash
): Promise<boolean> {
  return await hc.callZome('users', 'suspend_user_indefinitely', {
    original_action_hash,
    previous_action_hash
  });
}

export async function suspendUserTemporarily(
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash,
  duration_in_days: number
): Promise<boolean> {
  return await hc.callZome('users', 'suspend_user_temporarily', {
    original_action_hash,
    previous_action_hash,
    duration_in_days
  });
}

export async function unsuspendUser(
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash
): Promise<boolean> {
  return await hc.callZome('users', 'unsuspend_user', {
    original_action_hash,
    previous_action_hash
  });
}

export async function unsuspendUserIfTimePassed(
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash
): Promise<boolean> {
  return await hc.callZome('users', 'unsuspend_user_if_time_passed', {
    original_action_hash,
    previous_action_hash
  });
}

export function getRemainingSuspensionTime(status: UserStatus): number | null {
  const suspensionDate = new Date(status.split(' ')[1]);
  const now = new Date();

  if (!suspensionDate) return null;

  return suspensionDate.getTime() - now.getTime();
}
