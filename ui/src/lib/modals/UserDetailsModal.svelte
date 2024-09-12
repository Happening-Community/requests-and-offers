<script lang="ts">
  import { page } from '$app/stores';
  import StatusHistoryModal from './StatusHistoryModal.svelte';
  import {
    Avatar,
    getModalStore,
    type ModalComponent,
    type ModalSettings
  } from '@skeletonlabs/skeleton';
  import administratorsStore, { type Revision, type Status } from '@stores/administrators.svelte';
  import { type User } from '@stores/users.svelte';
  import { onMount } from 'svelte';
  import PromptModal from '../dialogs/PromptModal.svelte';
  import ConfirmModal from '@lib/dialogs/ConfirmModal.svelte';
  import { queueAndReverseModal } from '@utils';

  const { administrators } = $derived(administratorsStore);
  const modalStore = getModalStore();

  let userPictureUrl = $state('');
  let user: User = $modalStore[0].meta.user;
  let isTheOnlyAdmin = $derived(administrators.length === 1);
  let suspensionDate = $state('');
  let isSuspendedTemporarily = $state(false);

  const suspendTemporarilyModalMeta: PromptModalMeta = $derived({
    id: 'suspend-temporarily',
    message: 'What is the reason and duration of suspension?',
    inputs: [
      {
        name: 'reason',
        label: 'Reason',
        type: 'text',
        placeholder: 'Enter a reason',
        required: true
      },
      {
        name: 'duration',
        label: 'Number of days',
        type: 'number',
        placeholder: 'Number of days',
        value: '1',
        min: 1,
        max: 365,
        required: true
      }
    ]
  });

  const suspendIndefinitelyModalMeta: PromptModalMeta = $derived({
    id: 'suspend-indefinitely',
    message: 'What is the reason of the suspension?',
    inputs: [
      {
        name: 'reason',
        label: 'Reason',
        type: 'text',
        placeholder: 'Enter a reason',
        required: true
      }
    ]
  });

  const promptModalComponent: ModalComponent = { ref: PromptModal };
  const promptModal = (meta: PromptModalMeta): ModalSettings => {
    return {
      type: 'component',
      component: promptModalComponent,
      meta,
      response: async (response) => {
        if (!response) return;

        if (meta.id === 'suspend-temporarily') handleSuspendTemporarily(response.data);
        else handleSuspendIndefinitely(response.data);

        modalStore.close();
      }
    };
  };

  const confirmModalComponent: ModalComponent = { ref: ConfirmModal };
  const confirmModal = (meta: ConfirmModalMeta): ModalSettings => {
    return {
      type: 'component',
      component: confirmModalComponent,
      meta,
      response(r) {
        if (r) {
          switch (meta.id) {
            case 'unsuspend':
              updateStatus({ status_type: 'accepted' });
              break;
            case 'remove-administrator':
              removeAdministrator();
              break;
          }

          modalStore.close();
        }
      }
    };
  };

  const statusHistoryModalComponent: ModalComponent = { ref: StatusHistoryModal };
  const statusHistoryModal = (statusHistory: Revision[]): ModalSettings => {
    return {
      type: 'component',
      component: statusHistoryModalComponent,
      meta: {
        statusHistory
      }
    };
  };

  onMount(async () => {
    userPictureUrl = user?.picture
      ? URL.createObjectURL(new Blob([new Uint8Array(user.picture)]))
      : '/default_avatar.webp';

    if (user && user.status!.suspended_until) {
      isSuspendedTemporarily = true;
      suspensionDate = new Date(user.status!.suspended_until).toLocaleString();
    }
  });

  async function updateStatus(status: Status) {
    if (!user) return;

    let statusMessage = '';
    switch (status.status_type) {
      case 'accepted':
        statusMessage = 'accept';
        break;
      case 'rejected':
        statusMessage = 'reject';
        break;
      case 'suspended indefinitely':
        statusMessage = 'suspend indefinitely';
        break;
      case 'suspended temporarily':
        statusMessage = 'suspend temporarily';
        break;
    }

    const statusOriginalActionHash = (await administratorsStore.getUserStatusLink(
      user?.original_action_hash!
    ))!.target;
    const latestStatusActionHash = (await administratorsStore.getLatestStatusRecordForUser(
      user?.original_action_hash!
    ))!.signed_action.hashed.hash;

    await administratorsStore.updateUserStatus(
      user.original_action_hash!,
      statusOriginalActionHash,
      latestStatusActionHash,
      status
    );
    await administratorsStore.getAllUsers();

    modalStore.close();
  }

  async function handleSuspendIndefinitely(data: FormData) {
    if (!user) return;

    const reason = String(data.get('reason'));

    if (!reason) return;

    const statusOriginalActionHash = (await administratorsStore.getUserStatusLink(
      user?.original_action_hash!
    ))!.target;
    const latestStatusActionHash = (await administratorsStore.getLatestStatusRecordForUser(
      user?.original_action_hash!
    ))!.signed_action.hashed.hash;

    await administratorsStore.suspendUserIndefinitely(
      user.original_action_hash!,
      statusOriginalActionHash,
      latestStatusActionHash,
      reason
    );

    await administratorsStore.getAllUsers();
    modalStore.close();
  }

  async function handleSuspendTemporarily(data: FormData) {
    if (!user) return;

    let suspendedDays = Number(data.get('duration'));
    const reason = String(data.get('reason'));

    const statusOriginalActionHash = (await administratorsStore.getUserStatusLink(
      user?.original_action_hash!
    ))!.target;
    const latestStatusActionHash = (await administratorsStore.getLatestStatusRecordForUser(
      user?.original_action_hash!
    ))!.signed_action.hashed.hash;

    await administratorsStore.suspendUserTemporarily(
      user.original_action_hash!,
      statusOriginalActionHash,
      latestStatusActionHash,
      reason,
      suspendedDays
    );
    await administratorsStore.getAllUsers();
    suspensionDate = new Date(user?.status?.suspended_until!).toLocaleString();
    suspendedDays = 0;
    modalStore.close();
  }

  async function removeAdministrator() {
    if (!user) return;

    await administratorsStore.removeAdministrator(user.original_action_hash!);
    await administratorsStore.getAllAdministrators();
  }

  async function handleRemoveAdminModal() {
    queueAndReverseModal(
      confirmModal({
        id: 'remove-administrator',
        message: 'Do you really want to remove this administrator ?',
        confirmLabel: 'Yes',
        cancelLabel: 'No'
      }),
      modalStore
    );
  }

  async function handleUnsuspendModal() {
    queueAndReverseModal(
      confirmModal({
        id: 'unsuspend',
        message: 'Are you sure you want to unsuspend this user?',
        confirmLabel: 'Yes',
        cancelLabel: 'No'
      }),
      modalStore
    );
  }

  async function handlePromptModal(type: 'indefinitely' | 'temporarily') {
    queueAndReverseModal(
      promptModal(
        type === 'indefinitely' ? suspendIndefinitelyModalMeta : suspendTemporarilyModalMeta
      ),
      modalStore
    );
  }

  async function handleStatusHistoryModal() {
    const userStatus = await administratorsStore.getUserStatusLink(user!.original_action_hash!);
    const statusHistory = await administratorsStore.getAllRevisionsForStatus(
      userStatus!.target,
      user
    );

    queueAndReverseModal(statusHistoryModal(statusHistory), modalStore);
  }
