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
  import type { UserType } from '@/types/holochain';

  type Props = {
    users: UIUser[];
  };

  const { users }: Props = $props();

  const modalStore = getModalStore();
  const modalComponent: ModalComponent = { ref: UserDetailsModal };
  const modal = (user: UIUser): ModalSettings => {
    return {
      type: 'component',
      component: modalComponent,
      meta: {
        user
      }
    };
  };

  function formatRemainingTimeInDays(remainingTime: number): string {
    const days = Math.floor(remainingTime / 1000 / 60 / 60 / 24);
    const hours = Math.floor((remainingTime / 1000 / 60 / 60) % 24);

    return `${days}d ${hours}h`;
  }
</script>

<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
  <table
    class="table-hover w-full text-center text-sm drop-shadow-lg sm:table md:text-left md:text-inherit"
  >
    <thead>
      <tr>
        <th class="p-5">Avatar</th>
        <th class="p-5">Name</th>
        <th class="p-5">Type</th>
        {#if users.find((user) => user.remaining_time)}
          <th class="p-5">Remaining time</th>
        {/if}
        <th class="px-5">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each users as user, i}
        <tr>
          <td class="flex justify-center py-2">
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
          {#if user.remaining_time}
            <td class="text-center">
              {#if user.remaining_time}
                {#if user.remaining_time <= 0}
                  <span class="font-bold text-red-600">expired</span>
                {:else}
                  {formatRemainingTimeInDays(user.remaining_time)}
                {/if}
              {/if}
            </td>
          {/if}
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
