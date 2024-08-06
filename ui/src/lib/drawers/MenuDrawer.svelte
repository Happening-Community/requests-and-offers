<script>
  import MenuLinks from '@lib/MenuLinks.svelte';
  import { getDrawerStore } from '@skeletonlabs/skeleton';

  const drawerStore = getDrawerStore();
</script>

<div class="h-10 space-y-5 p-2 md:p-5">
  <div class="flex justify-center">
    <a href="/" onclick={() => drawerStore.close()}>
      <img src="/hAppeningsLogoWsun2.webp" alt="" class="w-28" />
    </a>
  </div>
  <MenuLinks />
</div>
