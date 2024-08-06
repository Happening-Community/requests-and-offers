<script lang="ts">
  import {
    Avatar,
    ConicGradient,
    getModalStore,
    type ConicStop,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import { type User } from '@stores/users.store';
  import { allUsers, getAllUsers } from '@stores/administrators.store';
  import { onMount } from 'svelte';
  import UserDetailsModal from '@lib/modals/UserDetailsModal.svelte';

  let isLoading = $state(true);

  let pendingUsers = $derived($allUsers.filter((user) => user.status === 'pending'));
  let acceptedUsers = $derived($allUsers.filter((user) => user.status === 'accepted'));
  let rejectedUsers = $derived($allUsers.filter((user) => user.status === 'rejected'));
  let temporarilySuspendedUsers = $derived(
    $allUsers
      .filter((user) => user.status!.split(' ').length > 1)
      .filter((user) => user.remaining_time)
      .sort((a, b) => a.remaining_time! - b.remaining_time!)
  );
  let indefinitelySuspendedUsers = $derived(
    $allUsers.filter((user) => user.status === 'suspended')
  );

  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 0 },
    { color: 'rgb(var(--color-secondary-500))', start: 75, end: 50 }
  ];

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

  onMount(async () => {
    await getAllUsers();

    isLoading = false;
  });

  function formatRemainingTimeInDays(remainingTime: number): string {
    const days = Math.floor(remainingTime / 1000 / 60 / 60 / 24);
    const hours = Math.floor((remainingTime / 1000 / 60 / 60) % 24);

    return `${days}d ${hours}h`;
  }
</script>

<section class="flex flex-col gap-10">
  <h1 class="h1 text-center">Users management</h1>
  {#if isLoading && $allUsers.length === 0}
    <ConicGradient stops={conicStops} spin>Loading</ConicGradient>
  {/if}
  <div class="flex flex-col gap-4 lg:flex-row lg:justify-center lg:gap-0 lg:divide-x-2">
    <div class="flex flex-col gap-4 lg:pr-4">
      <h2 class="h3 text-primary-400">Pending users</h2>
      {#if pendingUsers && pendingUsers.length > 0}
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each pendingUsers as user, i}
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
                    class="btn variant-filled-secondary"
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
        <p>No pending users</p>
      {/if}
    </div>
    <div class="flex flex-col gap-4 lg:pl-4">
      <h2 class="h3 text-green-600">Accepted users</h2>
      {#if acceptedUsers && acceptedUsers.length > 0}
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each acceptedUsers as user, i}
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
                    class="btn variant-filled-secondary"
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

          <table class="table-hover table drop-shadow-lg">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Type</th>
                <th>Remaining time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each temporarilySuspendedUsers as user, i}
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
                  <td class="text-center">
                    {#if user.remaining_time}
                      {#if user.remaining_time <= 0}
                        <span class="font-bold text-red-600">expired</span>
                      {:else}
                        {formatRemainingTimeInDays(user.remaining_time)}
                      {/if}
                    {/if}
                  </td>
                  <td>
                    <button
                      class="btn variant-filled-secondary"
                      onclick={() => modalStore.trigger(modal(user))}
                    >
                      View
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
      {#if indefinitelySuspendedUsers && indefinitelySuspendedUsers.length > 0}
        <div class="space-y-2 lg:pl-4">
          <h2 class="h3">Indefinitely suspended</h2>

          <table class="table-hover table drop-shadow-lg">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each indefinitelySuspendedUsers as user, i}
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
                      class="btn variant-filled-secondary"
                      onclick={() => modalStore.trigger(modal(user))}
                    >
                      View
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
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
        <table class="table-hover table drop-shadow-lg">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each rejectedUsers as user, i}
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
                    class="btn variant-filled-secondary"
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
        <p>No rejected users</p>
      {/if}
    </div>
  </details>
</section>
