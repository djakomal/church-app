export interface Worship {
  id: string;
  title: string;
  date: string;
  leader: string;
  status: 'planned' | 'completed' | 'cancelled';
  songs: Array<{
    id: string;
    title: string;
  }>;
}