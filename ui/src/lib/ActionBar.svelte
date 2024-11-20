<script lang="ts">
  import { page } from '$app/stores';
  import administrationStore from '@/stores/administration.store.svelte';
  import { AdministrationEntity, type StatusInDHT } from '@/types/holochain';
  import type { Revision, UIUser } from '@/types/ui';
  import type { UIOrganization } from '@/types/ui';
  import { decodeRecords, queueAndReverseModal } from '@/utils';
  import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
  import type { ConfirmModalMeta, PromptModalMeta } from './types';
  import PromptModal from './dialogs/PromptModal.svelte';
  import ConfirmModal from './dialogs/ConfirmModal.svelte';
  import StatusHistoryModal from './modals/StatusHistoryModal.svelte';
  import { onMount } from 'svelte';
  import usersStore from '@/stores/users.store.svelte';

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

  onMount(async () => {
    if (entity?.original_action_hash) {
      const userStatusRecord = await administrationStore.getLatestStatusForEntity(
        entity.original_action_hash,
        AdministrationEntity.Users
      );
      userStatus = decodeRecords([userStatusRecord!])[0];
    }
  });

  $effect(() => {
    if (userStatus?.suspended_until) {
      suspensionDate = new Date(userStatus.suspended_until).toLocaleString();
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

          usersStore.getAllUsers().then(() => {
            modalStore.close();
          });
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
    if (!entity?.original_action_hash) return;

    const revisions = await administrationStore.getAllStatusesForEntity(
      entity.original_action_hash
    );

    queueAndReverseModal(statusHistoryModal(revisions), modalStore);
  }

  async function updateStatus(status: StatusInDHT) {
    if (!entity?.original_action_hash || !entity.previous_action_hash) return;

    const latestStatusRecord = await administrationStore.getLatestStatusForEntity(
      entity.original_action_hash,
      entityType
    );
    if (!latestStatusRecord) return;

    await administrationStore.updateUserStatus(
      entity.original_action_hash,
      entity.previous_action_hash,
      latestStatusRecord.signed_action.hashed.hash,
      status
    );

    if (entityType === AdministrationEntity.Users) await administrationStore.refreshUsers();
    else await administrationStore.refreshOrganizations();

    modalStore.close();
  }

  async function handleSuspendIndefinitely(data: FormData) {
    if (!entity?.original_action_hash || !entity.previous_action_hash) return;

    const reason = data.get('reason');
    if (!reason || typeof reason !== 'string') return;

    const latestStatus = await administrationStore.getLatestStatusForEntity(
      entity.original_action_hash,
      AdministrationEntity.Users
    );
    if (!latestStatus) return;

    await administrationStore.suspendUserIndefinitely(
      entity.original_action_hash,
      entity.previous_action_hash,
      latestStatus.signed_action.hashed.hash,
      reason
    );

    if (entityType === AdministrationEntity.Users) await administrationStore.refreshUsers();
    else await administrationStore.refreshOrganizations();

    modalStore.close();
  }

  async function handleSuspendTemporarily(data: FormData) {
    if (!entity?.original_action_hash || !entity.previous_action_hash) return;

    const duration = data.get('duration');
    const reason = data.get('reason');

    if (!duration || !reason || typeof reason !== 'string') return;

    const suspendedDays = Number(duration);
    if (isNaN(suspendedDays)) return;

    const latestStatus = await administrationStore.getLatestStatusForEntity(
      entity.original_action_hash,
      AdministrationEntity.Users
    );
    if (!latestStatus) return;

    await administrationStore.suspendUserTemporarily(
      entity.original_action_hash,
      entity.previous_action_hash,
      latestStatus.signed_action.hashed.hash,
      reason,
      suspendedDays
    );

    if (entityType === AdministrationEntity.Users) await administrationStore.refreshUsers();
    else await administrationStore.refreshOrganizations();

    if (userStatus?.suspended_until) {
      suspensionDate = new Date(userStatus.suspended_until).toLocaleString();
    }
    modalStore.close();
  }

  async function removeAdministrator() {
    if (!entity?.original_action_hash) return;
    await administrationStore.removeNetworkAdministrator(entity.original_action_hash);
    await administrationStore.getAllNetworkAdministrators();
  }
</script>

<div class="flex flex-wrap items-center justify-center gap-4">
  {#if $page.url.pathname === '/admin/users'}
    <button class="btn variant-filled-tertiary rounded-lg" onclick={handleStatusHistoryModal}>
      Status History
    </button>

    {#if userStatus?.status_type === 'accepted'}
      <button
        class="btn variant-filled-warning rounded-lg"
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
    {/if}

    {#if userStatus?.status_type === 'suspended indefinitely' || userStatus?.status_type === 'suspended temporarily'}
      <button class="btn variant-filled-success rounded-lg" onclick={handleUnsuspendModal}>
        Unsuspend
      </button>
    {/if}

    {#if userStatus?.status_type === 'suspended temporarily'}
      <p>Suspended until {suspensionDate}</p>
    {/if}

    {#if userStatus?.status_type === 'pending'}
      <button class="btn variant-filled-success rounded-lg" onclick={handleAcceptModal}>
        Accept
      </button>

      <button class="btn variant-filled-error rounded-lg" onclick={handleRejectModal}>Reject</button
      >
    {/if}

    {#if administrators.some((admin) => admin.original_action_hash === entity.original_action_hash)}
      <button
        class="btn variant-filled-error rounded-lg"
        onclick={handleRemoveAdminModal}
        disabled={isTheOnlyAdmin}
      >
        Remove Administrator
      </button>
    {/if}
  {/if}
</div>
