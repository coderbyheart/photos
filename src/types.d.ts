type Album = {
  id: string;
  title: string;
  createdAt: string;
  cover?: string;
  photos: string[];
  html?: string;
};

type Photo = {
  id: string;
  title: string;
  takenAt: string;
  license: 'CC0' | 'CC BY-ND 3.0' | 'CC BY-ND 4.0' | 'CC BY-SA 4.0' | 'None';
  geo?: { lat: number; lng: number };
  tags?: string[];
  url: string;
  size: number;
  image: { width: number; height: number };
  contentType: string;
  html?: string;
  photographer?: {
    name: string;
    url?: string;
  };
};
