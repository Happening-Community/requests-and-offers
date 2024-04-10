import { decodeRecords } from '@utils';
import hc from '@services/HolochainClientService';
import { get, writable, type Writable } from 'svelte/store';
import type { ActionHash, AgentPubKey, Link, Record } from '@holochain/client';

export type OrganizationStatus = 'pending' | 'accepted' | 'rejected';

export type Organization = {
  name: string;
  description: string;
  picture?: Uint8Array;
  status?: OrganizationStatus;
  members: ActionHash[];
  admins: ActionHash[];
  projects: ActionHash[];
};

/**
 * Svelte writable store for the current user's organization.
 * @type {Writable<Organization | null>}
 */
export const myOrganization: Writable<Organization[] | null> = writable(null);

export const myOrganizationHash: Writable<ActionHash | null> = writable(null);

/**
 * Svelte writable store for all organizations.
 * @type {Writable<Organization[]>}
 */
export const organizations: Writable<Organization[]> = writable([]);
