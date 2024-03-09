<script lang="ts">
  import CreateProfileBtn from '$lib/CreateProfileBtn.svelte';
  import { myProfile } from '@stores/profiles.store';
  import { Avatar } from '@skeletonlabs/skeleton';

  let profilePictureUrl: string;

  profilePictureUrl = $myProfile?.profile_picture
    ? URL.createObjectURL(new Blob([new Uint8Array($myProfile.profile_picture)]))
    : '/default_avatar.webp';
</script>

<section class="flex flex-col items-center">
  {#if !$myProfile}
    <CreateProfileBtn />
  {:else}
    <div class="mb-10 flex flex-col items-center gap-5">
      <h2 class="h2">
        Welcome <span class="text-primary-500 font-bold">{$myProfile.name}</span> !
      </h2>
      <p><a href="/profile/edit" class="text-primary-500 hover:underline">Edit profile</a></p>
    </div>
    <div
      class="border-surface-600 bg-surface-400 flex w-1/2 min-w-96 flex-col items-center gap-5 rounded-xl border-8 p-5 drop-shadow-xl"
    >
      <h3 class="h3"><b>Nickname :</b> {$myProfile.nickname}</h3>
      <div class="p-10 drop-shadow-lg" on:load={() => URL.revokeObjectURL(profilePictureUrl)}>
        <Avatar src={profilePictureUrl} width="200" />
      </div>
      <p class="text-center">{$myProfile.bio}</p>
      <p><b>Type :</b> {$myProfile.individual_type}</p>
      <p><b>Skills :</b> {$myProfile.skills?.join(', ')}</p>
      <p><b>Email :</b> {$myProfile.email}</p>
      <p><b>Phone number :</b> {$myProfile.phone}</p>
      <p><b>Timezone :</b> {$myProfile.time_zone}</p>
      <p><b>Location :</b> {$myProfile.location}</p>
    </div>
  {/if}
</section>
