<script lang="ts">
  import type { StatusHistoryItem } from '@stores/administrators.svelte';
  import { onMount } from 'svelte';

  type Props = {
    statusHistory: StatusHistoryItem[];
  };

  const { statusHistory }: Props = $props();

  let allStatusColors: string[] = $state([]);

  onMount(async () => {
    allStatusColors = statusHistory.map((status) => {
      switch (status.status.status_type) {
        case 'pending':
          return 'primary-400';
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

  function formatDurationInDays(duration: number): string {
    const totalDays = duration / 1000 / 60 / 60 / 24;

    const roundedDays = Math.ceil(totalDays);

    return `${roundedDays}d`;
  }
</script>

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
    {#each statusHistory as statusHistoryItem, i}
      <tr class="text-{allStatusColors[i]}">
        <td>{new Date(statusHistoryItem.timestamp).toLocaleString()}</td>
        <td>{statusHistoryItem.user.name}</td>
        <td>{statusHistoryItem.status.status_type}</td>
        <td>{statusHistoryItem.status.reason || 'N/A'}</td>
        <td>
          {#if statusHistoryItem.status.duration}
            {formatDurationInDays(statusHistoryItem.status.duration)}
          {:else}
            N/A
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
