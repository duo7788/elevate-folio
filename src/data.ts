import { Project, Profile } from './types';
import content from '../content.json';

export const MOCK_PROFILE: Profile = {
  ...content.profile,
  name: content.profile.name || "余子涵",
};

export const MOCK_PROJECTS: Project[] = content.projects as Project[];
