<script lang="ts">
  import administratorsStore from '@stores/administrators.svelte';
  import { onMount } from 'svelte';

  onMount(async () => {
    await administratorsStore.getAllRevisionsForAllUsers();
    console.log(administratorsStore.allStatusHistory);
  });
</script>

<section class="space-y-10">
  <h1 class="h1 text-center">Status History</h1>

  <dl class="list-dl space-y-5">
    {#each administratorsStore.allStatusHistory as statusHistoryItem}
      <div
        class="gap-10"
        class:text-primary-300={statusHistoryItem.status?.status_type === 'pending'}
        class:text-error-500={statusHistoryItem.status?.status_type === 'rejected' ||
          statusHistoryItem.status?.status_type === 'suspended indefinitely'}
        class:text-green-400={statusHistoryItem.status?.status_type === 'accepted'}
        class:text-warning-500={statusHistoryItem.status?.status_type === `suspended temporarily`}
      >
        <span>{new Date(statusHistoryItem.timestamp).toLocaleString()}</span>
        <span
          class="flex-auto space-y-2 rounded-lg border-2 p-3"
          class:border-primary-300={statusHistoryItem.status?.status_type === 'pending'}
          class:border-error-500={statusHistoryItem.status?.status_type === 'rejected' ||
            statusHistoryItem.status?.status_type === 'suspended indefinitely'}
          class:border-green-400={statusHistoryItem.status?.status_type === 'accepted'}
          class:border-warning-500={statusHistoryItem.status?.status_type ===
            `suspended temporarily`}
        >
          <dt class="text-center">{statusHistoryItem.user.name}</dt>
          <dd class="text-center font-bold">{statusHistoryItem.status.status_type}</dd>
          {#if statusHistoryItem.status.reason}
            <dd>reason: {statusHistoryItem.status.reason}</dd>
          {/if}
          {#if statusHistoryItem.status.timestamp}
            <dd>duration: {statusHistoryItem.status.timestamp}</dd>
          {/if}
        </span>
      </div>
    {/each}
  </dl>
</section>
