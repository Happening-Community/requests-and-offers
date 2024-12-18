<script lang="ts">
  import { Avatar, getModalStore, type ModalComponent } from '@skeletonlabs/skeleton';
  import type { UIOrganization } from '@/types/ui';
  import OrganizationDetailsModal from '@/lib/modals/OrganizationDetailsModal.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { encodeHashToBase64 } from '@holochain/client';

  type Props = {
    organizations: UIOrganization[];
    title?: string;
  };

  const { organizations, title }: Props = $props();

  const modalStore = getModalStore();
  const modalComponent: ModalComponent = { ref: OrganizationDetailsModal };

  function handleOrganizationAction(organization: UIOrganization) {
    if ($page.url.pathname.startsWith('/admin')) {
      modalStore.trigger({
        type: 'component',
        component: modalComponent,
        meta: { organization }
      });
    } else {
      console.log('organization:', organization);
      goto(`/organizations/${encodeHashToBase64(organization.original_action_hash!)}`);
    }
  }

  function getOrganizationLogoUrl(organization: UIOrganization): string {
    console.log('organization logo:', organization.location);
    return organization?.logo
      ? URL.createObjectURL(new Blob([new Uint8Array(organization.logo)]))
      : '/default_avatar.webp';
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
          <th>Logo</th>
          <th>Name</th>
          <th>Description</th>
          <th>Members</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each organizations as organization}
          <tr>
            <td>
              <Avatar src={getOrganizationLogoUrl(organization)} />
            </td>
            <td>{organization.name}</td>
            <td class="max-w-md truncate">{organization.description}</td>
            <td class="text-center">{organization.members.length}</td>
            <td>{organization.email || 'N/A'}</td>
            <td>
              <button
                class="btn variant-filled-secondary"
                onclick={() => handleOrganizationAction(organization)}
              >
                {$page.url.pathname.startsWith('/admin') ? 'View' : 'Details'}
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
