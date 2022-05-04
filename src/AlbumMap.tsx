import { h } from 'preact';
import { useRef, useState, useEffect } from 'preact/hooks';
import styled from 'styled-components';
import mapboxgl from 'mapbox-gl';
import { thumb } from './contentful';
import { route } from 'preact-router';

mapboxgl.accessToken = import.meta.env.SNOWPACK_PUBLIC_MAPBOX_TOKEN;

const AlbumContainer = styled.aside`
  background-color: var(--text-color-light);
  color: var(--background-color-dark);
  padding: 1rem;
`;

const MapContainer = styled.div`
  height: 80vh;
`;

const MapIcon = styled.div`
  background-image: url('/mapbox-icon.png');
  background-size: cover;
  background-position: center;
  width: 50px;
  height: 50px;
  border-radius: 10%;
  cursor: pointer;
  box-shadow: 0 0 5px 0px #00000073;
`;

type MediaWithLocation = (Photo | Video) & {
  geo: { lat: number; lng: number };
};

export const AlbumMap = ({ album }: { album: Album }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [media, setMedia] = useState<MediaWithLocation[]>([]);

  useEffect(() => {
    Promise.all(
      album.photos.map((id) =>
        fetch(`/data/photos/${id}.json`)
          .then((res) => res.json())
          .then((photo) => ({ ...photo, id })),
      ),
    )
      .then((withMaybeLocation) =>
        withMaybeLocation.filter(({ geo }) => geo !== undefined),
      )
      .then(setMedia);
  }, [album]);

  useEffect(() => {
    if (map.current !== null || mapContainer.current === null) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: album.geo?? [10.394980097332425, 63.43050145201516],
      zoom: 6,
    });

    if (album.track !== undefined) {
      map.current?.on('load', () => {
        map.current?.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: (album.track as string[]).map((pos) =>
                pos.split(',').map(parseFloat),
              ),
            },
          },
        });
        map.current?.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#000000',
            'line-opacity': 0.5,
            'line-width': 6,
          },
        });
      });
    }
  }, [album]);

  return (
    <AlbumContainer>
      <MapContainer ref={mapContainer}>
        {map.current !== null &&
          media.map((media) => (
            <MapMarker
              album={album}
              media={media}
              map={map.current as mapboxgl.Map}
            />
          ))}
      </MapContainer>
    </AlbumContainer>
  );
};

const MapMarker = ({
  album,
  media,
  map,
}: {
  album: Album;
  media: MediaWithLocation;
  map: mapboxgl.Map;
}) => {
  const markerRef = useRef<HTMLDivElement | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  useEffect(() => {
    if (marker.current !== null || markerRef.current === null) return; // initialize marker only once
    marker.current = new mapboxgl.Marker(markerRef.current)
      .setLngLat(media.geo)
      .addTo(map);
  });
  let backgroundImage;
  if ('image' in media) backgroundImage = thumb(50)(media);
  if ('video' in media && 'youtube' in media.video)
    backgroundImage = `https://img.youtube.com/vi/${media.video.youtube}/hqdefault.jpg`;
  return (
    <MapIcon
      ref={markerRef}
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
      }}
      onClick={() => {
        route(
          `/album/${encodeURIComponent(album.id)}/photo/${encodeURIComponent(
            media.id,
          )}`,
        );
      }}
    />
  );
};
