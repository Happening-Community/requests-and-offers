<script lang="ts">
  import { getDrawerStore } from '@skeletonlabs/skeleton';

  export let href: string,
    className: string = 'variant-filled-secondary';

  const drawerStore = getDrawerStore();
</script>

<a {href} class="btn {className} rounded-lg" on:click={() => drawerStore.close()}>
  <slot />
</a>
