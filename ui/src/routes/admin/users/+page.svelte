<script lang="ts">
  import usersStore from '@/stores/users.store.svelte';
  import UsersTable from '@lib/tables/UsersTable.svelte';
  import { ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';

  let isLoading = $state(true);
  let error = $state<string | null>(null);
  const { allUsers } = $derived(usersStore);

  const pendingUsers = $derived(allUsers.filter((user) => user.status?.status_type === 'pending'));
  const acceptedUsers = $derived(
    allUsers.filter((user) => user.status?.status_type === 'accepted')
  );
  const rejectedUsers = $derived(
    allUsers.filter((user) => user.status?.status_type === 'rejected')
  );
  const suspendedTemporarilyUsers = $derived(
    allUsers.filter((user) => user.status?.status_type === 'suspended temporarily')
  );
  const suspendedIndefinitelyUsers = $derived(
    allUsers.filter((user) => user.status?.status_type === 'suspended indefinitely')
  );

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];

  onMount(async () => {
    await usersStore.getAllUsers();

    isLoading = false;
  });
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1 text-center">Users Management</h1>

  <div class="flex justify-center gap-4">
    <a href="/admin/users/status-history" class="btn variant-ghost-secondary w-fit">
      Status History
    </a>
  </div>

  {#if isLoading}
    <div class="flex items-center justify-center">
      <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
      <p>Loading users...</p>
    </div>
  {:else if error}
    <div class="text-error-500">
      {error}
    </div>
  {:else}
    <div class="flex flex-col gap-4 lg:flex-row lg:justify-center lg:gap-0 lg:divide-x-2">
      <div class="flex flex-col gap-4 lg:pr-4">
        <h2 class="h3 text-primary-400">Pending Users</h2>
        {#if pendingUsers.length > 0}
          <UsersTable users={pendingUsers} />
        {:else}
          <p class="text-surface-500 text-center">No pending users</p>
        {/if}
      </div>
      <div class="flex flex-col gap-4 lg:pl-4">
        <h2 class="h3 text-green-600">Accepted Users</h2>
        {#if acceptedUsers.length > 0}
          <UsersTable users={acceptedUsers} />
        {:else}
          <p class="text-surface-500 text-center">No accepted users</p>
        {/if}
      </div>
      <div class="flex flex-col gap-4 lg:pl-4">
        <h2 class="h3 text-red-600">Rejected Users</h2>
        {#if rejectedUsers.length > 0}
          <UsersTable users={rejectedUsers} />
        {:else}
          <p class="text-surface-500 text-center">No rejected users</p>
        {/if}
      </div>
      <div class="flex flex-col gap-4 lg:pl-4">
        <h2 class="h3 text-orange-600">Temporarily Suspended Users</h2>
        {#if suspendedTemporarilyUsers.length > 0}
          <UsersTable users={suspendedTemporarilyUsers} />
        {:else}
          <p class="text-surface-500 text-center">No temporarily suspended users</p>
        {/if}
      </div>
      <div class="flex flex-col gap-4 lg:pl-4">
        <h2 class="h3 text-gray-600">Indefinitely Suspended Users</h2>
        {#if suspendedIndefinitelyUsers.length > 0}
          <UsersTable users={suspendedIndefinitelyUsers} />
        {:else}
          <p class="text-surface-500 text-center">No indefinitely suspended users</p>
        {/if}
      </div>
    </div>
  {/if}
</section>
