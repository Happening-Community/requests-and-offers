<script lang="ts">
  import type { Revision } from '@stores/administrators.svelte';
  import { onMount } from 'svelte';

  type Props = {
    statusHistory: Revision[];
  };

  const { statusHistory }: Props = $props();

  let allStatusColors: string[] = $state([]);

  onMount(async () => {
    console.log('statusHistory', statusHistory);

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

<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
  <table
    class="table-hover w-full text-center text-sm drop-shadow-lg sm:table md:text-left md:text-inherit"
  >
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
      {#each statusHistory as Revision, i}
        <tr class="text-{allStatusColors[i]}">
          <td>{new Date(Revision.timestamp).toLocaleString()}</td>
          <td>{Revision.user.name}</td>
          <td>{Revision.status.status_type}</td>
          <td>{Revision.status.reason || 'N/A'}</td>
          <td>
            {#if Revision.status.duration}
              {formatDurationInDays(Revision.status.duration)}
            {:else}
              N/A
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
