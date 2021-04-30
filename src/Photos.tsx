import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { PhotoThumb } from './Album';
import { route } from 'preact-router';
import { Gallery } from './AlbumGallery';
import { Photo } from './Photo';

export const Photos = ({ photoId }: { photoId?: string }) => {
  const [page, setPage] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  useEffect(() => {
    fetch(`/data/photos-takenAt-${page}.json`)
      .then((res) => res.json())
      .then(setPhotos);
  }, [page]);
  if (photos.length === 0) return <p>Loading ...</p>;
  return (
    <Fragment>
      {photoId && (
        <Photo
          id={photoId}
          onClose={() => {
            route(`/photos`);
          }}
        />
      )}
      <Gallery>
        {photos.map((photoId, k) => (
          <PhotoThumb
            id={photoId}
            key={k}
            onClick={() => {
              route(`/photo/${encodeURIComponent(photoId)}`);
            }}
          />
        ))}
      </Gallery>
    </Fragment>
  );
};
