import { writable, type Writable } from 'svelte/store';
import {
  getLatestProfile,
  getLatestProfileRecord,
  type Profile,
  type ProfileStatus
} from './profiles.store';
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';
import hc from '@services/HolochainClientService';
import { decodeRecords } from '@utils';

/**
 * Svelte writable store for all profiles.
 */
export const allProfiles: Writable<Profile[]> = writable([]);

/**
 * Svelte writable store for all administrators.
 */
export const administrators: Writable<Profile[]> = writable([]);

/**
 * Svelte writable store for all non-administrators.
 */
export const nonAmdinistrators: Writable<Profile[]> = writable([]);

/**
 * Svelte writable store for the current user's profile.
 */
export const agentIsAdministrator: Writable<boolean> = writable(false);

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
 */
async function getAllProfileRecordsAndLinks(): Promise<[Link[], Record[]]> {
  const profilesLinks: Link[] = await getAllProfilesLinks();
  let profilesRecords: Record[] = [];

  for (let link of profilesLinks) {
    const record = await getLatestProfileRecord(link.target);
    if (record) profilesRecords.push(record);
  }

  return [profilesLinks, profilesRecords];
}

/**
 * Retrieves all profiles and saves them in the profiles store.
 */
export async function getAllProfiles(): Promise<Profile[]> {
  const [profilesLinks, profilesRecords] = await getAllProfileRecordsAndLinks();

  let recordsContents: Profile[] = [];

  for (let i = 0; i < profilesRecords.length; i++) {
    let profile = decodeRecords([profilesRecords[i]])[0];
    recordsContents.push({
      ...profile,
      remaining_time: getRemainingSuspensionTime(profile.status),
      original_action_hash: profilesLinks[i].target,
      previous_action_hash: profilesRecords[i].signed_action.hashed.hash
    });
  }

  allProfiles.set(recordsContents);

  return recordsContents;
}

/**
 * Registers an administrator by their original profile hash.
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

export async function checkIfPersonIsAdministrator(action_hash: ActionHash): Promise<boolean> {
  return await hc.callZome('administration', 'check_if_person_is_administrator', action_hash);
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
export async function getAllAdministrators(): Promise<Profile[]> {
  const links = await getAllAdministratorsLinks();
  let administratorProfilesPromises = links.map(
    async (link) => await getLatestProfile(link.target)
  );

  const administratorProfiles = (await Promise.all(administratorProfilesPromises)).filter(
    (p) => p !== null
  ) as Profile[];

  administrators.set(administratorProfiles);

  return administratorProfiles;
}

/**
 * Removes an administrator by their original profile hash.d
 */
export async function removeAdministrator(original_action_hash: ActionHash): Promise<boolean> {
  return await hc.callZome('administration', 'remove_administrator', original_action_hash);
}

/**
 * Retrieves profiles that are not administrators.
 */
export async function getNonAdministratorProfiles(): Promise<Profile[]> {
  const links = await getAllProfilesLinks();
  const nonAmdinistratorsProfiles: Profile[] = [];

  for (const link of links) {
    if ((await checkIfPersonIsAdministrator(link.target)) === false) {
      const profile = await getLatestProfile(link.target);
      profile && nonAmdinistratorsProfiles.push(profile);
    }
  }

  nonAmdinistrators.set(nonAmdinistratorsProfiles);

  return nonAmdinistratorsProfiles;
}

/**
 * Updates the status of a person's profile by their original profile hash, their previous profile hash, and their new status.
 */
export async function updateProfileStatus(
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash,
  status: ProfileStatus
): Promise<boolean> {
  return await hc.callZome('profiles', 'update_person_status', {
    original_action_hash,
    previous_action_hash,
    status
  });
}

export async function suspendPersonIndefinitely(
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash
): Promise<boolean> {
  return await hc.callZome('profiles', 'suspend_person_indefinitely', {
    original_action_hash,
    previous_action_hash
  });
}

export async function suspendPersonTemporarily(
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash,
  duration_in_days: number
): Promise<boolean> {
  return await hc.callZome('profiles', 'suspend_person_temporarily', {
    original_action_hash,
    previous_action_hash,
    duration_in_days
  });
}

export async function unsuspendPerson(
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash
): Promise<boolean> {
  return await hc.callZome('profiles', 'unsuspend_person', {
    original_action_hash,
    previous_action_hash
  });
}

export async function unsuspendPersonIfTimePassed(
  original_action_hash: ActionHash,
  previous_action_hash: ActionHash
): Promise<boolean> {
  return await hc.callZome('profiles', 'unsuspend_person_if_time_passed', {
    original_action_hash,
    previous_action_hash
  });
}

export function getRemainingSuspensionTime(status: ProfileStatus): number | null {
  const suspensionDate = new Date(status.split(' ')[1]);
  const now = new Date();

  if (!suspensionDate) return null;

  return suspensionDate.getTime() - now.getTime();
}
