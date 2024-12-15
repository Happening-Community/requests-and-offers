<script lang="ts">
  import { Avatar, getModalStore, type ModalComponent } from '@skeletonlabs/skeleton';
  import type { UIOrganization, UIStatus } from '@/types/ui';
  import OrganizationDetailsModal from '@/lib/modals/OrganizationDetailsModal.svelte';

  type Props = {
    organizations: UIOrganization[];
    title?: string;
  };

  const { organizations, title }: Props = $props();

  const modalStore = getModalStore();
  const modalComponent: ModalComponent = { ref: OrganizationDetailsModal };

  function handleViewOrganization(organization: UIOrganization) {
    modalStore.trigger({
      type: 'component',
      component: modalComponent,
      meta: { organization }
    });
  }

  function formatRemainingTime(status?: UIStatus) {
    if (status?.status_type === 'suspended temporarily') {
      return 'Temporarily Suspended';
    }
    return '';
  }
</script>

<div class="flex flex-col gap-4">
  {#if title}
    <h2 class="h3 text-center font-semibold">{title}</h2>
  {/if}
  {#if organizations.length > 0}
    <table class="table-hover table drop-shadow-lg">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Name</th>
          {#if organizations[0].status?.status_type === 'suspended temporarily'}
            <th>Suspension</th>
          {/if}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each organizations as organization}
          <tr>
            <td>
              <Avatar
                src={organization.logo
                  ? URL.createObjectURL(new Blob([new Uint8Array(organization.logo)]))
                  : '/default_avatar.webp'}
              />
            </td>
            <td>{organization.name}</td>
            {#if organizations[0].status?.status_type === 'suspended temporarily'}
              <td>
                <span class="text-surface-500 text-sm">
                  {formatRemainingTime(organization.status) || 'Indefinite'}
                </span>
              </td>
            {/if}
            <td>
              <button
                class="btn variant-filled-secondary"
                onclick={() => handleViewOrganization(organization)}
              >
                View
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p class="text-surface-500 text-center">No organizations found.</p>
  {/if}
</div>
