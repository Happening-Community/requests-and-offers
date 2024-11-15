<script lang="ts">
  import { page } from '$app/stores';
  import { Avatar, getModalStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
  import ActionBar from '../ActionBar.svelte';
  import type { Organization } from '@/stores/organizations.svelte';
  import administrationStore, {
    AdministrationEntity,
    type Status
  } from '@/stores/administrators.svelte';

  const modalStore = getModalStore();
  const organization: Organization = $modalStore[0].meta.organization;

  let organizationPictureUrl = $state('');
  let suspensionDate = $state('');
  let organizationStatus: Status | null = $state(null);

  onMount(async () => {
    console.log('organization', organization);

    organizationPictureUrl = organization?.logo
      ? URL.createObjectURL(new Blob([new Uint8Array(organization.logo)]))
      : '/default_avatar.webp';
    organizationStatus = await administrationStore.getLatestStatusForEntity(
      organization.original_action_hash!,
      AdministrationEntity.Organizations
    );
  });
</script>

<article class="hcron-modal">
  {#if organization}
    {#if $page.url.pathname.startsWith('/admin')}
      <div class="mb-10">
        <ActionBar entity={organization} />
      </div>
    {/if}

    <h2 class="h2 font-bold">{organization.name}</h2>
    <h3 class="h3">{organization.description}</h3>
    {#if $page.url.pathname.startsWith('/admin')}
      <p>
        <b>Status :</b>
        {#if !suspensionDate}
          {organizationStatus?.status_type}
        {:else}
          suspended until <br /> {suspensionDate}
        {/if}
      </p>
      {#if organizationStatus?.status_type.startsWith('suspended')}
        <p><b>Reason :</b> {organizationStatus?.reason}</p>
      {/if}
    {/if}
    <div onload={() => URL.revokeObjectURL(organizationPictureUrl)}>
      <Avatar src={organizationPictureUrl} width="w-64" background="none" />
    </div>
    <p><b>Email :</b> {organization.email}</p>
    <ul>
      {#each organization.urls as url}
        <li><a href={url}>{url}</a></li>
      {/each}
    </ul>
    {#if organization.location}
      <p><b>Location :</b> {organization.location}</p>
    {/if}
  {/if}
  <button class="btn variant-filled-secondary mt-4 w-fit" onclick={() => modalStore.close()}>
    Close
  </button>
</article>
