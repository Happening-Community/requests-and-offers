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
  original_action_hash: ActionHash;
  previous_action_hash: ActionHash;
};

/**
 * Svelte writable store for the current user's profile.
 * @type {Writable<Profile | null>}
 */
export const myProfile: Writable<Profile> = writable({
  name: '',
  nickname: '',
  user_type: 'creator',
  email: '',
  status: 'pending',
  original_action_hash: new Uint8Array(),
  previous_action_hash: new Uint8Array()
} as Profile);

/**
 * Svelte writable store for all profiles.
 * @type {Writable<Profile[]>}
 */
export const profiles: Writable<Profile[]> = writable([]);

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
export async function getLatestProfileRecord(
  original_profile_hash: ActionHash
): Promise<Record | null> {
  const record = await hc.callZome('profiles', 'get_latest_profile', original_profile_hash);

  return record;
}

/**
 * Retrieves the latest profile based on the original profile hash.
 *
 * @param {ActionHash} original_profile_hash - The original profile hash to search for.
 * @return {Promise<Profile | null>} The latest profile if found, otherwise null.
 */
export async function getLatestProfile(original_profile_hash: ActionHash): Promise<Profile | null> {
  const record = await getLatestProfileRecord(original_profile_hash);

  return record
    ? {
        ...decodeRecords([record])[0],
        original_action_hash: original_profile_hash,
        previous_action_hash: record.signed_action.hashed.hash
      }
    : null;
}

export async function getAgentProfileLinks(agent: AgentPubKey): Promise<Link[]> {
  const links = await hc.callZome('profiles', 'get_agent_profile', agent);

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
  myProfile.update((profile) => ({ ...profile, original_action_hash: links[0].target }));

  return await getLatestProfileRecord(links[0].target);
}

/**profilesPreviousHashes
 * Retrieves the user's profile information, sets it in the myProfile state, and handles null values.
 *
 * @return {Promise<void>}
 */
export async function getMyProfile(): Promise<void> {
  const agentPubKey = (await hc.getAppInfo())!.agent_pub_key;
  const agentProfileRecord = await getAgentProfileRecord(agentPubKey);

  if (agentProfileRecord)
    myProfile.set({
      ...decodeRecords([agentProfileRecord])[0],
      previous_action_hash: agentProfileRecord.signed_action.hashed.hash
    });
}

/**
 * Retrieve all profile links by calling the specified zome function.
 *
 * @return {Promise<Link[]>} The links to all profiles.
 */
export async function getAllProfilesLinks(): Promise<Link[]> {
  const links: Link[] = await hc.callZome('profiles', 'get_all_profiles', null);

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

  for (let link of profilesLinks) {
    const record = await getLatestProfileRecord(link.target);
    if (record) profilesRecords.push(record);
  }

  return profilesRecords;
}

async function getAgentProfileRecordsAndLinks(): Promise<[Link[], Record[]]> {
  const profilesLinks: Link[] = await getAllProfilesLinks();
  let profilesRecords: Record[] = [];

  for (let link of profilesLinks) {
    const record = await getLatestProfileRecord(link.target);
    if (record) profilesRecords.push(record);
  }

  return [profilesLinks, profilesRecords];
}

/**
 * Retrieves all profiles and sets them in the profiles map.
 *
 * @return {Promise<void>}
 */
export async function getAllProfiles(): Promise<void> {
  const [profilesLinks, profilesRecords] = await getAgentProfileRecordsAndLinks();

  let recordsContents: Profile[] = [];

  for (let i = 0; i < profilesRecords.length; i++) {
    recordsContents.push({
      ...decodeRecords([profilesRecords[i]])[0],
      original_action_hash: profilesLinks[i].target,
      previous_action_hash: profilesRecords[i].signed_action.hashed.hash
    });
  }

  profiles.set(recordsContents);
}

/**
 * Updates the profile of a given agent in the system.
 *
 * @param {AgentPubKey} agent - The agent's public key
 * @param {Profile} updated_profile - The updated profile information
 * @return {Promise<Record>} The new profile record after the update
 */
export async function updateProfile(agent: AgentPubKey, updated_profile: Profile): Promise<Record> {
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
