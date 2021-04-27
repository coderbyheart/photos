import { Fragment, h } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { thumb, header } from './contentful';
import { Gallery, AlbumThumb } from './AlbumGallery';
import { format } from 'date-fns';
import styled from 'styled-components';

const Header = styled.header`
  display: flex;
  color: var(--text-color-light);
  text-shadow: var(--text-shadow);
  flex-direction: column;
  align-content: center;
  align-items: center;
  background-size: cover;
  min-height: 500px;
  justify-content: center;
  h1 {
    font-weight: normal;
    font-size: 400%;
  }
  > p {
    font-family: var(--sans-font-family);
  }
  a {
    color: inherit;
    text-shadow: inherit;
  }
`;

const Description = styled.div`
  margin-top: 1rem;
  font-family: var(--serif-font-family);
`;

export const Album = ({ id }: { id: string }) => {
  const [album, setAlbum] = useState<Album | undefined>(undefined);
  const [cover, setCover] = useState<Photo | undefined>(undefined);
  useEffect(() => {
    fetch('/data/albums.json')
      .then((res) => res.json())
      .then((albums) => setAlbum(albums[id]))
      .catch(() => {
        console.error(`Failed to load albums!`);
      });
  }, []);
  useEffect(() => {
    if (album === undefined) return;
    fetch(`/data/photos/${album.cover ?? album.photos[0]}.json`)
      .then((res) => res.json())
      .then((p) => {
        setCover(p);
      })
      .catch(() => {
        console.error(`Failed to load album cover: ${id}`);
      });
  }, [album]);
  return album === undefined ? (
    <p>Loading ...</p>
  ) : (
    <Fragment>
      <Header
        style={{
          backgroundImage: cover ? `url(${header(cover)})` : undefined,
        }}
      >
        <h1>{album.title}</h1>
        <p>
          {format(new Date(album.createdAt), 'd. LLLL yyyy')} &middot;{' '}
          {album.photos.length} photos
        </p>
        {album.tags && album.tags.map((tag, k) => <span key={k}>#{tag}</span>)}
        {album.html && (
          <Description dangerouslySetInnerHTML={{ __html: album.html }} />
        )}
      </Header>
      <Gallery>
        {album.photos.map((id, k) => (
          <PhotoThumb id={id} key={k} />
        ))}
      </Gallery>
    </Fragment>
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
    />
  );
};
