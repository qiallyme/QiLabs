export type QuickNote = {
  id: string;
  owner_id: string;
  title: string | null;
  body_md: string;
  capture_type: string;
  target_area: string | null;
  tags: string[];
  source: string;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type QuickNoteInsert = {
  owner_id: string;
  title?: string | null;
  body_md: string;
  capture_type?: string;
  target_area?: string | null;
  tags?: string[];
  source?: string;
};
