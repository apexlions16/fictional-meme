export type Category = 'fantastik' | 'bilim-kurgu' | 'süper-kahraman' | 'korku' | 'oyun' | 'ofis';
export type AspectRatio = '1:1' | '4:5' | '16:9';
export type TextAlign = 'left' | 'center' | 'right';
export type View = 'dashboard' | 'discover' | 'studio' | 'library' | 'analytics';

export interface MemeTemplate {
  id: string;
  name: string;
  category: Category;
  description: string;
  emoji: string;
  palette: [string, string, string];
  tags: string[];
  popularity: number;
}

export interface TextLayer {
  id: 'top' | 'bottom';
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  align: TextAlign;
  uppercase: boolean;
  shadow: boolean;
}

export interface MemeDocument {
  id: string;
  title: string;
  templateId: string;
  category: Category;
  ratio: AspectRatio;
  backgroundImage?: string;
  layers: TextLayer[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  favorite: boolean;
}

export interface AppStats {
  generated: number;
  exported: number;
  saved: number;
  sessions: number;
  categoryCounts: Partial<Record<Category, number>>;
}

export interface AppData {
  documents: MemeDocument[];
  stats: AppStats;
  theme: 'dark' | 'light';
}
