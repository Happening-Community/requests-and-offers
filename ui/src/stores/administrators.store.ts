import { writable, type Writable } from 'svelte/store';
import { getLatestProfile, type Profile } from './profiles.store';
import type { ActionHash, AgentPubKey, Link } from '@holochain/client';
import hc from '@services/HolochainClientService';

export const administrators: Writable<Profile[]> = writable([]);
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
  return await hc.callZome('profiles', 'get_all_administrators_links', null);
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
