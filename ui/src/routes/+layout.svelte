<script lang="ts">
	import Navbar from '$lib/NavBar.svelte';
	import { onMount, setContext } from 'svelte';
	import { AppAgentWebsocket, type ActionHash, type AppAgentClient } from '@holochain/client';
	import '../app.postcss';
	import { clientContext } from '../contexts';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<Navbar />

<main class="container min-h-screen mx-auto flex justify-center items-center flex-col pt-40 pb-10">
	<!-- {#if loading} -->
	<!-- <p>Loading...</p> -->
	<!-- {:else} -->
	<slot />
	<!-- {/if} -->
</main>
