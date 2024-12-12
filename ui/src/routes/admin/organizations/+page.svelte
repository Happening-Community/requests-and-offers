<script lang="ts">
  import { ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
  import administrationStore from '@/stores/administration.store.svelte';
  import type { UIOrganization, UIStatus } from '@/types/ui';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import { AdministrationEntity } from '@/types/holochain';
  import { decodeRecords } from '@/utils';
  import OrganizationsTable from '@/lib/tables/OrganizationsTable.svelte';

  const { allOrganizations } = $derived(administrationStore);

  let isLoading = $state(true);
  let organizationsByStatus: Record<string, UIOrganization[]> = $state({
    pending: [],
    accepted: [],
    rejected: []
  });

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];

  async function updateOrganizationStatuses() {
    const statusPromises = allOrganizations.map(async (organization) => {
      const record = await administrationStore.getLatestStatusRecordForEntity(
        organization.original_action_hash!,
        AdministrationEntity.Organizations
      );
      if (!record) return null;

      const status: UIStatus = decodeRecords([record])[0];
      return { organization, status: status.status_type };
    });

    const results = await Promise.all(statusPromises);

    // Reset status arrays
    organizationsByStatus = {
      pending: [],
      accepted: [],
      rejected: []
    };

    // Group organizations by status
    results.forEach((result) => {
      if (!result) return;
      const { organization, status } = result;
      if (status in organizationsByStatus) {
        organizationsByStatus[status].push(organization);
      }
    });
  }

  onMount(async () => {
    await organizationsStore.getAllOrganizations();
    await updateOrganizationStatuses();
    isLoading = false;
  });

  // Update statuses when organizations change
  $effect(() => {
    if (allOrganizations.length > 0) {
      updateOrganizationStatuses();
    }
  });
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1 text-center">Organizations management</h1>

  {#if isLoading && allOrganizations.length === 0}
    <div class="flex justify-center">
      <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
    </div>
  {:else}
    <div class="flex flex-col gap-8 lg:flex-row lg:gap-0 lg:divide-x-2">
      <div class="flex-1 lg:pr-8">
        <OrganizationsTable
          organizations={organizationsByStatus.pending}
          title="Pending Organizations"
        />
      </div>
      <div class="flex-1 lg:px-8">
        <OrganizationsTable
          organizations={organizationsByStatus.accepted}
          title="Accepted Organizations"
        />
      </div>
      <div class="flex-1 lg:pl-8">
        <OrganizationsTable
          organizations={organizationsByStatus.rejected}
          title="Rejected Organizations"
        />
      </div>
    </div>
  {/if}
</section>
