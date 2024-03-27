# Profile Zome Demo: A Comprehensive Guide

Welcome to the Profile Zome Demo! This document provides a detailed walkthrough of the `profiles` zome, showcasing how agents interact within the Holochain network and how profiles are created, viewed, and edited.

## Introduction to the Holochain Playground

The Holochain Playground is a powerful tool for visualizing agents and their interactions within the network. Each entry in the Distributed Hash Table (DHT) is accompanied by a header, which can be of type `Create`, `Update`, or `Delete`. In our demo, we'll explore the interactions of two agents within the network.

![Holochain Playground](images/hc-playground-1.png)

### Agent Initialization

When an agent is initialized, it creates an `Agent` entry in its source chain and on the DHT. This entry represents the Agent's Public Key.

![Agent Initialization source chain](images/agent-initialization.png)

It's an entry that represents the Agent Public Key.

![Agent Entry content](images/agent-entry-content.png)

## Creating a Profile: Step-by-Step Guide

### 1. Home Page Overview

The app home page will search in the source chain for any profiles. If there are no profiles, the app will suggest to create one.

![hApp home](images/happ-home.png)

### 2. Profile Creation Form

The create profile form display all the fields to create a profile. The required ones are `name`, `nickname`, `user_type`, and `email`.

![Create profile form 1](images/create-profile-1.png)

![Create profile form 2](images/create-profile-2.png)

### 3. Profile Picture Upload

When a profile picture is uploaded, the app will display its file name, thumbnail, and propose to remove it.

![Profile picture thumbnail](images/profile-picture-thumbnail.png)

### 4. Profile Type Selection

The profile type must be one of `developer` or `advocate`. I added `creator` as a suggestion because maybe it could be needed for users that don't want to create offers. (Like project managers or recruiters)

![Types of profile](images/types-of-profile.png)

### 5. Viewing Profiles

Once the profile is created, the user is redirected to the profile page. The app will display all the profile fields.

![My profile 1](images/my-profile-1.png)

![My profile 2](images/my-profile-2.png)

In the Holochain Playground, we can see that a new entry is added and linked to the agent.

`Zome:0,EntryId:0` is the representation of the profile entry.

![HC playground with created profile](images/hc-playground-2.png)

### 6. All Profiles Page

In the all profiles page, the app will display all the profiles.

![All profiles](images/all-profiles-1.png)

### 7. Viewing Individual Profiles

When the user clicks on the View button, the app will display the profile in a modal.

![All profiles view profile modal](images/all-profiles-view-profile-modal-1.png)

### 8. Creating a Profile for the Second Agent

Let's create a profile for the second agent. Now we have 2 profiles in the All profiles page.

![All profiles with 2 profiles](images/all-profiles-2.png)

![All profiles view profile modal 2](images/all-profiles-view-profile-modal-2.png)

### 9. Holochain Playground with 2 Created Profiles

In the holochain playground, we can see that a new entry is added and linked to the second agent.

The `unknown` node is the `All_profiles` anchor that is an index of all the profiles.

![HC playground with 2 created profile](images/hc-playground-3.png)

## Editing a Profile: A Guide

### 1. Accessing the Edit Profile Form

On the `My profile` page, there's an `Edit profile` button. It redirects to the edit profile form.

The form is already filled with the profile information.

![Edit profile](images/edit-profile.png)

### 2. Making Changes

For example, let remove the profile picture. It will be replaced by the default one.

![Edited profile view](images/edited-profile-view.png)

### 3. Understanding Updates in the Holochain Playground

In the Holochain playground, we can see that the entry is updated.

The update header point to the `Create` header of the updated profile entry. Each `Update` header has a reference to the previous entry (`Create` or `Update` dependently if its the first update) AND to the original `Create` header.

![HC playground with updated profile](images/hc-playground-4.png)

### 4. Reverting Changes

Let's try to update again the first agent profile and give him back its original profile picture. Now its profile is the same as the original.

Because the DHT is content addressable, the new update will be linked to the previous profile entry, because it already exists. It's particularly useful for avoiding useless duplicates.

The new `Update` header point to the `Create` header of the original profile entry and to the `Update` header of the previous profile. It creates an Update chain that is an tamperproof history of the updates.

![HC playground with updated profile to the previous state](images/hc-playground-5.png)

### 5. Final Update

For the end, we can update the profile of the second agent and see how the playground changes.

![HC playground with second agent updated profile](images/hc-playground-6.png)

## Conclusion

This demo has provided a comprehensive overview of the `profiles` zome, including agent initialization, profile creation, and editing. By following these steps, you've gained insight into how profiles are managed within the Holochain network.