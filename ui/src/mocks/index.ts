import type { Organization } from '@stores/organizations.store';
import type { Profile } from '@stores/profiles.store';
import { Sex, faker } from '@faker-js/faker';
import { fetchImageAndConvertToUInt8Array } from '@utils';
import type { Project } from '@stores/projects.store';

export async function createMockedProfiles(count: number = 1): Promise<Profile[]> {
  let profiles: Profile[] = [];

  for (let i = 0; i < count; i++) {
    profiles.push({
      name: faker.person.fullName({ sex: 'female' }),
      nickname: faker.person.firstName('female'),
      bio: faker.lorem.paragraphs(2),
      picture: await fetchImageAndConvertToUInt8Array('https://picsum.photos/200/300'),
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
}

export async function createMockedOrganizations(count: number = 1): Promise<Organization[]> {
  let organizations: Organization[] = [];

  for (let i = 0; i < count; i++) {
    organizations.push({
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      picture: await fetchImageAndConvertToUInt8Array('https://picsum.photos/200/300'),
      status: undefined,
      members: [],
      admins: [],
      projects: []
    });
  }

  return organizations;
}

export async function createMockedProjects(count: number = 1): Promise<Project[]> {
  let projects: Project[] = [];

  for (let i = 0; i < count; i++) {
    projects.push({
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      picture: await fetchImageAndConvertToUInt8Array('https://picsum.photos/200/300'),
      status: undefined,
      team_members: [],
      admins: []
    });
  }

  return projects;
}
