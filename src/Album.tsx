import { Fragment, h } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { thumb } from './contentful';
import { Gallery, AlbumThumb } from './AlbumGallery';
import { format } from 'date-fns';

export const Album = ({ id }: { id: number }) => {
  const [album, setAlbum] = useState<Album | undefined>(undefined);
  useEffect(() => {
    fetch('/data/albums.json')
      .then((res) => res.json())
      .then((albums) => setAlbum(albums[id]));
  }, []);
  return album === undefined ? (
    <p>Loading ...</p>
  ) : (
    <Gallery>
      {album.photos.map((id, k) => (
        <PhotoThumb id={id} key={k} />
      ))}
    </Gallery>
  );
};

const PhotoThumb = ({ id }: { id: string }) => {
  const el = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [photo, setPhoto] = useState<Photo | undefined>(undefined);

  useLayoutEffect(() => {
    if (el.current !== null) {
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      });
      observer.observe(el.current);
    }
  }, [el]);

  useEffect(() => {
    if (!visible) return;
    fetch(`/data/photos/${id}.json`)
      .then((res) => res.json())
      .then((p) => {
        setPhoto(p);
      })
      .catch(() => {
        console.error(`Failed to load photo data: ${id}`);
      });
  }, [visible]);

  return (
    <AlbumThumb
      ref={el}
      style={{
        backgroundImage: photo ? `url(${thumb(250)(photo)})` : undefined,
      }}
    >
      {photo && (
        <Fragment>
          <h2>{photo.name}</h2>
          <p>{format(new Date(photo.takenAt), 'd. LLLL yyyy')}</p>
        </Fragment>
      )}
    </AlbumThumb>
  );
};
