<script>
  import MenuLink from './MenuLink.svelte';
</script>

<div class="space-y-3">
  <MenuLink href="/admin/administrators" bgColor="variant-filled-primary">Administrators</MenuLink>
  <MenuLink href="/admin/persons" bgColor="variant-filled-primary">Persons</MenuLink>
</div>

<div class="space-y-3">
  <MenuLink href="/admin/organizations" bgColor="variant-filled-primary">Organizations</MenuLink>
  <MenuLink href="/admin/projects" bgColor="variant-filled-primary">Projects</MenuLink>
</div>

<div class="space-y-3">
  <MenuLink href="/admin/requests" bgColor="variant-filled-primary">Requests</MenuLink>
  <MenuLink href="/admin/offers" bgColor="variant-filled-primary">Offers</MenuLink>
</div>
