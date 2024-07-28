import { writable, type Writable } from 'svelte/store';
import {
  getAllProfilesLinks,
  getLatestProfile,
  type Profile,
  type ProfileStatus
} from './profiles.store';
import type { ActionHash, AgentPubKey, Link } from '@holochain/client';
import hc from '@services/HolochainClientService';

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
 * Registers an administrator by their original profile hash.
 *
 * @param {ActionHash} original_profile_hash - The original profile hash of the administrator to be registered.
 * @returns {Promise<boolean>} A promise that resolves to true if the registration was successful, otherwise false.
 */
export async function registerAdministrator(original_profile_hash: ActionHash): Promise<boolean> {
  return await hc.callZome('administration', 'register_administrator', original_profile_hash);
}

/**
 * Checks if an agent is an administrator and updates the agentIsAdministrator store accordingly.
 *
 * @param {AgentPubKey} agentPubKey - The public key of the agent to check.
 * @returns {Promise<void>}
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

export async function checkIfPersonIsAdministrator(profile_hash: ActionHash): Promise<boolean> {
  return await hc.callZome('administration', 'check_if_person_is_administrator', profile_hash);
}

/**
 * Retrieves all links associated with administrators.
 *
 * @returns {Promise<Link[]>} A promise that resolves to an array of links associated with administrators.
 */
export async function getAllAdministratorsLinks(): Promise<Link[]> {
  return (await hc.callZome('administration', 'get_all_administrators_links', null)) as Link[];
}

/**
 * Retrieves all administrators and updates the administrators store.
 *
 * @returns {Promise<void>}
 */
export async function getAllAdministrators(): Promise<void> {
  const links = await getAllAdministratorsLinks();
  let administratorProfilesPromises = links.map(
    async (link) => await getLatestProfile(link.target)
  );

  const administratorProfiles = (await Promise.all(administratorProfilesPromises)).filter(
    (p) => p !== null
  ) as Profile[];

  administrators.set(administratorProfiles);
}

/**
 * Removes an administrator by their original profile hash.
 *
 * @param {ActionHash} original_profile_hash - The original profile hash of the administrator to be removed.
 * @returns {Promise<boolean>} A promise that resolves to true if the removal was successful, otherwise false.
 */
export async function removeAdministrator(original_profile_hash: ActionHash): Promise<boolean> {
  return await hc.callZome('administration', 'remove_administrator', original_profile_hash);
}

/**
 * Retrieves profiles that are not administrators.
 *
 * @returns {Promise<Profile[]>} A promise that resolves to an array of profiles that are not administrators.
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
 * Updates the status of a person's profile.
 *
 * @param {ActionHash} original_profile_hash - The original profile hash of the profile to be updated.
 * @param {ActionHash} previous_profile_hash - The previous profile hash before the update.
 * @param {ProfileStatus} status - The new status to set for the profile. It either be "pending", "accepted" or "rejected".
 * @returns {Promise<boolean>} A promise that resolves to true if the update was successful, otherwise false.
 */
export async function updateProfileStatus(
  original_profile_hash: ActionHash,
  previous_profile_hash: ActionHash,
  status: ProfileStatus
): Promise<boolean> {
  return await hc.callZome('profiles', 'update_person_status', {
    original_profile_hash,
    previous_profile_hash,
    status
  });
}

export async function suspendPersonIndefinitely(
  original_profile_hash: ActionHash,
  previous_profile_hash: ActionHash
): Promise<boolean> {
  return await hc.callZome('profiles', 'suspend_person_indefinitely', {
    original_profile_hash,
    previous_profile_hash
  });
}

export async function suspendPersonTemporarily(
  original_profile_hash: ActionHash,
  previous_profile_hash: ActionHash,
  duration_in_days: number
): Promise<boolean> {
  return await hc.callZome('profiles', 'suspend_person_temporarily', {
    original_profile_hash,
    previous_profile_hash,
    duration_in_days
  });
}

export async function unsuspendPerson(
  original_profile_hash: ActionHash,
  previous_profile_hash: ActionHash
): Promise<boolean> {
  return await hc.callZome('profiles', 'unsuspend_person', {
    original_profile_hash,
    previous_profile_hash
  });
}

export async function unsuspendPersonIfTimePassed(
  original_profile_hash: ActionHash,
  previous_profile_hash: ActionHash
): Promise<boolean> {
  return await hc.callZome('profiles', 'unsuspend_person_if_time_passed', {
    original_profile_hash,
    previous_profile_hash
  });
}

export function getRemainingSuspensionTime(status: ProfileStatus): number | null {
  const suspensionDate = new Date(status.split(' ')[1]);
  const now = new Date();

  if (!suspensionDate) return null;

  return suspensionDate.getTime() - now.getTime();
}
