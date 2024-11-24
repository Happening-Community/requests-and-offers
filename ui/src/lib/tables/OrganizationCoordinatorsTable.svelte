<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton';
  import type { UIOrganization, UIUser } from '@/types/ui';
  import organizationsStore from '@/stores/organizations.store.svelte';
  import usersStore from '@/stores/users.store.svelte';
  import { page } from '$app/stores';
  import type { ActionHash } from '@holochain/client';

  type Props = {
    organization: UIOrganization;
  };

  const { organization }: Props = $props();

  let coordinators: UIUser[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function loadCoordinators() {
    try {
      loading = true;
      error = null;
      const coordinatorUsers = await organizationsStore.getCoordinatorUsers(organization);
      const loadedCoordinators = await Promise.all(
        coordinatorUsers.map((user) => usersStore.getLatestUser(user.original_action_hash!))
      );
      coordinators = loadedCoordinators.filter((user): user is UIUser => user !== null);
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'An unknown error occurred';
    } finally {
      loading = false;
    }
  }

  async function handleRemoveCoordinator(coordHash: ActionHash) {
    try {
      loading = true;
      error = null;
      await organizationsStore.removeCoordinator(organization, coordHash);
      await loadCoordinators();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'An unknown error occurred';
    } finally {
      loading = false;
    }
  }

  // Load coordinators when the component mounts
  $effect(() => {
    if (organization) {
      loadCoordinators();
    }
  });
</script>

<div class="card p-4">
  <header class="card-header">
    <h3 class="h3">Organization Coordinators</h3>
  </header>

  {#if error}
    <div class="alert variant-filled-error" role="alert">
      {error}
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center p-4">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <table class="table-hover table">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Name</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each coordinators as coordinator (coordinator.original_action_hash)}
          <tr>
            <td>
              <Avatar
                src={coordinator.picture
                  ? URL.createObjectURL(new Blob([new Uint8Array(coordinator.picture)]))
                  : '/default_avatar.webp'}
                width="w-10"
                rounded="rounded-full"
              />
            </td>
            <td>{coordinator.name}</td>
            <td>
              <span class="badge variant-filled-success"> Active </span>
            </td>
            <td>
              <div class="flex gap-2">
                {#if organization.coordinators.includes($page?.data?.user?.original_action_hash!) && coordinators.length > 1}
                  <button
                    class="btn btn-sm variant-filled-error"
                    onclick={() => handleRemoveCoordinator(coordinator.original_action_hash!)}
                    disabled={loading}
                    aria-label="Remove coordinator"
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

    {#if coordinators.length === 0}
      <div class="text-surface-600-300-token flex justify-center p-4">No coordinators found</div>
    {/if}
  {/if}
</div>
