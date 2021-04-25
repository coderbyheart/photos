type Album = {
  id: string;
  title: string;
  description?: string;
  created: string;
  cover?: string;
  photos: string[];
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
};
