export type AssetType = 'video' | 'audio' | 'infographic' | 'document' | 'article';

export interface TimelineItem {
  id: string;
  title: string;
  date: string;
  category: 'finance' | 'milestone' | 'dev' | 'default';
  type: AssetType;
  description: string;
  asset_path?: string;
  raw_md?: string;
}
