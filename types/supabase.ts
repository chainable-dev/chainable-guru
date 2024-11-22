export type Attachment = {
  id: string;
  chat_id: string;
  file_path: string;
  url: string;
  name: string;
  content_type: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      // Define your tables here
    }
  }
} 