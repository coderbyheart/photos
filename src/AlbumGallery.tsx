import { format } from 'date-fns';
import { h } from 'preact';
import { useEffect, useRef, useState, useLayoutEffect } from 'preact/hooks';
import styled from 'styled-components';
import { thumb } from './contentful';
import { Link, route } from 'preact-router';

export const Gallery = styled.section`
  display: grid;
  grid-template: 98vw / 98vw;
  grid-auto-rows: 98vw;
  @media (min-width: 500px) {
    grid-template: 29vw / repeat(auto-fill, 29vw);
    grid-auto-rows: 29vw;
  }
  @media (min-width: 1000px) {
    grid-template: 250px / repeat(auto-fill, 250px);
    grid-auto-rows: 250px;
  }
  grid-gap: 1vw;
  margin: 1vw;
`;
export const AlbumThumb = styled.div`
  background-size: cover;
  color: white;
  text-shadow: 0 1px 1px #000;
  padding: 1vw;
  h2 {
    font-weight: normal;
    font-size: 18px;
  }
  p {
    font-size: 14px;
  }
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;
const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
`;

export const AlbumGallery = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  useEffect(() => {
    fetch('/data/albums.json')
      .then((res) => res.json())
      .then(setAlbums);
  }, []);

  if (albums.length === 0) return <p>Loading ...</p>;
  return (
    <Gallery>
      {albums.map((album, k) => (
        <AlbumThumbnail key={k} album={album} id={`${k}`} />
      ))}
    </Gallery>
  );
};

const AlbumThumbnail = ({ album, id }: { album: Album; id: string }) => {
  const el = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [cover, setCover] = useState<Photo | undefined>(undefined);

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
    const cover = album.cover ?? album.photos[0];
    if (cover === undefined) return;
    fetch(`/data/photos/${cover}.json`)
      .then((res) => res.json())
      .then((p) => {
        setCover(p);
      })
      .catch(() => {
        console.error(`Failed to load photo data: ${cover}`);
      });
  }, [visible]);

  return (
    <AlbumThumb
      ref={el}
      style={{
        backgroundImage: cover ? `url(${thumb(250)(cover)})` : undefined,
      }}
      onClick={() => {
        route(`/album/${encodeURIComponent(album.title)}-${id}`);
      }}
    >
      <StyledLink href={`/album/${encodeURIComponent(album.title)}-${id}`}>
        <h2>{album.title}</h2>
        <p>
          {album.photos.length} photos &middot;{' '}
          {format(new Date(album.created), 'd. LLLL yyyy')}
        </p>
      </StyledLink>
    </AlbumThumb>
  );
};
