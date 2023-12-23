<script lang="ts">
  import { createEventDispatcher, getContext, onMount } from "svelte";
  import type {
    AppAgentClient,
    Record,
    EntryHash,
    AgentPubKey,
    DnaHash,
    ActionHash,
  } from "@holochain/client";
  import { decode } from "@msgpack/msgpack";
  import { clientContext } from "../../contexts";
  import type { IndividualProfile } from "./types";
  import "@material/mwc-button";
  import "@material/mwc-snackbar";
  import type { Snackbar } from "@material/mwc-snackbar";
  import "@material/mwc-textfield";
  import "@material/mwc-textarea";

  let client: AppAgentClient = (getContext(clientContext) as any).getClient();

  const dispatch = createEventDispatcher();

  export let originalIndividualProfileHash!: ActionHash;

  export let currentRecord!: Record;
  let currentIndividualProfile: IndividualProfile = decode(
    (currentRecord.entry as any).Present.entry
  ) as IndividualProfile;

  let name: string | undefined = currentIndividualProfile.name;
  let nickname: string | undefined = currentIndividualProfile.nickname;
  let bio: string | undefined = currentIndividualProfile.bio;

  let errorSnackbar: Snackbar;

  $: name, nickname, bio;
  $: isIndividualProfileValid =
    true && name !== "" && nickname !== "" && bio !== "";

  onMount(() => {
    if (currentRecord === undefined) {
      throw new Error(
        `The currentRecord input is required for the EditIndividualProfile element`
      );
    }
    if (originalIndividualProfileHash === undefined) {
      throw new Error(
        `The originalIndividualProfileHash input is required for the EditIndividualProfile element`
      );
    }
  });

  async function updateIndividualProfile() {
    const IndividualProfile: IndividualProfile = {
      name: name!,
      nickname: nickname!,
      bio: bio!,
    };

    try {
      const updateRecord: Record = await client.callZome({
        cap_secret: null,
        role_name: "requests_and_offers",
        zome_name: "profiles",
        fn_name: "update_individual_profile",
        payload: {
          original_individual_profile_hash: originalIndividualProfileHash,
          previous_individual_profile_hash:
            currentRecord.signed_action.hashed.hash,
          updated_individual_profile: IndividualProfile,
        },
      });

      dispatch("indiviual-profile-updated", {
        actionHash: updateRecord.signed_action.hashed.hash,
      });
    } catch (e) {
      errorSnackbar.labelText = `Error updating the indiviual profile: ${e.data.data}`;
      errorSnackbar.show();
    }
  }
</script>

<mwc-snackbar bind:this={errorSnackbar} leading> </mwc-snackbar>
<div style="display: flex; flex-direction: column">
  <span style="font-size: 18px">Edit IndividualProfile</span>

  <div style="margin-bottom: 16px">
    <mwc-textarea
      outlined
      label="Name"
      value={name}
      on:input={(e) => {
        name = e.target.value;
      }}
      required
    ></mwc-textarea>
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textarea
      outlined
      label="Nickname"
      value={nickname}
      on:input={(e) => {
        nickname = e.target.value;
      }}
      required
    ></mwc-textarea>
  </div>

  <div style="margin-bottom: 16px">
    <mwc-textfield
      outlined
      label="Bio"
      value={bio}
      on:input={(e) => {
        bio = e.target.value;
      }}
      required
    ></mwc-textfield>
  </div>

  <div style="display: flex; flex-direction: row">
    <mwc-button
      outlined
      label="Cancel"
      on:click={() => dispatch("edit-canceled")}
      style="flex: 1; margin-right: 16px"
    ></mwc-button>
    <mwc-button
      raised
      label="Save"
      disabled={!isIndividualProfileValid}
      on:click={() => updateIndividualProfile()}
      style="flex: 1;"
    ></mwc-button>
  </div>
</div>
