<script lang="ts">
  import {
    Avatar,
    getModalStore,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import UserDetailsModal from '@/lib/modals/UserDetailsModal.svelte';
  import { queueAndReverseModal } from '@/utils';
  import type { UIUser } from '@/types/ui';

  type Props = {
    users: UIUser[];
    isLoading?: boolean;
    error?: string | null;
  };

  const { users, isLoading = false, error = null }: Props = $props();

  const modalStore = getModalStore();
  const modalComponent: ModalComponent = { ref: UserDetailsModal };

  function createUserModal(user: UIUser): ModalSettings {
    return {
      type: 'component',
      component: modalComponent,
      meta: { user }
    };
  }

  function formatRemainingTimeInDays(remainingTime?: number): string {
    if (!remainingTime) return 'Expired';
    const days = Math.floor(remainingTime / 1000 / 60 / 60 / 24);
    const hours = Math.floor((remainingTime / 1000 / 60 / 60) % 24);
    return `${days}d ${hours}h`;
  }
</script>

<div class="relative overflow-x-auto" aria-label="Users Table">
  {#if isLoading}
    <div class="p-4 text-center" aria-live="polite">Loading users...</div>
  {:else if error}
    <div class="text-error-500 p-4 text-center" aria-live="assertive">
      {error}
    </div>
  {:else if users.length === 0}
    <div class="p-4 text-center" aria-live="polite">No users found.</div>
  {:else}
    <table
      class="table-hover w-full text-center text-sm drop-shadow-lg sm:table md:text-left md:text-inherit"
    >
      <thead>
        <tr>
          <th class="p-5">Avatar</th>
          <th class="p-5">Name</th>
          <th class="p-5">Type</th>
          {#if users.some((user) => user.remaining_time)}
            <th class="p-5">Remaining time</th>
          {/if}
          <th class="px-5">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each users as user, i (user.original_action_hash)}
          <tr>
            <td class="flex justify-center py-2">
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
                onclick={() => modalStore.trigger(createUserModal(user))}
                aria-label={`View details for ${user.name}`}
              >
                View
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
