import { decodeRecords } from '@utils';
import hc from '@services/HolochainClientService';
import { get, writable, type Writable } from 'svelte/store';
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';

export type IndividualType = 'developer' | 'advocate';

export type Profile = {
  name: string;
  nickname: string;
  bio?: string;
  profile_picture?: Uint8Array;
  user_type: IndividualType;
  skills?: string[];
  email: string;
  phone?: string;
  time_zone?: string;
  location?: string;
};

/**
 * Svelte writable store for the current user's profile.
 * @type {Writable<Profile | null>}
 */
export const myProfile: Writable<Profile | null> = writable(null);

export const myProfileHash: Writable<ActionHash | null> = writable(null);

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

async function getLatestProfileRecord(original_profile_hash: ActionHash): Promise<Record | null> {
  return await hc.callZome('profiles', 'get_latest_profile', original_profile_hash);
}

export async function getLatestProfile(original_profile_hash: ActionHash): Promise<Profile | null> {
  const record = await getLatestProfileRecord(original_profile_hash);

  return record ? decodeRecords([record])[0] : null;
}

async function getAgentProfileRecord(agent: AgentPubKey): Promise<Record | null> {
  const agentProfileLinks: Link[] = await hc.callZome('profiles', 'get_agent_profile', agent);

  if (agentProfileLinks.length === 0) return null;

  return await getLatestProfileRecord(agentProfileLinks[0].target);
}

export async function getAgentProfile(author: AgentPubKey): Promise<Profile | null> {
  const agentProfileRecord = await getAgentProfileRecord(author);
  return agentProfileRecord ? decodeRecords([agentProfileRecord])[0] : null;
}

export async function getMyProfile(): Promise<void> {
  const agentPubKey = (await hc.getAppInfo())!.agent_pub_key;
  const agentProfileRecord = await getAgentProfileRecord(agentPubKey);

  myProfile.set(agentProfileRecord ? decodeRecords([agentProfileRecord])[0] : null);
}

export async function getAllProfilesLinks(): Promise<Link[]> {
  return hc.callZome('profiles', 'get_all_profiles', null);
}

async function getAllProfilesRecords(): Promise<Record[]> {
  const profilesLinks: Link[] = await getAllProfilesLinks();

  let profilesRecords: Record[] = [];

  for (const profileLink of profilesLinks) {
    const record = await getLatestProfileRecord(profileLink.target);
    if (record) profilesRecords.push(record);
  }

  return profilesRecords;
}

export async function getAllProfiles(): Promise<void> {
  const profilesRecords: Record[] = await getAllProfilesRecords();

  profiles.set(decodeRecords(profilesRecords));
}

export async function updateProfile(agent: AgentPubKey, updated_profile: Profile): Promise<Record> {
  const agentProfileLinks: Link[] = await hc.callZome('profiles', 'get_agent_profile', agent);

  if (agentProfileLinks.length === 0) throw new Error('Agent has no profile');

  const original_profile_hash = agentProfileLinks[0].target;
  const previous_profile_hash = (await getLatestProfileRecord(original_profile_hash))?.signed_action
    .hashed.hash;

  const newProfileRecord = await hc.callZome('profiles', 'update_profile', {
    original_profile_hash,
    previous_profile_hash,
    updated_profile
  });

  return newProfileRecord;
}
