export interface Cat {
  id: number;
  name: string;
  image: string;
  status: 'available' | 'pending' | 'adopted';
}

export const cats: Cat[] = [
  { id: 1, name: 'Lulu', image: '/cats/cat-1.jpg', status: 'available' },
  { id: 2, name: 'Tiggy', image: '/cats/cat-2.jpg', status: 'available' },
  { id: 3, name: 'Mango', image: '/cats/cat-3.jpg', status: 'available' },
  { id: 4, name: 'Jimmy', image: '/cats/cat-4.jpg', status: 'available' },
  { id: 5, name: 'Simba', image: '/cats/cat-5.jpg', status: 'available' },
  { id: 6, name: 'Biscuit', image: '/cats/cat-6.jpg', status: 'available' },
  { id: 7, name: 'Shadow', image: '/cats/cat-7.jpg', status: 'available' },
  { id: 8, name: 'Mochi', image: '/cats/cat-8.jpg', status: 'available' },
  { id: 9, name: 'Pepper', image: '/cats/cat-9.jpg', status: 'available' },
  { id: 10, name: 'Oreo', image: '/cats/cat-10.jpg', status: 'available' },
  { id: 11, name: 'Ginger', image: '/cats/cat-11.jpg', status: 'available' },
  { id: 12, name: 'Luna', image: '/cats/cat-12.jpg', status: 'available' },
  { id: 13, name: 'Charlie', image: '/cats/cat-13.jpg', status: 'available' },
  { id: 14, name: 'Willow', image: '/cats/cat-14.jpg', status: 'available' },
  { id: 15, name: 'Max', image: '/cats/cat-15.jpg', status: 'available' },
  { id: 16, name: 'Cleo', image: '/cats/cat-16.jpg', status: 'available' },
  { id: 17, name: 'Felix', image: '/cats/cat-17.jpg', status: 'available' },
  { id: 18, name: 'Daisy', image: '/cats/cat-18.jpg', status: 'available' },
  { id: 19, name: 'Rocky', image: '/cats/cat-19.jpg', status: 'available' },
  { id: 20, name: 'Nala', image: '/cats/cat-20.jpg', status: 'available' },
  { id: 21, name: 'Boots', image: '/cats/cat-21.jpg', status: 'available' },
  { id: 22, name: 'Honey', image: '/cats/cat-22.jpg', status: 'available' },
  { id: 23, name: 'Smokey', image: '/cats/cat-23.jpg', status: 'available' },
  { id: 24, name: 'Patches', image: '/cats/cat-24.jpg', status: 'available' },
  { id: 25, name: 'Leo', image: '/cats/cat-25.jpg', status: 'available' },
];
