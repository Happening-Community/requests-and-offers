<script lang="ts">
  import NavButton from '@lib/NavButton.svelte';
  import UserDetailsModal from '@lib/modals/UserDetailsModal.svelte';
  import {
    Avatar,
    getModalStore,
    type ConicStop,
    type ModalComponent,
    type ModalSettings,
    ConicGradient
  } from '@skeletonlabs/skeleton';
  import { getAcceptedUsers, myUser, acceptedUsers, type User } from '@stores/users.store';
  import { onMount } from 'svelte';

  let isLoading = $state(true);

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-primary-500))', start: 75, end: 50 }
  ];

  onMount(async () => {
    await getAcceptedUsers();
    isLoading = false;
  });

  const modalStore = getModalStore();
  const modalComponent: ModalComponent = { ref: UserDetailsModal };
  const modal = (user: User): ModalSettings => {
    return {
      type: 'component',
      component: modalComponent,
      meta: {
        user
      }
    };
  };
</script>

<section class="flex flex-col gap-4">
  <div class="flex gap-4">
    <h2 class="h2">Users</h2>
    {#if !$myUser}
      <NavButton href="/user/create">Create Profile</NavButton>
    {/if}
  </div>
  {#if $acceptedUsers.length}
    <table class="table">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Name</th>
          <th>Type</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $acceptedUsers as user, i}
          <tr>
            <td>
              <Avatar
                src={user.picture
                  ? URL.createObjectURL(new Blob([new Uint8Array(user.picture)]))
                  : '/default_avatar.webp'}
              />
            </td>
            <td>{user.name}</td>
            <td>
              {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
            </td>
            <td>
              <button
                class="btn variant-filled-primary"
                onclick={() => modalStore.trigger(modal(user))}
              >
                View
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p class="h3 text-error-500">No users found.</p>
  {/if}
  {#if isLoading && $acceptedUsers.length === 0}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {/if}
</section>
