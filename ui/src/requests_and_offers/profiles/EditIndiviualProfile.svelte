<script lang="ts">
import { createEventDispatcher, getContext, onMount } from 'svelte';
import type { AppAgentClient, Record, EntryHash, AgentPubKey, DnaHash, ActionHash } from '@holochain/client';
import { decode } from '@msgpack/msgpack';
import { clientContext } from '../../contexts';
import type { IndiviualProfile } from './types';
import '@material/mwc-button';
import '@material/mwc-snackbar';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-textfield';
import '@material/mwc-textarea';

let client: AppAgentClient = (getContext(clientContext) as any).getClient();

const dispatch = createEventDispatcher();

export let originalIndiviualProfileHash!: ActionHash;

export let currentRecord!: Record;
let currentIndiviualProfile: IndiviualProfile = decode((currentRecord.entry as any).Present.entry) as IndiviualProfile;

let name: string | undefined = currentIndiviualProfile.name;
let nickname: string | undefined = currentIndiviualProfile.nickname;
let bio: string | undefined = currentIndiviualProfile.bio;

let errorSnackbar: Snackbar;

$: name, nickname, bio;
$: isIndiviualProfileValid = true && name !== '' && nickname !== '' && bio !== '';

onMount(() => {
  if (currentRecord === undefined) {
    throw new Error(`The currentRecord input is required for the EditIndiviualProfile element`);
  }
  if (originalIndiviualProfileHash === undefined) {
    throw new Error(`The originalIndiviualProfileHash input is required for the EditIndiviualProfile element`);
  }
});

async function updateIndiviualProfile() {

  const indiviualProfile: IndiviualProfile = {
    name: name!,
    nickname: nickname!,
    bio: bio!,
  };

  try {
    const updateRecord: Record = await client.callZome({
      cap_secret: null,
      role_name: 'requests_and_offers',
      zome_name: 'profiles',
      fn_name: 'update_indiviual_profile',
      payload: {
        original_indiviual_profile_hash: originalIndiviualProfileHash,
        previous_indiviual_profile_hash: currentRecord.signed_action.hashed.hash,
        updated_indiviual_profile: indiviualProfile
      }
    });

    dispatch('indiviual-profile-updated', { actionHash: updateRecord.signed_action.hashed.hash });
  } catch (e) {
    errorSnackbar.labelText = `Error updating the indiviual profile: ${e.data.data}`;
    errorSnackbar.show();
  }
}

</script>
<mwc-snackbar bind:this={errorSnackbar} leading>
</mwc-snackbar>
<div style="display: flex; flex-direction: column">
  <span style="font-size: 18px">Edit IndiviualProfile</span>

  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Name" value={ name } on:input={e => { name = e.target.value;} } required></mwc-textarea>
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textarea outlined label="Nickname" value={ nickname } on:input={e => { nickname = e.target.value;} } required></mwc-textarea>
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textfield outlined label="Bio" value={ bio } on:input={e => { bio = e.target.value; } } required></mwc-textfield>
  </div>


  <div style="display: flex; flex-direction: row">
    <mwc-button
      outlined
      label="Cancel"
      on:click={() => dispatch('edit-canceled')}
      style="flex: 1; margin-right: 16px"
    ></mwc-button>
    <mwc-button
      raised
      label="Save"
      disabled={!isIndiviualProfileValid}
      on:click={() => updateIndiviualProfile()}
      style="flex: 1;"
    ></mwc-button>
  </div>
</div>
