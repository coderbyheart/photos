export const thumb = (size: number) => (photo: Photo): string =>
  `${photo.url}?fm=webp&fit=thumb&w=${size}&h=${size}&q=75`;

export const header = (photo: Photo): string =>
  `${photo.url}?fm=webp&fit=thumb&w=1024&h=250&q=75`;
