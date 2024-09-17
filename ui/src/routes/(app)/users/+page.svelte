<script lang="ts">
  import NavButton from '@lib/NavButton.svelte';
  import UsersTable from '@lib/tables/UsersTable.svelte';
  import { type ConicStop, ConicGradient } from '@skeletonlabs/skeleton';
  import usersStore from '@stores/users.svelte';
  import { onMount } from 'svelte';

  const { myProfile, AcceptedEntities } = $derived(usersStore);

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-primary-500))', start: 75, end: 50 }
  ];

  let isLoading = $state(true);

  onMount(async () => {
    await usersStore.getAcceptedUsers();
    isLoading = false;
  });
</script>

<section class="flex flex-col gap-4">
  <div class="flex gap-4">
    <h2 class="h2">Users</h2>
    {#if !myProfile}
      <NavButton href="/user/create">Create Profile</NavButton>
    {/if}
  </div>
  {#if AcceptedEntities.length}
    <UsersTable users={AcceptedEntities} />
  {:else}
    <p class="h3 text-error-500">No users found.</p>
  {/if}
  {#if isLoading && AcceptedEntities.length === 0}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {/if}
</section>
