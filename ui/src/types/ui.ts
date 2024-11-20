import type { ActionHash, AgentPubKey } from '@holochain/client';
import type { UserInDHT, StatusInDHT, OrganizationInDHT } from './holochain';

export type UIStatus = StatusInDHT & {
  duration?: number;
};

export type Revision = {
  status: UIStatus;
  timestamp: number;
  entity: UIUser | UIOrganization;
};

export type UIUser = UserInDHT & {
  agents?: AgentPubKey[];
  remaining_time?: number;
  original_action_hash?: ActionHash;
  previous_action_hash?: ActionHash;
  status?: UIStatus;
  status_history?: Revision[];
  organizations?: ActionHash[];
};

export type UIOrganization = OrganizationInDHT & {
  members: ActionHash[];
  coordinators: ActionHash[];
  status?: UIStatus;
  original_action_hash?: ActionHash;
  previous_action_hash?: ActionHash;
};
