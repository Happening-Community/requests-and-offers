import { decodeRecords } from '@utils';
import hc from '@services/HolochainClientService';
import { get, writable, type Writable } from 'svelte/store';
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';
import { getRemainingSuspensionTime } from './administrators.store';

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
  status?: UserStatus;
};

type UserAdditionalFields = {
  remaining_time?: number;
  original_action_hash?: ActionHash;
  previous_action_hash?: ActionHash;
};

export type User = UserInDHT & UserAdditionalFields;

/**
 * Svelte writable store for the current user's profile.
 */
export const myUser: Writable<User | null> = writable(null);

export const acceptedUsers: Writable<User[]> = writable([]);

/**
 * Creates a new user in the 'users' zome.
 *
 * @param {User} user - The user object containing the details of the user to be created.
 * @returns {Promise<Record>} A promise that resolves to the newly created user record.
 */
export async function createUser(user: User): Promise<Record> {
  return await hc.callZome('users', 'create_user', user);
}

/**
 * Retrieves the latest user record based on the original user hash.
 *
 * @param {ActionHash} original_action_hash - The hash of the original user action used to identify the user.
 * @returns {Promise<Record | null>} A promise that resolves to the latest user record if found, otherwise null.
 */
export async function getLatestUserRecord(
  original_action_hash: ActionHash
): Promise<Record | null> {
  const record = await hc.callZome('users', 'get_latest_user_record', original_action_hash);

  return record;
}

/**
 * Retrieves the latest user based on the original user hash.
 *
 * @param {ActionHash} original_action_hash - The hash of the original user action used to identify the user.
 * @returns {Promise<User | null>} A promise that resolves to the latest user if found, otherwise null.
 */
export async function getLatestUser(original_action_hash: ActionHash): Promise<User | null> {
  const record = await getLatestUserRecord(original_action_hash);

  return record
    ? {
        ...decodeRecords([record])[0],
        original_action_hash: original_action_hash,
        previous_action_hash: record.signed_action.hashed.hash
      }
    : null;
}

/**
 * Retrieves the links associated with an agent's user.
 *
 * @param {AgentPubKey} agent - The public key of the agent whose user links are to be retrieved.
 * @returns {Promise<Link[]>} A promise that resolves to an array of links associated with the agent's user.
 */
export async function getAgentUserLinks(agent: AgentPubKey): Promise<Link[]> {
  const links = await hc.callZome('users', 'get_agent_user', agent);

  return links;
}

/**
 * Retrieves an agent user record for a given agent.
 *
 * @param {AgentPubKey} agent - The agent public key for which to retrieve the user record.
 * @returns {Promise<User | null>} A promise that resolves to the user record of the agent, or null if not found.
 */
async function getAgentUser(agent: AgentPubKey): Promise<User | null> {
  const links = await getAgentUserLinks(agent);
  if (links.length === 0) return null;

  return await getLatestUser(links[0].target);
}

/**
 * Retrieves the user's profile information, sets it in the myUser state, and handles null values.
 *
 * @returns {Promise<void>}
 */
export async function getMyUser(): Promise<User | null> {
  const agentPubKey = (await hc.getAppInfo())!.agent_pub_key;
  const agentUser = await getAgentUser(agentPubKey);

  agentUser && myUser.set(agentUser);

  return agentUser;
}

export async function getAcceptedUsersLinks(): Promise<Link[]> {
  const links: Link[] = await hc.callZome('users', 'get_accepted_users', null);

  return links;
}

export async function getAcceptedUsersRecordsAndLinks(): Promise<[Link[], Record[]]> {
  const links = await getAcceptedUsersLinks();
  let usersRecords: Record[] = [];

  for (let link of links) {
    const record = await getLatestUserRecord(link.target);
    if (record) usersRecords.push(record);
  }

  return [links, usersRecords];
}

export async function getAcceptedUsers(): Promise<User[]> {
  const [links, records] = await getAcceptedUsersRecordsAndLinks();

  let recordsContents: User[] = [];

  for (let i = 0; i < records.length; i++) {
    let user = decodeRecords([records[i]])[0];
    recordsContents.push({
      ...user,
      remaining_time: getRemainingSuspensionTime(user.status),
      original_action_hash: links[i].target,
      previous_action_hash: records[i].signed_action.hashed.hash
    });
  }

  acceptedUsers.set(recordsContents);

  return recordsContents;
}

/**
 * Updates the authenticated user's profile with new data.
 */
export async function updateMyUser(updated_user: User): Promise<Record> {
  await getMyUser();
  const myUserStore = get(myUser);

  if (myUserStore === null) {
    throw new Error('No user found');
  }

  const original_action_hash = myUserStore.original_action_hash;
  const previous_action_hash = myUserStore.previous_action_hash;

  const newUserRecord = await hc.callZome('users', 'update_user', {
    original_action_hash,
    previous_action_hash,
    updated_user
  });

  return newUserRecord;
}
