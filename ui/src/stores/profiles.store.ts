import { decodeRecords } from '@utils';
import hc from '@services/HolochainClientService';
import { get, writable, type Writable } from 'svelte/store';
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';

export type UserType = 'creator' | 'advocate';
export type ProfileStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'suspended'
  | `suspended ${string}`;

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
  original_action_hash?: ActionHash;
  previous_action_hash?: ActionHash;
};

/**
 * Svelte writable store for the current user's profile.
 */
export const myProfile: Writable<Profile | null> = writable(null);

/**
 * Svelte writable store for all profiles.
 */
export const profiles: Writable<Profile[]> = writable([]);

/**
 * Creates a new profile in the 'profiles' zome.
 *
 * @param {Profile} profile - The profile object containing the details of the profile to be created.
 * @returns {Promise<Record>} A promise that resolves to the newly created profile record.
 */
export async function createProfile(profile: Profile): Promise<Record> {
  return await hc.callZome('profiles', 'create_profile', profile);
}

/**
 * Retrieves the latest profile record based on the original profile hash.
 *
 * @param {ActionHash} original_profile_hash - The hash of the original profile action used to identify the profile.
 * @returns {Promise<Record | null>} A promise that resolves to the latest profile record if found, otherwise null.
 */
export async function getLatestProfileRecord(
  original_profile_hash: ActionHash
): Promise<Record | null> {
  const record = await hc.callZome('profiles', 'get_latest_profile_record', original_profile_hash);

  return record;
}

/**
 * Retrieves the latest profile based on the original profile hash.
 *
 * @param {ActionHash} original_profile_hash - The hash of the original profile action used to identify the profile.
 * @returns {Promise<Profile | null>} A promise that resolves to the latest profile if found, otherwise null.
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

/**
 * Retrieves the links associated with an agent's profile.
 *
 * @param {AgentPubKey} agent - The public key of the agent whose profile links are to be retrieved.
 * @returns {Promise<Link[]>} A promise that resolves to an array of links associated with the agent's profile.
 */
export async function getAgentProfileLinks(agent: AgentPubKey): Promise<Link[]> {
  const links = await hc.callZome('profiles', 'get_agent_profile', agent);

  return links;
}

/**
 * Retrieves an agent profile record for a given agent.
 *
 * @param {AgentPubKey} agent - The agent public key for which to retrieve the profile record.
 * @returns {Promise<Profile | null>} A promise that resolves to the profile record of the agent, or null if not found.
 */
async function getAgentProfile(agent: AgentPubKey): Promise<Profile | null> {
  const links = await getAgentProfileLinks(agent);
  if (links.length === 0) return null;

  return await getLatestProfile(links[0].target);
}

/**
 * Retrieves the user's profile information, sets it in the myProfile state, and handles null values.
 *
 * @returns {Promise<void>}
 */
export async function getMyProfile(): Promise<void> {
  const agentPubKey = (await hc.getAppInfo())!.agent_pub_key;
  const agentProfile = await getAgentProfile(agentPubKey);

  agentProfile && myProfile.set(agentProfile);
}

/**
 * Retrieve all profile links by calling the specified zome function.
 *
 * @returns {Promise<Link[]>} A promise that resolves to the links to all profiles.
 */
export async function getAllProfilesLinks(): Promise<Link[]> {
  const links: Link[] = await hc.callZome('profiles', 'get_all_profiles', null);

  return links;
}

/**
 * Retrieves the latest profile records and links for all agent profiles.
 *
 * @return {Promise<[Link[], Record[]]>} A promise that resolves to an array containing the profile links and records.
 */
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
 * Retrieves all profiles and sets them in the profiles store.
 *
 * @returns {Promise<void>}
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
 * Updates the authenticated user's profile with new data.
 *
 * @async
 * @function updateMyProfile
 * @param {Profile} updated_profile - The updated profile data to be saved in the DHT.
 * @returns {Promise<Record>} A promise that resolves to the updated profile record.
 *
 * @throws Will throw an error if there is an issue fetching the current profile or updating it.
 */
export async function updateMyProfile(updated_profile: Profile): Promise<Record> {
  await getMyProfile();
  const myProfileStore = get(myProfile);

  if (myProfileStore === null) {
    throw new Error('No profile found');
  }

  const original_profile_hash = myProfileStore.original_action_hash;
  const previous_profile_hash = myProfileStore.previous_action_hash;

  const newProfileRecord = await hc.callZome('profiles', 'update_profile', {
    original_profile_hash,
    previous_profile_hash,
    updated_profile
  });

  return newProfileRecord;
}
