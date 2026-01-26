
export interface ColorRecipe {
  name: string;
  hex: string;
  recipe: string;
}

export type StudioMode = 'poetic' | 'recreation';

export interface CakeDesign {
  id: string;
  timestamp: number;
  title: string;
  visualDescription: string;
  technique: string;
  colorRecipes: ColorRecipe[];
  imageUrl?: string;
  referenceImageUrl?: string;
  isShared?: boolean;
  pastryFormat?: string;
  theme?: string;
  mode?: StudioMode;
}

export interface AppState {
  isGenerating: boolean;
  result: CakeDesign | null;
  error: string | null;
}
