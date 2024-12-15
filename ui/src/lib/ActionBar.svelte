<script lang="ts">
  import { page } from '$app/stores';
  import administrationStore from '@/stores/administration.store.svelte';
  import { AdministrationEntity, type StatusInDHT, type StatusType } from '@/types/holochain';
  import type { Revision, UIUser, UIOrganization } from '@/types/ui';
  import { decodeRecords, queueAndReverseModal } from '@/utils';
  import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
  import type { ConfirmModalMeta, PromptModalMeta } from './types';
  import PromptModal from './dialogs/PromptModal.svelte';
  import ConfirmModal from './dialogs/ConfirmModal.svelte';
  import StatusHistoryModal from './modals/StatusHistoryModal.svelte';

  type Props = {
    entity: UIUser | UIOrganization;
  };
  const { entity }: Props = $props();

  const modalStore = getModalStore();
  const { administrators } = $derived(administrationStore);
  const entityType =
    'agents' in entity ? AdministrationEntity.Users : AdministrationEntity.Organizations;

  let suspensionDate = $state('');
  let isTheOnlyAdmin = $derived(administrators.length === 1);
  let userStatus: StatusInDHT | null = $state(null);

  async function loadStatusRecord() {
    if (entity?.original_action_hash) {
      const statusRecord = await administrationStore.getLatestStatusRecordForEntity(
        entity.original_action_hash,
        entityType
      );
      userStatus = statusRecord ? decodeRecords([statusRecord])[0] : null;
    }
  }

  $effect(() => {
    loadStatusRecord();
  });

  $effect(() => {
    if (userStatus?.suspended_until) {
      suspensionDate = new Date(userStatus.suspended_until).toLocaleString();
    }
  });

  const suspendTemporarilyModalMeta: PromptModalMeta = $derived({
    id: 'suspend-temporarily',
    message: `What is the reason and duration of suspension for this ${entityType === AdministrationEntity.Users ? 'user' : 'organization'}?`,
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
    message: `What is the reason of the suspension for this ${entityType === AdministrationEntity.Users ? 'user' : 'organization'}?`,
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

        if (entityType === AdministrationEntity.Users) {
          await administrationStore.fetchAllUsers();
        } else {
          await administrationStore.refreshOrganizations();
        }

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
      response: async (r) => {
        if (r) {
          switch (meta.id) {
            case 'unsuspend':
              updateStatus({ status_type: 'accepted' });
              break;
            case 'remove-administrator':
              removeAdministrator();
              break;
            case 'accept-user':
            case 'accept-organization':
              updateStatus({ status_type: 'accepted' });
              break;
            case 'reject-user':
            case 'reject-organization':
              updateStatus({ status_type: 'rejected' });
              break;
          }

          if (entityType === AdministrationEntity.Users) {
            await administrationStore.fetchAllUsers();
          } else {
            await administrationStore.refreshOrganizations();
          }

          modalStore.close();
        }
      }
    };
  };

  const statusHistoryModalComponent: ModalComponent = { ref: StatusHistoryModal };
  const statusHistoryModal = (meta: {
    statusHistory: Revision[];
    title: string;
  }): ModalSettings => {
    return {
      type: 'component',
      component: statusHistoryModalComponent,
      meta
    };
  };

  function handleAcceptModal() {
    queueAndReverseModal(
      confirmModal({
        id: entityType === AdministrationEntity.Users ? 'accept-user' : 'accept-organization',
        message: `Are you sure you want to accept this ${entityType === AdministrationEntity.Users ? 'user' : 'organization'}?`,
        confirmLabel: 'Yes',
        cancelLabel: 'No'
      }),
      modalStore
    );
  }

  function handleRejectModal() {
    queueAndReverseModal(
      confirmModal({
        id: entityType === AdministrationEntity.Users ? 'reject-user' : 'reject-organization',
        message: `Are you sure you want to reject this ${entityType === AdministrationEntity.Users ? 'user' : 'organization'}?`,
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
        message: `Are you sure you want to unsuspend this ${entityType === AdministrationEntity.Users ? 'user' : 'organization'}?`,
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

  function updateStatus(newStatus: { status_type: string }) {
    const statusType = newStatus.status_type as StatusType;
    if (entityType === AdministrationEntity.Users) {
      administrationStore.updateUserStatus(
        entity.original_action_hash!,
        entity.previous_action_hash!,
        entity.status?.original_action_hash!,
        { status_type: statusType }
      );
    } else {
      administrationStore.updateUserStatus(
        entity.original_action_hash!,
        entity.previous_action_hash!,
        entity.status?.original_action_hash!,
        { status_type: statusType }
      );
    }
  }

  function handleRemoveAdminModal() {
    queueAndReverseModal(
      confirmModal({
        id: 'remove-administrator',
        message: 'Do you really want to remove this administrator?',
        confirmLabel: 'Yes',
        cancelLabel: 'No'
      }),
      modalStore
    );
  }

  function handleStatusHistoryModal() {
    queueAndReverseModal(
      statusHistoryModal({
        statusHistory: [], // Placeholder until we have a proper way to get status history
        title: `${entityType === AdministrationEntity.Users ? 'User' : 'Organization'} Status History`
      }),
      modalStore
    );
  }

  function removeAdministrator() {
    // Implement administrator removal logic
  }

  async function handleSuspendIndefinitely(data: FormData) {
    const reason = data.get('reason') as string;

    if (!entity.original_action_hash || !entity.previous_action_hash) return;

    const latestStatus = await administrationStore.getLatestStatusRecordForEntity(
      entity.original_action_hash,
      entityType
    );
    if (!latestStatus) return;

    if (entityType === AdministrationEntity.Users) {
      await administrationStore.suspendUserIndefinitely(
        entity.original_action_hash,
        entity.previous_action_hash,
        latestStatus.signed_action.hashed.hash,
        reason
      );
    } else {
      // Fallback to user method if organization method doesn't exist
      await administrationStore.suspendUserIndefinitely(
        entity.original_action_hash,
        entity.previous_action_hash,
        latestStatus.signed_action.hashed.hash,
        reason
      );
    }

    modalStore.close();
  }

  async function handleSuspendTemporarily(data: FormData) {
    const reason = data.get('reason') as string;
    const duration = parseInt(data.get('duration') as string, 10);

    if (!entity.original_action_hash || !entity.previous_action_hash) return;

    const latestStatus = await administrationStore.getLatestStatusRecordForEntity(
      entity.original_action_hash,
      entityType
    );
    if (!latestStatus) return;

    if (entityType === AdministrationEntity.Users) {
      await administrationStore.suspendUserTemporarily(
        entity.original_action_hash,
        entity.previous_action_hash,
        latestStatus.signed_action.hashed.hash,
        reason,
        duration
      );
    } else {
      // Fallback to user method if organization method doesn't exist
      await administrationStore.suspendUserTemporarily(
        entity.original_action_hash,
        entity.previous_action_hash,
        latestStatus.signed_action.hashed.hash,
        reason,
        duration
      );
    }

    modalStore.close();
  }
</script>

<div class="flex flex-wrap items-center justify-center gap-4">
  {#if $page.url.pathname === '/admin/users' || $page.url.pathname === '/admin/organizations'}
    <button class="btn variant-filled-tertiary rounded-lg" onclick={handleStatusHistoryModal}>
      Status History
    </button>
  {/if}

  {#if userStatus?.status_type === 'pending'}
    <button class="btn variant-filled-success rounded-lg" onclick={handleAcceptModal}>
      Accept
    </button>
    <button class="btn variant-filled-error rounded-lg" onclick={handleRejectModal}>
      Reject
    </button>
  {/if}

  {#if userStatus?.status_type === 'accepted'}
    {#if !isTheOnlyAdmin}
      <button class="btn variant-filled-error rounded-lg" onclick={handleRemoveAdminModal}>
        Remove Admin
      </button>
    {/if}
    <button class="btn variant-filled-warning rounded-lg" onclick={() => handlePromptModal('temporarily')}>
      Suspend Temporarily
    </button>
    <button class="btn variant-filled-error rounded-lg" onclick={() => handlePromptModal('indefinitely')}>
      Suspend Indefinitely
    </button>
  {/if}

  {#if userStatus?.status_type?.startsWith('suspended')}
    <button class="btn variant-filled-success rounded-lg" onclick={handleUnsuspendModal}>
      Unsuspend
    </button>
  {/if}
</div>
