import type { Organization } from '@stores/organizations.store';
import type { Profile } from '@stores/profiles.store';
import { faker } from '@faker-js/faker';

export const mockedProfile: Profile = {
  name: faker.person.fullName(),
  nickname: faker.person.firstName(),
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  profile_picture: undefined,
  user_type: 'developer',
  skills: ['JavaScript', 'Svelte', 'SvelteKit'],
  email: faker.internet.email(),
  phone: '123456789',
  time_zone: 'Europe/Paris',
  location: 'Paris, France',
  status: 'pending'
};

export const mockedOrganization: Organization = {
  name: faker.company.name(),
  description: faker.company.catchPhrase(),
  organization_picture: undefined,
  status: 'pending',
  members: [],
  admins: [],
  projects: []
};
