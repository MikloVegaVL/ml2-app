export type Level = 'basic' | 'hooyah';

export interface Exercise {
  id: string;
  name: string;
  baseName: string;
  variant?: string;
  level?: Level;
  order: number;
  description: string;
  functions: string[];
  hooyah?: string[];
  keyPoints: string[];
  thumbnail: string;
  sourcePages: number[];
}

export interface ExerciseGroup {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  exercises: Exercise[];
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  groupIds: string[];
}

export interface ExerciseData {
  source: string;
  language: 'en';
  excluded: string[];
  thumbnailSize: { '1x': number; '2x': number };
  categories: Category[];
  groups: ExerciseGroup[];
}
