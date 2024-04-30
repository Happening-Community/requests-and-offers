<script lang="ts">
  import { getDrawerStore } from '@skeletonlabs/skeleton';

  export let href: string,
    bgColor: string = 'variant-filled-secondary';

  const drawerStore = getDrawerStore();

  function closeDrawer() {
    drawerStore.close();
  }
</script>

<a {href} class="btn {bgColor} rounded-lg" on:click={closeDrawer}>
  <slot />
</a>
