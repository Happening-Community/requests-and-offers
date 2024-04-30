<script>
  import MenuLink from './MenuLink.svelte';
</script>

<div class="flex flex-col gap-3">
  <MenuLink href="/admin/administrators" className="variant-filled-primary">Administrators</MenuLink
  >
  <MenuLink href="/admin/persons" className="variant-filled-primary">Persons</MenuLink>
</div>

<div class="flex flex-col gap-3">
  <MenuLink href="/admin/organizations" className="variant-filled-primary">Organizations</MenuLink>
  <MenuLink href="/admin/projects" className="variant-filled-primary">Projects</MenuLink>
</div>

<div class="flex flex-col gap-3">
  <MenuLink href="/admin/requests" className="variant-filled-primary">Requests</MenuLink>
  <MenuLink href="/admin/offers" className="variant-filled-primary">Offers</MenuLink>
</div>
