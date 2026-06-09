export interface Cat {
  id: number;
  name: string;
  image: string;
  status: 'available' | 'pending' | 'adopted';
  display_order?: number;
}
