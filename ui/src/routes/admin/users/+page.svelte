<script lang="ts">
  import type { User } from '@/stores/users.svelte';
  import UsersTable from '@lib/tables/UsersTable.svelte';
  import { ConicGradient, type ConicStop } from '@skeletonlabs/skeleton';
  import administrationStore, { AdministrationEntity } from '@stores/administration.store.svelte';
  import { onMount } from 'svelte';

  const { allUsers } = $derived(administrationStore);

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];

  let isLoading = $state(true);

  let pendingUsers: User[] = $state([]);
  let AcceptedEntity: User[] = $state([]);
  let rejectedUsers: User[] = $state([]);
  let temporarilySuspendedUsers: User[] = $state([]);
  let indefinitelySuspendedUsers: User[] = $state([]);

  onMount(async () => {
    await administrationStore.getAllUsers();

    isLoading = false;
  });

  $effect(() => {
    pendingUsers = [];
    AcceptedEntity = [];
    rejectedUsers = [];
    temporarilySuspendedUsers = [];
    indefinitelySuspendedUsers = [];

    for (let user of allUsers) {
      if (!user.status) continue;
      administrationStore
        .getLatestStatusForEntity(user.original_action_hash!, AdministrationEntity.Users)
        .then((status) => {
          if (status!.status_type === 'pending') pendingUsers.push(user);
          if (status!.status_type === 'accepted') AcceptedEntity.push(user);
          if (status!.status_type === 'rejected') rejectedUsers.push(user);
          if (status!.status_type === 'suspended temporarily') temporarilySuspendedUsers.push(user);
          if (status!.status_type === 'suspended indefinitely')
            indefinitelySuspendedUsers.push(user);
        });
    }
  });
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1 text-center">Users management</h1>
  <div class="flex justify-center">
    <a href="/admin/users/status-history" class="btn variant-ghost-secondary w-fit"
      >Status history</a
    >
  </div>
  {#if isLoading && allUsers.length === 0}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {/if}
  <div class="flex flex-col gap-4 lg:flex-row lg:justify-center lg:gap-0 lg:divide-x-2">
    <div class="flex flex-col gap-4 lg:pr-4">
      <h2 class="h3 text-primary-400">Pending users</h2>
      {#if pendingUsers && pendingUsers.length > 0}
        <UsersTable users={pendingUsers} />
      {:else}
        <p>No pending users</p>
      {/if}
    </div>
    <div class="flex flex-col gap-4 lg:pl-4">
      <h2 class="h3 text-green-600">Accepted users</h2>
      {#if AcceptedEntity && AcceptedEntity.length > 0}
        <UsersTable users={AcceptedEntity} />
      {:else}
        <p>No accepted users</p>
      {/if}
    </div>
  </div>

  <details open class="flex flex-col gap-4">
    <summary class="mb-4 flex cursor-pointer gap-2 text-red-600">
      <h2 class="h3">Suspended users</h2>
      <span>
        ({temporarilySuspendedUsers?.length + indefinitelySuspendedUsers?.length}) ⮟
      </span>
    </summary>
    <div class="flex flex-col gap-4 lg:flex-row lg:gap-0 lg:divide-x-2">
      {#if temporarilySuspendedUsers && temporarilySuspendedUsers.length > 0}
        <div class="space-y-2 lg:pr-4">
          <h2 class="h3">Temporarily suspended</h2>
          <UsersTable users={temporarilySuspendedUsers} />
        </div>
      {/if}
      {#if indefinitelySuspendedUsers && indefinitelySuspendedUsers.length > 0}
        <div class="space-y-2 lg:pl-4">
          <h2 class="h3">Indefinitely suspended</h2>

          <UsersTable users={indefinitelySuspendedUsers} />
        </div>
      {/if}
      {#if !temporarilySuspendedUsers && !indefinitelySuspendedUsers}
        <p>No suspended users</p>
      {/if}
    </div>
  </details>

  <details>
    <summary class="mb-4 flex cursor-pointer gap-2 text-red-600">
      <h2 class="h3">Rejected users</h2>
      <span>({rejectedUsers?.length}) ⮟</span>
    </summary>
    <div class="flex flex-col gap-4">
      {#if rejectedUsers && rejectedUsers.length > 0}
        <UsersTable users={rejectedUsers} />
      {:else}
        <p>No rejected users</p>
      {/if}
    </div>
  </details>
</section>
