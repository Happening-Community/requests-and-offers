<script lang="ts">
	import Navbar from '$lib/NavBar.svelte';
	import '../app.postcss';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<Navbar />

<section class="container h-screen mt-[-8rem] mx-auto flex justify-center items-center flex-col">
	<slot />
</section>
