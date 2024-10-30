import type { ActionHash } from '@holochain/client';

export type OrganizationStatus = 'pending' | 'accepted' | 'rejected';

export type Organization = {
  name: string;
  description: string;
  logo?: Uint8Array;
  status?: OrganizationStatus;
  members: ActionHash[];
  coordinators: ActionHash[];
};

class OrganizationsStore {
  organizations: Organization[] = $state([]);
}

const organizationsStore = new OrganizationsStore();
export default organizationsStore;
