import { writable, type Writable } from 'svelte/store';
import {
  getAgentProfileLinks,
  getAllProfilesLinks,
  getLatestProfile,
  getLatestProfileRecord,
  type Profile,
  type ProfileStatus
} from './profiles.store';
import type { ActionHash, AgentPubKey, Link } from '@holochain/client';
import hc from '@services/HolochainClientService';

export const administrators: Writable<Profile[]> = writable([]);
export const administratorProfilesHashes: Writable<ActionHash[]> = writable([]);
export const agentIsAdministrator: Writable<boolean> = writable(false);

export async function registerAdministrator(original_profile_hash: ActionHash): Promise<boolean> {
  return await hc.callZome('profiles', 'register_administrator', original_profile_hash);
}

export async function checkIfAgentIsAdministrator(agentPubKey: AgentPubKey): Promise<void> {
  agentIsAdministrator.set(
    await hc.callZome('profiles', 'check_if_agent_is_administrator', agentPubKey)
  );
}

export async function getAllAdministratorsLinks(): Promise<Link[]> {
  const links: Link[] = await hc.callZome('profiles', 'get_all_administrators_links', null);

  if (links.length > 0) administratorProfilesHashes.set(links.map((l) => l.target));

  return links;
}

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

export async function getNonAdministratorProfilesLinks(): Promise<Link[]> {
  const adminlinks: Link[] = await getAllAdministratorsLinks();
  const links = await getAllProfilesLinks();
  return links.filter((l) => !adminlinks.includes(l));
}

export async function getNonAdministratorProfiles(): Promise<Profile[]> {
  const adminlinks: Link[] = await getAllAdministratorsLinks();
  console.log('adminlinks :', adminlinks);

  const links = await getAllProfilesLinks();

  const profiles = await Promise.all(
    links
      .filter((l) => !adminlinks.includes(l))
      .map(async (link) => await getLatestProfile(link.target))
  );
  console.log('profiles :', profiles);

  return profiles.filter((p) => p !== null) as Profile[];
}

export async function updateProfileStatus(
  agent: AgentPubKey,
  status: ProfileStatus
): Promise<boolean> {
  const original_profile_hash = (await getAgentProfileLinks(agent))[0].target;
  const previous_profile_hash = (await getLatestProfileRecord(original_profile_hash))?.signed_action
    .hashed.hash;

  return await hc.callZome('profiles', 'update_person_status', {
    original_profile_hash,
    previous_profile_hash,
    status
  });
}
