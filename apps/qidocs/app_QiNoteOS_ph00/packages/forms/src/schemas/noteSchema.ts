// Note form schema
export interface NoteFormData {
  title: string;
  content: string;
  realmId?: string;
  tags?: string[];
}

export const validateNoteForm = (data: NoteFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  return errors;
};

