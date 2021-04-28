import { h } from 'preact';
import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { fullsize } from './contentful';
import styled from 'styled-components';

const Dim = styled.div`
  width: calc(100vw - 2 * var(--grid-gap));
  height: calc(100vh - 2 * var(--grid-gap));
  display: flex;
  margin: var(--grid-gap) var(--grid-gap) 0 var(--grid-gap);
  position: relative;
`;
const Fullscreen = styled.div`
  height: 100%;
  width: calc(100vw - 3 * var(--grid-gap));
  background-position: 50% 50%;
  background-repeat: no-repeat;
`;
const PrevNav = styled.div`
  position: absolute;
  width: 50%;
  height: 100%;
  left: 0;
  cursor: pointer;
`;
const NextNav = styled.div`
  position: absolute;
  width: 50%;
  height: 100%;
  right: 0;
  cursor: pointer;
`;

export const Photo = ({
  id,
  onNext,
  onPrev,
  onClose,
  onLoad,
}: {
  id: string;
  onNext?: () => unknown;
  onPrev?: () => unknown;
  onClose?: () => unknown;
  onLoad?: ({ width, height }: { width: number; height: number }) => unknown;
}) => {
  const [photo, setPhoto] = useState<Photo | undefined>(undefined);
  const [photoSrc, setPhotoSrc] = useState<string | undefined>(undefined);

  useLayoutEffect(() => {
    window.onkeyup = ({ key }: KeyboardEvent) => {
      switch (key) {
        case 'ArrowRight':
          onNext?.();
          return;
        case 'ArrowLeft':
          onPrev?.();
          return;
        case 'Escape':
          onClose?.();
          return;
      }
    };
  }, []);

  useEffect(() => {
    fetch(`/data/photos/${id}.json`)
      .then((res) => res.json())
      .then((p) => {
        setPhoto({ ...p, id });
        setPhotoSrc(
          fullsize({
            width: window.innerWidth,
            height: window.innerHeight,
          })({ ...p, id }),
        );
      })
      .catch(() => {
        console.error(`Failed to load photo data: ${id}`);
      });
  }, [id]);

  useEffect(() => {
    if (photoSrc === undefined) return;
    fetch(photoSrc).then(() =>
      onLoad?.({
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    );
  }, [photoSrc]);

  if (photo === undefined) return null;

  return (
    <Dim>
      <Fullscreen
        style={{
          backgroundImage: photoSrc ? `url(${photoSrc})` : undefined,
        }}
      />
      <PrevNav onClick={() => onPrev?.()} />
      <NextNav onClick={() => onNext?.()} />
    </Dim>
  );
};
