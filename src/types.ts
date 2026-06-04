export interface Project {
  id: string;
  title: string;
  summary: string;
  details: string;
  imageUrl: string;
  imageFileName?: string;
  projectUrl: string;
  story?: string;
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  avatarUrl: string;
  avatarFileName?: string;
  resumeUrl: string;
  resumeFileName?: string;
}
