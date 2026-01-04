export enum Category {
  ALL = 'All',
  CAD = 'CAD',
  ELECTRICAL = 'Electrical',
  SOFTWARE = 'Software',
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: Category[];
  thumbnailUrl: string;
  galleryUrls: string[];
  date: string;
  tools: string[];
  specs: string[];
}
