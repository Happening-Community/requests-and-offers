<script lang="ts">
  import { getMyProfile, myProfile } from '@stores/profiles.store';
  import { Avatar } from '@skeletonlabs/skeleton';
  import NavButton from '@lib/NavButton.svelte';
  import { onMount } from 'svelte';

  $: profilePictureUrl = $myProfile?.picture
    ? URL.createObjectURL(new Blob([new Uint8Array($myProfile.picture)]))
    : '/default_avatar.webp';

  onMount(async () => {
    await getMyProfile();
  });
</script>

<section class="flex flex-col items-center">
  {#if !$myProfile}
    <p class="mb-4 text-center text-xl">It looks like you don't have a profile yet !</p>
    <NavButton href="/profile/create" text="Create profile" />
  {:else}
    <div class="mb-10 flex flex-col items-center gap-5">
      <h2 class="h2">
        Welcome <span class="text-primary-500 font-bold">{$myProfile.name}</span> !
      </h2>
      <a href="/profile/edit" class="btn variant-filled-primary w-fit text-white">Edit profile</a>
    </div>
    <div
      class="border-surface-600 bg-surface-400 flex w-4/5 min-w-96 flex-col items-center gap-5 rounded-xl border-8 p-5 drop-shadow-xl"
    >
      <h3 class="h3"><b>Nickname :</b> {$myProfile.nickname}</h3>
      <h3 class="h3">
        <b>Status :</b>
        <span
          class:text-primary-500={$myProfile.status === 'pending'}
          class:text-error-500={$myProfile.status === 'rejected'}
          class:text-green-500={$myProfile.status === 'accepted'}
        >
          {$myProfile.status}
        </span>
      </h3>
      <div on:load={() => URL.revokeObjectURL(profilePictureUrl)}>
        <Avatar src={profilePictureUrl} width="w-64" background="none" />
      </div>
      <p class="text-center">{$myProfile.bio}</p>
      <p><b>Type :</b> {$myProfile.user_type}</p>
      {#if $myProfile.skills?.length}
        <p><b>Skills :</b> {$myProfile.skills?.join(', ')}</p>
      {/if}
      <p><b>Email :</b> {$myProfile.email}</p>
      {#if $myProfile.phone}
        <p><b>Phone number :</b> {$myProfile.phone}</p>
      {/if}
      {#if $myProfile.time_zone}
        <p><b>Timezone :</b> {$myProfile.time_zone}</p>
      {/if}
      {#if $myProfile.location}
        <p><b>Location :</b> {$myProfile.location}</p>
      {/if}
    </div>
  {/if}
</section>
