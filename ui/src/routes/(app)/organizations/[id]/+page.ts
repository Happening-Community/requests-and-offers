import organizationsStore from '@/stores/organizations.store.svelte';
import { decodeHashFromBase64, type ActionHash } from '@holochain/client';
import { error } from '@sveltejs/kit';

export const load = async ({ params }: { params: { id: string } }) => {
  try {
    const organizationHash = decodeHashFromBase64(params.id) as ActionHash;
    const organization = await organizationsStore.getLatestOrganization(organizationHash);

    if (!organization) {
      throw error(404, 'Organization not found');
    }

    return {
      organization
    };
  } catch (e) {
    // If decoding fails, throw a 400 error
    if (e instanceof Error && e.message.includes('decode')) {
      throw error(400, 'Invalid organization ID');
    }
    // Re-throw other errors
    throw e;
  }
};
