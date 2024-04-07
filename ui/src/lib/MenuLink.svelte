<script lang="ts">
  import { getDrawerStore } from '@skeletonlabs/skeleton';

  export let href: string;

  const drawerStore = getDrawerStore();

  function closeDrawer() {
    drawerStore.close();
  }
</script>

<a {href} class="btn variant-filled-secondary rounded-lg" on:click={closeDrawer}>
  <slot />
</a>
