<script lang="ts">
  import { Avatar, getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import type { UIOrganization, UIUser } from '@/types/ui';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import usersStore from '@/stores/users.store.svelte';

  type Props = {
    title?: string;
    organization: UIOrganization;
    searchQuery?: string;
    sortBy?: 'name' | 'status';
    sortOrder?: 'asc' | 'desc';
  };

  const {
    title,
    organization,
    searchQuery = '',
    sortBy = 'name',
    sortOrder = 'asc'
  }: Props = $props();

  let agentIsCoordinator = $state(false);
  let coordinators = $state<UIUser[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // Sort and filter coordinators
  function getSortedAndFilteredCoordinators() {
    if (coordinators.length === 0) return [];

    // First, sort the coordinators
    const sorted = [...coordinators].sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else {
        // Sort by status
        const statusA = a.status?.status_type || '';
        const statusB = b.status?.status_type || '';
        return sortOrder === 'asc'
          ? statusA.localeCompare(statusB)
          : statusB.localeCompare(statusA);
      }
    });

    // Then filter by search query
    if (!searchQuery) return sorted;

    return sorted.filter((coordinator) =>
      coordinator.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Get user picture URL
  function getUserPictureUrl(user: UIUser): string {
    return user?.picture
      ? URL.createObjectURL(new Blob([new Uint8Array(user.picture)]))
      : '/default_avatar.webp';
  }

  const displayCoordinators = $derived(getSortedAndFilteredCoordinators());
  const modalStore = getModalStore();
  const toastStore = getToastStore();

  async function loadCoordinators() {
    if (!organization) return;

    loading = true;
    error = null;
    try {
      if (!organization.original_action_hash) return;
      const coordinatorsLinks = await organizationsStore.getOrganizationCoordinators(
        organization.original_action_hash
      );
      coordinators = await usersStore.getUsersByActionHashes(
        coordinatorsLinks.map((link) => link.target)
      );

      // Check if current agent is a coordinator
      agentIsCoordinator = coordinators.some(
        (coord) => coord.original_action_hash === usersStore.currentUser?.original_action_hash
      );
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load coordinators';
      console.error(error);
    } finally {
      loading = false;
    }
  }

  // Reactive statement to load coordinators when organization changes
  $effect(() => {
    loadCoordinators();
  });

  async function handleRemoveCoordinator(coordinator: UIUser) {
    if (!coordinator.original_action_hash || !organization.original_action_hash) return;

    try {
      // Confirm removal
      const confirmed = await new Promise<boolean>((resolve) => {
        modalStore.trigger({
          type: 'confirm',
          title: 'Remove Coordinator',
          body: `Are you sure you want to remove ${coordinator.name} as a coordinator? This action cannot be undone.`,
          response: (r: boolean) => resolve(r)
        });
      });

      if (!confirmed) return;

      loading = true;
      await organizationsStore.removeCoordinator(
        organization.original_action_hash!,
        coordinator.original_action_hash
      );

      toastStore.trigger({
        message: 'Coordinator removed successfully',
        background: 'variant-filled-success'
      });

      await loadCoordinators();
    } catch (e) {
      console.error('Error removing coordinator:', e);
      toastStore.trigger({
        message: 'Failed to remove coordinator',
        background: 'variant-filled-error'
      });
    } finally {
      loading = false;
    }
  }

  async function isCoordinator() {
    if (!organization?.original_action_hash || !usersStore.currentUser?.original_action_hash)
      return;
    agentIsCoordinator = await organizationsStore.isOrganizationCoordinator(
      organization.original_action_hash,
      usersStore.currentUser?.original_action_hash
    );
  }

  $effect(() => {
    isCoordinator();
  });
</script>

<div class="card space-y-4 p-4">
  <header class="card-header">
    <h3 class="h3">{title || 'Organization Coordinators'}</h3>
  </header>

  {#if loading}
    <div class="flex items-center justify-center p-4">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if error}
    <div class="alert variant-filled-error" role="alert">
      {error}
    </div>
  {:else if coordinators.length === 0}
    <div class="alert variant-ghost-surface" role="alert">No coordinators found.</div>
  {:else}
    <div class="table-container">
      <table class="table-hover table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each displayCoordinators as coordinator (coordinator.original_action_hash)}
            <tr>
              <td class="flex items-center gap-2">
                <Avatar src={getUserPictureUrl(coordinator)} width="w-12" />
                <span>{coordinator.name}</span>
              </td>
              <td>
                <span>
                  {coordinator.user_type.charAt(0).toUpperCase() + coordinator.user_type.slice(1)}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  {#if agentIsCoordinator}
                    <button
                      class="btn btn-sm variant-filled-error"
                      onclick={() => handleRemoveCoordinator(coordinator)}
                      disabled={loading || coordinators.length <= 1}
                      title={`${coordinators.length <= 1 ? 'Cannot remove last coordinator' : ''}`}
                      aria-label={`Remove ${coordinator.name} as coordinator`}
                    >
                      Remove
                    </button>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
