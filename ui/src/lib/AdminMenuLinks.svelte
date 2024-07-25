<script>
  import MenuLink from './MenuLink.svelte';
</script>

<div class="flex flex-col gap-3">
  <MenuLink
    href="/admin/administrators"
    className="variant-filled-secondary sm:variant-filled-primary"
  >
    Administrators
  </MenuLink>
  <MenuLink href="/admin/persons" className="variant-filled-secondary sm:variant-filled-primary">
    Persons
  </MenuLink>
</div>

<div class="flex flex-col gap-3">
  <MenuLink
    href="/admin/organizations"
    className="variant-filled-secondary sm:variant-filled-primary"
  >
    Organizations
  </MenuLink>
  <MenuLink href="/admin/projects" className="variant-filled-secondary sm:variant-filled-primary">
    Projects
  </MenuLink>
</div>

<div class="flex flex-col gap-3">
  <MenuLink href="/admin/requests" className="variant-filled-secondary sm:variant-filled-primary">
    Requests
  </MenuLink>
  <MenuLink href="/admin/offers" className="variant-filled-secondary sm:variant-filled-primary">
    Offers
  </MenuLink>
</div>

<div class="flex flex-col gap-3 sm:hidden">
  <MenuLink href="/" className="variant-ringed-secondary text-white hover:variant-filled-secondary">
    User front-end
  </MenuLink>
</div>
