<script lang="ts">
  import { page } from '$app/stores';
  import administratorsStore, {
    AdministrationEntity,
    type Revision,
    type Status
  } from '@/stores/administrators.svelte';
  import type { User } from '@/stores/users.svelte';
  import { queueAndReverseModal } from '@/utils';
  import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
  import type { ConfirmModalMeta, PromptModalMeta } from './types';
  import PromptModal from './dialogs/PromptModal.svelte';
  import ConfirmModal from './dialogs/ConfirmModal.svelte';
  import StatusHistoryModal from './modals/StatusHistoryModal.svelte';
  import usersStore from '@/stores/users.svelte';
  import { onMount } from 'svelte';
  import type { Organization } from '@/stores/organizations.svelte';

  type Props = {
    entity: User | Organization;
  };
  const { entity }: Props = $props();

  const modalStore = getModalStore();
  const { administrators } = $derived(administratorsStore);

  let suspensionDate = $state('');
  let isTheOnlyAdmin = $derived(administrators.length === 1);
  let isSuspendedTemporarily = $state(false);
  let userStatus: Status | null = $state(null);

  onMount(async () => {
    userStatus = await administratorsStore.getLatestStatusForEntity(
      entity.original_action_hash!,
      AdministrationEntity.Users
    );
    console.log('userStatus', userStatus);
  });

  $effect(() => {
    if (userStatus && userStatus.suspended_until) {
      isSuspendedTemporarily = true;
      suspensionDate = new Date(userStatus!.suspended_until).toLocaleString();
    }
  });

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
            case 'accept-user':
              updateStatus({ status_type: 'accepted' });
              break;
            case 'reject-user':
              updateStatus({ status_type: 'rejected' });
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

  function handleAcceptModal() {
    queueAndReverseModal(
      confirmModal({
        id: 'accept-user',
        message: 'Are you sure you want to accept this user?',
        confirmLabel: 'Yes',
        cancelLabel: 'No'
      }),
      modalStore
    );
  }

  function handleRejectModal() {
    queueAndReverseModal(
      confirmModal({
        id: 'reject-user',
        message: 'Are you sure you want to reject this user?',
        confirmLabel: 'Yes',
        cancelLabel: 'No'
      }),
      modalStore
    );
  }

  function handleRemoveAdminModal() {
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

  function handleUnsuspendModal() {
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

  function handlePromptModal(type: 'indefinitely' | 'temporarily') {
    queueAndReverseModal(
      promptModal(
        type === 'indefinitely' ? suspendIndefinitelyModalMeta : suspendTemporarilyModalMeta
      ),
      modalStore
    );
  }

  async function handleStatusHistoryModal() {
    const userStatus = await administratorsStore.getUserStatusLink(entity!.original_action_hash!);
    const statusHistory = await administratorsStore.getAllRevisionsForStatus(
      userStatus!.target,
      entity as User
    );

    queueAndReverseModal(statusHistoryModal(statusHistory), modalStore);
  }

  async function updateStatus(status: Status) {
    if (!entity) return;

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
      entity?.original_action_hash!
    ))!.target;
    const latestStatusActionHash = (await administratorsStore.getLatestStatusRecordForEntity(
      entity?.original_action_hash!,
      AdministrationEntity.Users
    ))!.signed_action.hashed.hash;

    await administratorsStore.updateUserStatus(
      entity.original_action_hash!,
      statusOriginalActionHash,
      latestStatusActionHash,
      status
    );
    await administratorsStore.getAllUsers();

    modalStore.close();
  }

  async function handleSuspendIndefinitely(data: FormData) {
    if (!entity) return;

    const reason = String(data.get('reason'));

    if (!reason) return;

    const statusOriginalActionHash = (await administratorsStore.getUserStatusLink(
      entity?.original_action_hash!
    ))!.target;
    const latestStatusActionHash = (await administratorsStore.getLatestStatusRecordForEntity(
      entity?.original_action_hash!,
      AdministrationEntity.Users
    ))!.signed_action.hashed.hash;

    await administratorsStore.suspendUserIndefinitely(
      entity.original_action_hash!,
      statusOriginalActionHash,
      latestStatusActionHash,
      reason
    );

    await administratorsStore.getAllUsers();
    modalStore.close();
  }

  async function handleSuspendTemporarily(data: FormData) {
    if (!entity) return;

    let suspendedDays = Number(data.get('duration'));
    const reason = String(data.get('reason'));

    const statusOriginalActionHash = (await administratorsStore.getUserStatusLink(
      entity?.original_action_hash!
    ))!.target;
    const latestStatusActionHash = (await administratorsStore.getLatestStatusRecordForEntity(
      entity?.original_action_hash!,
      AdministrationEntity.Users
    ))!.signed_action.hashed.hash;

    await administratorsStore.suspendUserTemporarily(
      entity.original_action_hash!,
      statusOriginalActionHash,
      latestStatusActionHash,
      reason,
      suspendedDays
    );
    await administratorsStore.getAllUsers();
    suspensionDate = new Date(userStatus!.suspended_until!).toLocaleString();
    suspendedDays = 0;
    modalStore.close();
  }

  async function removeAdministrator() {
    if (!entity) return;

    const userAgents = await usersStore.getUserAgents(entity.original_action_hash!);
    if (!userAgents.length) return;

    await administratorsStore.removeAdministrator(entity.original_action_hash!, userAgents);
    await administratorsStore.getAllAdministrators();
  }
</script>

<div class="flex flex-wrap items-center justify-center gap-4">
  {#if $page.url.pathname === '/admin/users'}
    <button class="btn variant-filled-tertiary rounded-lg" onclick={handleStatusHistoryModal}>
      View Status History
    </button>
    {#if userStatus}
      {#if userStatus!.status_type === 'pending' || userStatus!.status_type === 'rejected'}
        <button class="btn variant-filled-tertiary rounded-lg" onclick={handleAcceptModal}>
          Accept
        </button>
        {#if userStatus!.status_type === 'pending'}
          <button class="btn variant-filled-error rounded-lg" onclick={handleRejectModal}>
            Reject
          </button>
        {/if}
      {:else if userStatus!.status_type === 'accepted'}
        <button
          class="btn variant-filled-error rounded-lg"
          onclick={() => handlePromptModal('temporarily')}
        >
          Suspend Temporarily
        </button>
        <button
          class="btn variant-filled-error rounded-lg"
          onclick={() => handlePromptModal('indefinitely')}
        >
          Suspend Indefinitely
        </button>
      {:else if userStatus!.status_type.startsWith('suspended')}
        <button class="btn variant-filled-tertiary rounded-lg" onclick={handleUnsuspendModal}>
          Unsuspend
        </button>
        {#if isSuspendedTemporarily}
          <button
            class="btn variant-filled-error rounded-lg"
            onclick={() => handlePromptModal('temporarily')}
          >
            Change suspension
          </button>
          <button
            class="btn variant-filled-error rounded-lg"
            onclick={() => handlePromptModal('indefinitely')}
          >
            Suspend Indefinitely
          </button>
        {:else}
          <button
            class="btn variant-filled-error rounded-lg"
            onclick={() => handlePromptModal('temporarily')}
          >
            Suspend for a period
          </button>
        {/if}
      {/if}
    {/if}
  {/if}
  {#if $page.url.pathname === '/admin/administrators'}
    <button
      class="btn variant-filled-error rounded-lg"
      onclick={handleRemoveAdminModal}
      disabled={isTheOnlyAdmin}
      title={isTheOnlyAdmin ? 'Can not remove last admin' : ''}
    >
      Remove Admin
    </button>
  {/if}
</div>
