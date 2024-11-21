<script lang="ts">
  import { 
    Avatar, 
    getModalStore, 
    type ModalComponent 
  } from '@skeletonlabs/skeleton';
  import UserDetailsModal from '@/lib/modals/UserDetailsModal.svelte';
  import type { UIUser } from '@/types/ui';

  type Props = {
    users: UIUser[];
    title?: string;
  };

  const { users, title = 'Users' }: Props = $props();

  const modalStore = getModalStore();
  const modalComponent: ModalComponent = { ref: UserDetailsModal };

  function handleViewUser(user: UIUser) {
    modalStore.trigger({
      type: 'component',
      component: modalComponent,
      meta: { user }
    });
  }

  function formatRemainingTimeInDays(remainingTime?: number): string {
    if (!remainingTime) return 'Expired';
    const days = Math.floor(remainingTime / 1000 / 60 / 60 / 24);
    const hours = Math.floor((remainingTime / 1000 / 60 / 60) % 24);
    return `${days}d ${hours}h`;
  }
</script>

<div class="flex flex-col gap-4">
  {#if title}
    <h2 class="h3 text-center font-semibold">{title}</h2>
  {/if}
  
  {#if users.length > 0}
    <table class="table-hover table drop-shadow-lg">
      <thead>
        <tr>
          <th>Avatar</th>
          <th>Name</th>
          <th>Type</th>
          {#if users.some((user) => user.remaining_time)}
            <th>Remaining time</th>
          {/if}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each users as user}
          <tr>
            <td>
              <Avatar
                src={user.picture
                  ? URL.createObjectURL(new Blob([new Uint8Array(user.picture)]))
                  : '/default_avatar.webp'}
                alt={`Avatar of ${user.name}`}
              />
            </td>
            <td>{user.name}</td>
            <td>
              {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
            </td>
            {#if user.remaining_time}
              <td class="text-center">
                {#if user.remaining_time <= 0}
                  <span class="font-bold text-red-600">expired</span>
                {:else}
                  {formatRemainingTimeInDays(user.remaining_time)}
                {/if}
              </td>
            {/if}
            <td>
              <button
                class="btn variant-filled-secondary"
                onclick={() => handleViewUser(user)}
              >
                View
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p class="text-center text-surface-500">No users found.</p>
  {/if}
</div>
