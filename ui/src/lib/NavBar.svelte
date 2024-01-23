<script lang="ts">
  import Bars from '$lib/assets/svg/bars.svelte';
</script>

<nav class="bg-primary-500 flex p-4 justify-between items-center h-32 absolute w-full">
  <a href="/"><img src="/hAppeningsLogoWsun2.webp" alt="" class="h-28" /></a>

  <h1 class="h1 text-white text-center">Requests and Offerts <br />hApp</h1>

  <button type="button" class="btn variant-filled-secondary p-4 group">
    <Bars svgClass={`fill-[#4720b7] group-hover:fill-white`} />
  </button>
</nav>
