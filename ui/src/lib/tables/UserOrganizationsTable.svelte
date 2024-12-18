<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton';
  import type { UIOrganization } from '@/types/ui';
  import { OrganizationRole } from '@/types/ui';
  import { goto } from '$app/navigation';
  import { encodeHashToBase64 } from '@holochain/client';

  type Props = {
    organizations: UIOrganization[];
    title: string;
    role: OrganizationRole;
  };

  const { organizations, title, role }: Props = $props();

  function getOrganizationLogoUrl(organization: UIOrganization): string {
    console.log('organization logo:', organization.location);
    return organization?.logo
      ? URL.createObjectURL(new Blob([new Uint8Array(organization.logo)]))
      : '/default_avatar.webp';
  }
</script>

<div class="card space-y-4 p-4">
  <header class="card-header">
    <h3 class="h3">{title}</h3>
  </header>

  {#if organizations.length === 0}
    <div class="flex justify-center p-4">
      <p class="text-surface-600-300-token">No organizations found</p>
    </div>
  {:else}
    <div class="table-container">
      <table class="table-hover table">
        <thead>
          <tr>
            <th>Logo</th>
            <th>Name</th>
            <th>Description</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each organizations as organization (organization.original_action_hash)}
            <tr>
              <td>
                <Avatar
                  src={getOrganizationLogoUrl(organization)}
                  width="w-10"
                  rounded="rounded-full"
                />
              </td>
              <td>{organization.name}</td>
              <td class="max-w-xs truncate">{organization.description}</td>
              <td>
                <span
                  class="badge {role === OrganizationRole.Coordinator
                    ? 'variant-filled-primary'
                    : 'variant-filled-surface'}"
                >
                  {role}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button
                    class="btn btn-sm variant-filled-surface"
                    onclick={() =>
                      goto(
                        `/organizations/${encodeHashToBase64(organization.original_action_hash!)}`
                      )}
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .table-container {
    overflow-x: auto;
    max-width: 100%;
  }
</style>
