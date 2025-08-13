export interface GroupInvite {
  id: number;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  created_at: string;
  expires_at: string;
  invite_link: string;
 
}