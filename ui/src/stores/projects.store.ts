import { decodeRecords } from '@utils';
import hc from '@services/HolochainClientService';
import { get, writable, type Writable } from 'svelte/store';
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';

export type ProjectStatus = 'pending' | 'accepted' | 'rejected';

export type Project = {
  name: string;
  description: string;
  picture?: Uint8Array;
  status?: ProjectStatus;
  team_members: ActionHash[];
  admins: ActionHash[];
};

/**
 * Svelte writable store for all projects.
 * @type {Writable<Project[]>}
 */
export const projects: Writable<Project[]> = writable([]);
