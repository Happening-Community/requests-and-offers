import type { ActionHash } from '@holochain/client';

export type ProjectStatus = 'pending' | 'accepted' | 'rejected';

export type Project = {
  name: string;
  description: string;
  picture?: Uint8Array;
  status?: ProjectStatus;
  team_members: ActionHash[];
  admins: ActionHash[];
};

class ProjectsStore {
  projects: Project[] = $state([]);
}

const projectsStore = new ProjectsStore();
export default projectsStore;
