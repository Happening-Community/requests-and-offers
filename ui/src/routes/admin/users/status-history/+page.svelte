<script lang="ts">
  import administratorsStore from '@stores/administrators.svelte';
  import { onMount } from 'svelte';

  let allStatusColors: string[] = $state([]);

  onMount(async () => {
    await administratorsStore.getAllRevisionsForAllUsers();
    console.log(administratorsStore.allStatusHistory);

    allStatusColors = administratorsStore.allStatusHistory.map((status) => {
      switch (status.status.status_type) {
        case 'pending':
          return 'primary-300';
        case 'rejected':
        case 'suspended indefinitely':
          return 'error-500';
        case 'accepted':
          return 'green-400';
        case 'suspended temporarily':
          return 'warning-500';
      }
    });
  });

  function formatDuration(duration: number): string {
    console.log(duration);

    const days = Math.floor(duration / 1000 / 60 / 60 / 24);
    const hours = Math.floor((duration / 1000 / 60 / 60) % 24);

    return `${days}d ${hours}h`;
  }
</script>

<section class="space-y-10">
  <h1 class="h1 text-center">Status History</h1>

  <table class="table-hover table">
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>User</th>
        <th>Status</th>
        <th>Reason</th>
        <th>Duration</th>
      </tr>
    </thead>

    <tbody>
      {#each administratorsStore.allStatusHistory as statusHistoryItem, i}
        <tr class="text-{allStatusColors[i]}">
          <td>{new Date(statusHistoryItem.timestamp).toLocaleString()}</td>
          <td>{statusHistoryItem.user.name}</td>
          <td>{statusHistoryItem.status.status_type}</td>
          <td>{statusHistoryItem.status.reason || 'N/A'}</td>
          <td
            >{statusHistoryItem.status.duration
              ? formatDuration(statusHistoryItem.status.duration)
              : 'N/A'}</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</section>
