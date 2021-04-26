type Album = {
  id: string;
  title: string;
  description?: string;
  description_html?: string;
  createdAt: string;
  cover?: string;
  photos: string[];
};

type Photo = {
  id: string;
  name: string;
  description?: string;
  description_html?: string;
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
