export interface Book {
  id: string;
  title: string;
  filename: string;
  file_path: string;
  file_type: 'pdf' | 'docx' | 'txt';
  total_pages: number;
  current_page: number;
  added_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  is_pinned?: number; // 0 or 1
  author?: string;
  genre?: string;
  published_year?: string;
  description?: string;
  cover_image?: string;
  sort_order?: number;
  deleted_at?: string | null; // For trash feature
}

export interface Annotation {
  id: string;
  book_id: string;
  type: 'highlight' | 'underline' | 'strike' | 'marker';
  content: string; // The text highlighted
  page: number;
  position_data: string; // JSON string of rects/cfi mapping to original file
  color: string;
  created_at: string;
}

export interface Note {
  id: string;
  book_id: string;
  target_text: string;
  note_content: string;
  page: number;
  position_data: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingHistory {
  id: string;
  book_id: string;
  read_date: string; // YYYY-MM-DD
  duration_seconds: number;
  pages_read: number; 
}

export interface Bookmark {
  id: string;
  book_id: string;
  page: number;
  title: string;
  created_at: string;
}

export interface TableOfContent {
  id: string;
  book_id: string;
  title: string;
  page: number;
  parent_id: string | null; // For nested TOC
  order_index: number;
}

export interface Setting {
  key: string;
  value: string;
}
