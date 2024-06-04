import { writable, type Writable } from 'svelte/store';
import type { Profile } from './profiles.store';
import type { ActionHash, AgentPubKey } from '@holochain/client';
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
