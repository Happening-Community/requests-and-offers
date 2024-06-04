import { decodeRecords } from '@utils';
import hc from '@services/HolochainClientService';
import { get, writable, type Writable } from 'svelte/store';
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';

export type UserType = 'creator' | 'advocate';
export type ProfileStatus = 'pending' | 'accepted' | 'rejected';

export type Profile = {
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
  status?: ProfileStatus;
};

/**
 * Svelte writable store for the current user's profile.
 * @type {Writable<Profile | null>}
 */
export const myProfile: Writable<Profile | null> = writable(null);

export const myProfileOriginalActionHash: Writable<ActionHash | null> = writable(null);

/**
 * Svelte writable store for all profiles.
 * @type {Writable<Profile[]>}
 */
export const profiles: Writable<Profile[]> = writable([]);

export const profilesHashes: Writable<ActionHash[]> = writable([]);

/**
 * Creates a new profile in the 'profiles' zome.
 * @async
 * @param {Profile} profile - The profile to be created.
 */
export async function createProfile(profile: Profile): Promise<Record> {
  return await hc.callZome('profiles', 'create_profile', profile);
}

/**
 * Retrieves the latest profile record based on the original profile hash.
 *
 * @param {ActionHash} original_profile_hash - The original profile hash to retrieve the latest record for.
 * @return {Promise<Record | null>} The latest profile record if found, otherwise null.
 */
async function getLatestProfileRecord(original_profile_hash: ActionHash): Promise<Record | null> {
  return await hc.callZome('profiles', 'get_latest_profile', original_profile_hash);
}

/**
 * Retrieves the latest profile based on the original profile hash.
 *
 * @param {ActionHash} original_profile_hash - The original profile hash to search for.
 * @return {Promise<Profile | null>} The latest profile if found, otherwise null.
 */
export async function getLatestProfile(original_profile_hash: ActionHash): Promise<Profile | null> {
  const record = await getLatestProfileRecord(original_profile_hash);

  return record ? decodeRecords([record])[0] : null;
}

async function getAgentProfileLinks(agent: AgentPubKey): Promise<Link[]> {
  const links = await hc.callZome('profiles', 'get_agent_profile', agent);
  if (links.length > 0) myProfileOriginalActionHash.set(links[0].target);

  return links;
}

/**
 * Retrieves an agent profile record for a given agent.
 *
 * @param {AgentPubKey} agent - The agent public key for which to retrieve the profile record.
 * @return {Promise<Record | null>} The profile record of the agent, or null if not found.
 */
async function getAgentProfileRecord(agent: AgentPubKey): Promise<Record | null> {
  const links = await getAgentProfileLinks(agent);
  if (links.length === 0) return null;
  return await getLatestProfileRecord(links[0].target);
}

/**
 * Retrieves the profile of an agent based on the provided author AgentPubKey.
 *
 * @param {AgentPubKey} author - The AgentPubKey of the agent whose profile is to be retrieved.
 * @return {Promise<Profile | null>} The profile of the agent if found, otherwise null.
 */
export async function getAgentProfile(author: AgentPubKey): Promise<Profile | null> {
  const agentProfileRecord = await getAgentProfileRecord(author);
  return agentProfileRecord ? decodeRecords([agentProfileRecord])[0] : null;
}

/**
 * Retrieves the user's profile information, sets it in the myProfile state, and handles null values.
 *
 * @return {Promise<void>}
 */
export async function getMyProfile(): Promise<void> {
  const agentPubKey = (await hc.getAppInfo())!.agent_pub_key;
  const agentProfileRecord = await getAgentProfileRecord(agentPubKey);

  myProfile.set(agentProfileRecord ? decodeRecords([agentProfileRecord])[0] : null);
}

/**
 * Retrieve all profile links by calling the specified zome function.
 *
 * @return {Promise<Link[]>} The links to all profiles.
 */
export async function getAllProfilesLinks(): Promise<Link[]> {
  const links: Link[] = await hc.callZome('profiles', 'get_all_profiles', null);
  if (links.length > 0) profilesHashes.set(links.map((l) => l.target));

  return links;
}

/**
 * Retrieves all profile records by fetching the latest record for each profile link.
 *
 * @return {Promise<Record[]>} Array of profile records
 */
async function getAllProfilesRecords(): Promise<Record[]> {
  const profilesLinks: Link[] = await getAllProfilesLinks();

  let profilesRecords: Record[] = [];

  for (const profileLink of profilesLinks) {
    const record = await getLatestProfileRecord(profileLink.target);
    if (record) profilesRecords.push(record);
  }

  return profilesRecords;
}

/**
 * Retrieves all profiles and sets them in the profiles map.
 *
 * @return {Promise<void>}
 */
export async function getAllProfiles(): Promise<void> {
  const profilesRecords: Record[] = await getAllProfilesRecords();

  profiles.set(decodeRecords(profilesRecords));
}

/**
 * Updates the profile of a given agent in the system.
 *
 * @param {AgentPubKey} agent - The agent's public key
 * @param {Profile} updated_profile - The updated profile information
 * @return {Promise<Record>} The new profile record after the update
 */
export async function updateProfile(agent: AgentPubKey, updated_profile: Profile): Promise<Record> {
  const agentProfileLinks: Link[] = await hc.callZome('profiles', 'get_agent_profile', agent);

  const original_profile_hash = (await getAgentProfileLinks(agent))[0].target;
  const previous_profile_hash = (await getLatestProfileRecord(original_profile_hash))?.signed_action
    .hashed.hash;

  const newProfileRecord = await hc.callZome('profiles', 'update_profile', {
    original_profile_hash,
    previous_profile_hash,
    updated_profile
  });

  return newProfileRecord;
}
