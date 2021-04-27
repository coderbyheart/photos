type Album = {
  id: string;
  title: string;
  createdAt: string;
  cover?: string;
  photos: string[];
  html?: string;
  tags?: string[];
};

type Photo = {
  id: string;
  name: string;
  takenAt: string;
  rotation: number;
  license: string;
  geo?: { lat: number; lng: number };
  tags: string[];
  url: string;
  size: number;
  image: { width: number; height: number };
  contentType: string;
  html?: string;
};
