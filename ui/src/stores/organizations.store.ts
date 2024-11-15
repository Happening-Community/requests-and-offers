import type { ActionHash, Record } from '@holochain/client';
import { decodeRecords } from '@utils';
import type { UIOrganization } from '@/types/ui';
import { OrganizationsService } from '@/services/zomes/organizations.service';
import { AdministrationService } from '@/services/zomes/administration.service';
import { AdministrationEntity } from '@/types/holochain';

class OrganizationsStore {
  acceptedOrganizations: UIOrganization[] = $state([]);

  async createOrganization(organization: UIOrganization): Promise<Record> {
    return await OrganizationsService.createOrganization(organization);
  }

  async getAcceptedOrganizations(): Promise<UIOrganization[]> {
    const acceptedOrganizationsLinks = await OrganizationsService.getAcceptedOrganizationsLinks();
    const organizations: UIOrganization[] = [];

    for (const link of acceptedOrganizationsLinks) {
      const organization = await this.getLatestOrganization(link.target);
      if (organization) {
        organizations.push(organization);
      }
    }

    this.acceptedOrganizations = organizations;
    return organizations;
  }

  async getLatestOrganization(original_action_hash: ActionHash): Promise<UIOrganization | null> {
    const record = await OrganizationsService.getLatestOrganizationRecord(original_action_hash);
    if (!record) return null;

    const statusLink = await OrganizationsService.getOrganizationStatusLink(original_action_hash);
    const membersLinks = await OrganizationsService.getOrganizationMembersLinks(original_action_hash);
    const coordinatorsLinks = await OrganizationsService.getOrganizationCoordinatorsLinks(
      original_action_hash
    );

    const organization = decodeRecords([record])[0];
    return {
      ...organization,
      status: statusLink?.target,
      members: membersLinks.map((l) => l.target),
      coordinators: coordinatorsLinks.map((l) => l.target),
      original_action_hash,
      previous_action_hash: record.signed_action.hashed.hash
    };
  }
}

const organizationsStore = new OrganizationsStore();
export default organizationsStore;
