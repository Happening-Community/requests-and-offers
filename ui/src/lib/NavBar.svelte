<script lang="ts">
  import Bars from './svg/bars.svelte';
  import { getDrawerStore, type DrawerSettings } from '@skeletonlabs/skeleton';
  import MenuLinks from './MenuLinks.svelte';

  const drawerStore = getDrawerStore();
  const drawerSettings: DrawerSettings = {
    id: 'menu-drawer',
    width: 'w-1/2 sm:w-1/3',
    bgDrawer: 'bg-primary-500'
  };

  function openDrawer() {
    drawerStore.open(drawerSettings);
  }
</script>

<nav class="bg-primary-500 absolute flex h-32 w-full items-center justify-between gap-4 p-4">
  <a href="/" class="w-1/3">
    <img src="/hAppeningsLogoWsun2.webp" alt="" class="w-28" />
  </a>

  <a class="h2 text-center text-white" href="/">Requests and Offers hApp</a>

  <div class="flex w-1/3 justify-end gap-4">
    <button class="btn variant-filled-secondary lg:hidden" on:click={openDrawer}>
      <Bars svgClass="fill-white h-6 w-6" />
    </button>
  </div>

  <div class="hidden w-1/3 flex-col justify-end gap-4 sm:flex-row lg:flex">
    <MenuLinks />
  </div>
</nav>
