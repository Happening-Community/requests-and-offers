<script lang="ts">
  import type { Revision } from '@/types/ui';
  import { use } from 'chai';

  type Props = {
    username: string;
    statusHistory: Revision[];
  };

  const { username, statusHistory }: Props = $props();

  let allStatusesColors: string[] = $state([]);

  $effect(() => {
    console.log('statusHistory', statusHistory);

    allStatusesColors = (statusHistory || []).map((status) => {
      switch (status?.status?.status_type) {
        case 'pending':
          return 'primary-400';
        case 'rejected':
        case 'suspended indefinitely':
          return 'error-500';
        case 'accepted':
          return 'green-400';
        case 'suspended temporarily':
          return 'warning-500';
        default:
          return 'surface-400';
      }
    });

    return () => {
      allStatusesColors = [];
    };
  });

  function formatDurationInDays(duration: number): string {
    if (!duration) return 'N/A';
    const totalDays = duration / 1000 / 60 / 60 / 24;
    const roundedDays = Math.ceil(totalDays);
    return `${roundedDays}d`;
  }
</script>

<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
  <table
    class="!bg-surface-700 table-hover w-full text-center text-sm drop-shadow-lg sm:table md:text-left md:text-inherit"
  >
    <thead class="!bg-surface-800 dark:!bg-surface-700">
      <tr>
        <th class="px-2">Timestamp</th>
        <th class="px-2">User</th>
        <th class="px-2">Status</th>
        <th class="px-2">Reason</th>
        <th class="px-2">Duration</th>
      </tr>
    </thead>

    <tbody>
      {#each statusHistory || [] as revision, i}
        <tr class="text-{allStatusesColors[i] || 'surface-400'}">
          <td>{revision?.timestamp ? new Date(revision.timestamp).toLocaleString() : 'N/A'}</td>
          <td>{username || 'N/A'}</td>
          <td>{revision?.status?.status_type || 'N/A'}</td>
          <td>{revision?.status?.reason || 'N/A'}</td>
          <td>
            {#if revision?.status?.duration}
              {formatDurationInDays(revision.status.duration)}
            {:else}
              N/A
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
