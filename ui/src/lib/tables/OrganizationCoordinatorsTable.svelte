<script lang="ts">
  import { Avatar, getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import type { UIOrganization, UIUser } from '@/types/ui';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import administrationStore from '@/stores/administration.store.svelte';
  import usersStore from '@/stores/users.store.svelte';

  type Props = {
    organization: UIOrganization;
    searchQuery?: string;
    sortBy?: 'name' | 'status';
    sortOrder?: 'asc' | 'desc';
  };

  const { organization, searchQuery = '', sortBy = 'name', sortOrder = 'asc' }: Props = $props();

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

  const displayCoordinators = $derived(getSortedAndFilteredCoordinators());
  const modalStore = getModalStore();
  const toastStore = getToastStore();

  async function loadCoordinators() {
    if (!organization) return;

    loading = true;
    error = null;
    try {
      coordinators = await organizationsStore.getCoordinatorUsers(organization);

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
    if (
      !coordinator.original_action_hash ||
      !organizationsStore.isOrganizationCoordinator(
        organization.original_action_hash!,
        coordinator.original_action_hash
      ) ||
      coordinators.length <= 1
    )
      return;

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
      await organizationsStore.removeCoordinator(organization, coordinator.original_action_hash);

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
</script>

<div class="card space-y-4 p-4">
  <header class="card-header">
    <h3 class="h3">Organization Coordinators</h3>
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
                <Avatar initials={coordinator.name.slice(0, 2)} />
                <span>{coordinator.name}</span>
              </td>
              <td>
                <span>
                  {coordinator.user_type.charAt(0).toUpperCase() + coordinator.user_type.slice(1)}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  {#if agentIsCoordinator && coordinators.length > 1}
                    <button
                      class="btn btn-sm variant-filled-error"
                      onclick={() => handleRemoveCoordinator(coordinator)}
                      disabled={loading}
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
