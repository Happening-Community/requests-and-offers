<script lang="ts">
  import Navbar from '$lib/NavBar.svelte';
  import '../app.postcss';
</script>

<Navbar />

<main
  class="container mx-auto flex min-h-screen flex-col items-center justify-center px-5 pb-10 pt-40"
>
  <slot />
</main>
