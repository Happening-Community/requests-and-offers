import type { ActionHash } from '@holochain/client';

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

class OrganizationsStore {
  organizations: Organization[] = $state([]);
}

const organizationsStore = new OrganizationsStore();
export default organizationsStore;
