export interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string;
  status: string;
  contact_name: string;
  contact_email: string;
  contact_picture?: string;
  created_at: string;
}