import type { Organization } from '@stores/organizations.svelte';
import type { UserType, Profile } from '@stores/profiles.store';
import { SimpleFaker, faker } from '@faker-js/faker';
import { fetchImageAndConvertToUInt8Array, getRandomNumber } from '@utils';
import type { Project } from '@stores/projects.store';

export async function createMockedProfiles(count: number = 1): Promise<Profile[]> {
  let profiles: Profile[] = [];

  const fakedUserType = new SimpleFaker().helpers.arrayElements<UserType>(
    ['creator', 'advocate'],
    1
  )[0] as UserType;

  for (let i = 0; i < count; i++) {
    profiles.push({
      name: faker.person.fullName({ sex: 'female' }),
      nickname: faker.person.firstName('female'),
      bio: faker.lorem.paragraphs(getRandomNumber(2, 5)),
      picture: await fetchImageAndConvertToUInt8Array('https://picsum.photos/200/300'),
      user_type: fakedUserType,
      skills: ['JavaScript', 'Svelte', 'SvelteKit', 'Rust', 'WebAssembly'],
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
      status: 'pending',
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
      status: 'pending',
      team_members: [],
      admins: []
    });
  }

  return projects;
}
