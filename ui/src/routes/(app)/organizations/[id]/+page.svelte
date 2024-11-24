<script lang="ts">
  import { page } from '$app/stores';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import type { UIOrganization } from '@/types/ui';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import OrganizationMembersTable from '@/lib/tables/OrganizationMembersTable.svelte';
  import OrganizationCoordinatorsTable from '@/lib/tables/OrganizationCoordinatorsTable.svelte';
  import MemberManagementModal from '@/lib/modals/MemberManagementModal.svelte';
  import { decodeHashFromBase64 } from '@holochain/client';

  const modalStore = getModalStore();
  const organizationHashString = $page.params.id;
  const organizationHash = decodeHashFromBase64(organizationHashString);

  let organization: UIOrganization | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function loadOrganization() {
    try {
      loading = true;
      error = null;
      organization = await organizationsStore.getLatestOrganization(organizationHash);
      if (!organization) {
        throw new Error('Organization not found');
      }
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'An unknown error occurred';
      organization = null;
    } finally {
      loading = false;
    }
  }

  async function handleOpenMemberModal() {
    if (!organization) return;

    modalStore.trigger({
      type: 'component',
      component: {
        ref: MemberManagementModal,
        props: { organization }
      }
    });
  }

  async function handleDeleteOrganization() {
    if (!organization) return;

    try {
      loading = true;
      error = null;
      await organizationsStore.deleteOrganization(organizationHash);
      // Navigate back to organizations list
      window.history.back();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'An unknown error occurred';
    } finally {
      loading = false;
    }
  }

  // Load organization when the component mounts
  $effect(() => {
    if (organizationHash) {
      loadOrganization();
    }
  });
</script>

<div class="container mx-auto space-y-4 p-4">
  {#if error}
    <div class="alert variant-filled-error" role="alert">
      {error}
    </div>
  {/if}

  {#if loading && !organization}
    <div class="flex justify-center p-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if organization}
    <header class="flex items-center justify-between">
      <div>
        <h2 class="h2">{organization.name}</h2>
        <p class="text-surface-600-300-token">{organization.description}</p>
      </div>
      <div class="flex gap-2">
        {#if organization.coordinators.includes($page?.data?.user?.original_action_hash!)}
          <button
            class="btn variant-filled-primary"
            onclick={handleOpenMemberModal}
            disabled={loading}
          >
            Manage Members
          </button>
          <button
            class="btn variant-filled-error"
            onclick={handleDeleteOrganization}
            disabled={loading}
          >
            Delete Organization
          </button>
        {/if}
      </div>
    </header>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Members Section -->
      <section>
        <OrganizationMembersTable {organization} />
      </section>

      <!-- Coordinators Section -->
      <section>
        <OrganizationCoordinatorsTable {organization} />
      </section>
    </div>

    <!-- Settings Section (Coordinators Only) -->
    {#if organization.coordinators.includes($page?.data?.user?.original_action_hash!)}
      <section class="card p-4">
        <header class="card-header">
          <h3 class="h3">Organization Settings</h3>
        </header>

        <form class="space-y-4">
          <label class="label">
            <span>Organization Name</span>
            <input class="input" type="text" bind:value={organization.name} disabled={loading} />
          </label>

          <label class="label">
            <span>Description</span>
            <textarea class="textarea" bind:value={organization.description} disabled={loading}
            ></textarea>
          </label>

          <div class="flex justify-end">
            <button type="submit" class="btn variant-filled-primary" disabled={loading}>
              Save Changes
            </button>
          </div>
        </form>
      </section>
    {/if}
  {:else}
    <div class="flex justify-center p-8">
      <p class="text-surface-600-300-token">Organization not found</p>
    </div>
  {/if}
</div>
