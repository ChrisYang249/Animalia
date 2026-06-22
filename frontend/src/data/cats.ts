export interface Cat {
  id: number;
  name: string;
  image: string;
  status: 'available' | 'pending' | 'adopted';
  description?: string | null;
  display_order?: number;
}
