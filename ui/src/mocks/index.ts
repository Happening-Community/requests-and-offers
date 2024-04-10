import type { Organization } from '@stores/organizations.store';
import type { Profile } from '@stores/profiles.store';
import { Sex, faker } from '@faker-js/faker';

export const mockedProfiles = (count: number = 1): Profile[] => {
  let profiles: Profile[] = [];

  for (let i = 0; i < count; i++) {
    profiles.push({
      name: faker.person.fullName({ sex: 'female' }),
      nickname: faker.person.firstName('female'),
      bio: faker.lorem.paragraphs(2),
      profile_picture: undefined,
      user_type: 'developer',
      skills: ['JavaScript', 'Svelte', 'SvelteKit'],
      email: faker.internet.email(),
      phone: '123456789',
      time_zone: 'Europe/Paris',
      location: 'Paris, France',
      status: undefined
    });
  }

  return profiles;
};

export const mockedOrganizations = (count: number = 1): Organization[] => {
  let organizations: Organization[] = [];

  for (let i = 0; i < count; i++) {
    organizations.push({
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      organization_picture: undefined,
      status: undefined,
      members: [],
      admins: [],
      projects: []
    });
  }

  return organizations;
};
