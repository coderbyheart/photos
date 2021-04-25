export const thumb = (size: number) => (photo: Photo): string =>
  `${photo.url}?fm=webp&fit=thumb&w=${size}&h=${size}&q=75`;
