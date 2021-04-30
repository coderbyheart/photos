import { h } from 'preact';
import { useEffect, useLayoutEffect, useState } from 'preact/hooks';
import { sized } from './contentful';
import styled from 'styled-components';
import { X as CloseIcon } from './icons/X';
import { ChevronLeft as PrevIcon } from './icons/ChevronLeft';
import { ChevronRight as NextIcon } from './icons/ChevronRight';

export const Dim = styled.div`
  display: flex;
  position: relative;
  height: 100vh;
  width: 100%;
  justify-content: center;
  align-items: center;
`;
const Fullscreen = styled.div`
  height: 100vh;
  width: 100vw;
  @media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
    height: calc(100vh - var(--grid-gap));
    width: calc(100vw - 3 * var(--grid-gap));
  }
  background-position: 50% 50%;
  background-repeat: no-repeat;
`;
const PrevNav = styled.div`
  position: absolute;
  width: 50%;
  height: 100%;
  left: 0;
  display: flex;
  align-content: center;
  align-items: center;
  color: var(--text-color-light);
  svg {
    display: none;
  }
  &:hover {
    svg {
      display: inline-block;
      opacity: 50%;
    }
  }
`;
const NextNav = styled(PrevNav)`
  left: auto;
  right: 0;
  justify-content: flex-end;
`;
const Button = styled.button`
  color: var(--text-color-light);
  position: absolute;
  top: 0;
  right: 0;

  @media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
    right: 1rem;
  }
  padding: 0;
  border: 0;
  background: transparent;
  opacity: 50%;
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
          sized({
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
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
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
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
      <PrevNav onClick={() => onPrev?.()}>
        <PrevIcon />
      </PrevNav>
      <NextNav onClick={() => onNext?.()}>
        <NextIcon />
      </NextNav>
      <Button onClick={() => onClose?.()}>
        <CloseIcon />
      </Button>
    </Dim>
  );
};