</script>

<article
  class="bg-surface-500 dark:bg-surface-800 flex max-h-[90vh] w-11/12 flex-col items-center gap-4 overflow-auto p-10 text-center text-white shadow-xl md:w-4/5"
>
  {#if user}
    <h2 class="h2 font-bold">{user.name}</h2>
    <h3 class="h3"><b>Nickname :</b> {user.nickname}</h3>
    {#if $page.url.pathname.startsWith('/admin')}
      <p>
        <b>Status :</b>
        {#if !suspensionDate}
          {user.status?.status_type}
        {:else}
          suspended until <br /> {suspensionDate}
        {/if}
      </p>
      {#if user.status?.status_type.startsWith('suspended')}
        <p><b>Reason :</b> {user.status?.reason}</p>
      {/if}
    {/if}
    <div onload={() => URL.revokeObjectURL(userPictureUrl)}>
      <Avatar src={userPictureUrl} width="w-64" background="none" />
    </div>
    <p>{user.bio}</p>
    <p><b>Type :</b> {user.user_type}</p>
    {#if user.skills?.length}
      <p><b>Skills :</b> {user.skills?.join(', ')}</p>
    {/if}
    <p><b>Email :</b> {user.email}</p>
    {#if user.phone}
      <p><b>Phone number :</b> {user.phone}</p>
    {/if}
    {#if user.time_zone}
      <p><b>Timezone :</b> {user.time_zone}</p>
    {/if}
    {#if user.location}
      <p><b>Location :</b> {user.location}</p>
    {/if}
    <div class="mt-5 flex flex-col items-center gap-4">
      {#if $page.url.pathname === '/admin/users'}
        <button class="btn variant-filled-tertiary" onclick={handleStatusHistoryModal}>
          View Status History
        </button>
        {#if user?.status?.status_type === 'pending'}
          <div class="space-x-4">
            <button
              class="btn variant-filled-tertiary"
              onclick={() => updateStatus({ status_type: 'accepted' })}
            >
              Accept
            </button>
            <button
              class="btn variant-filled-error"
              onclick={() => updateStatus({ status_type: 'rejected' })}
            >
              Reject
            </button>
          </div>
        {:else if user?.status?.status_type === 'rejected'}
          <button
            class="btn variant-filled-tertiary"
            onclick={() => updateStatus({ status_type: 'accepted' })}
          >
            Accept
          </button>
        {:else if user?.status?.status_type === 'accepted'}
          <div class="border-error-600 space-y-4 border-2 p-4">
            <h2 class="h3 text-error-600">Suspend</h2>
            <div class="space-x-2 space-y-4">
              <button
                class="btn variant-filled-error"
                onclick={() => handlePromptModal('temporarily')}
              >
                Temporarily
              </button>
              <button
                class="btn variant-filled-error"
                onclick={() => handlePromptModal('indefinitely')}
              >
                Indefinitely
              </button>
            </div>
          </div>
        {:else if user?.status?.status_type.startsWith('suspended')}
          <div class="space-y-4" class:space-x-4={!isSuspendedTemporarily}>
            <button class="btn variant-filled-tertiary" onclick={handleUnsuspendModal}>
              Unsuspend
            </button>
            {#if isSuspendedTemporarily}
              <div class="space-x-2">
                <button
                  class="btn variant-filled-error text-sm"
                  onclick={() => handlePromptModal('temporarily')}
                >
                  Change suspension
                </button>
                <button
                  class="btn variant-filled-error text-sm"
                  onclick={() => handlePromptModal('indefinitely')}
                >
                  Suspend Indefinitely
                </button>
              </div>
            {:else}
              <button
                class="btn variant-filled-error text-sm"
                onclick={() => handlePromptModal('temporarily')}
              >
                Suspend for a period
              </button>
            {/if}
          </div>
        {/if}
      {/if}
      {#if $page.url.pathname === '/admin/administrators'}
        <div class="space-x-4">
          <button
            class="btn variant-filled-error"
            onclick={handleRemoveAdminModal}
            disabled={isTheOnlyAdmin}
            title={isTheOnlyAdmin ? 'Can not remove last admin' : ''}
          >
            Remove Admin
          </button>
        </div>
      {/if}
      <button class="btn variant-filled-secondary w-fit" onclick={() => modalStore.close()}>
        Close
      </button>
    </div>
  {/if}
</article>
