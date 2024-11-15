<script lang="ts">
  import { onMount } from 'svelte';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import OrganizationDetailsModal from '@/lib/modals/OrganizationDetailsModal.svelte';
  import { queueAndReverseModal } from '@/utils';
  import administrationStore, {
    AdministrationEntity,
    type Status
  } from '@/stores/administration.store.svelte';
  import type { UIOrganization } from '@/types/ui';
  import organizationsStore from '@/stores/organizations.store.svelte';

  let organizations: UIOrganization[] = $state([]);
  let organizationStatuses: Map<string, Status> = $state(new Map());
  const modalStore = getModalStore();

  onMount(async () => {
    organizations = await organizationsStore.getAllOrganizations();
    for (const organization of organizations) {
      const status = await administrationStore.getLatestStatusForEntity(
        organization.original_action_hash!,
        AdministrationEntity.Organizations
      );
      if (status) {
        organizationStatuses.set(organization.original_action_hash!.toString(), status);
      }
    }
  });

  function handleOrganizationClick(organization: UIOrganization) {
    queueAndReverseModal(
      {
        type: 'component',
        component: {
          ref: OrganizationDetailsModal,
          props: {
            organization
          }
        }
      },
      modalStore
    );
  }
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1 text-center">Organizations management</h1>
  {#if isLoading && allOrganizations.length === 0}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {/if}
  <div class="flex flex-col gap-4 lg:flex-row lg:gap-0 lg:divide-x-2">
    <div class="flex flex-col gap-4 lg:pr-4">
      <h2 class="h3">Pending organizations</h2>
      {#if pendingOrganizations && pendingOrganizations.length > 0}
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each pendingOrganizations as organization, i}
              <tr>
                <td>
                  <Avatar
                    src={organization.logo
                      ? URL.createObjectURL(new Blob([new Uint8Array(organization.logo)]))
                      : '/default_avatar.webp'}
                  />
                </td>
                <td>{organization.name}</td>

                <td>
                  <button
                    class="btn variant-filled-secondary"
                    onclick={() => handleOrganizationClick(organization)}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No pending organizations</p>
      {/if}
    </div>
    <div class="flex flex-col gap-4 lg:pl-4">
      <h2 class="h3">Accepted organizations</h2>
      {#if acceptedOrganizations && acceptedOrganizations.length > 0}
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each acceptedOrganizations as organization, i}
              <tr>
                <td>
                  <Avatar
                    src={organization.logo
                      ? URL.createObjectURL(new Blob([new Uint8Array(organization.logo)]))
                      : '/default_avatar.webp'}
                  />
                </td>
                <td>{organization.name}</td>
                <td>
                  <button
                    class="btn variant-filled-secondary"
                    onclick={() => handleOrganizationClick(organization)}
                  >
                    View
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p>No accepted organizations</p>
      {/if}
    </div>
  </div>
</section>
