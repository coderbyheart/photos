import { h, Fragment } from 'preact';
import styled from 'styled-components';

const StyledLicense = styled.div`
  font-size: 14px;
  margin-top: 1rem;
`;

const Photographer = ({ photo }: { photo: Photo }) => {
  if (photo.photographer === undefined)
    return (
      <a
        href={'https://coderbyheart.com/'}
        target={'blank'}
        rel={'noreferrer noopener'}
      >
        Markus Tacker
      </a>
    );
  if (photo.photographer.url === undefined)
    return <span>{photo.photographer.name}</span>;
  return (
    <a
      href={photo.photographer.url}
      target={'blank'}
      rel={'noreferrer noopener'}
    >
      {photo.photographer.name}
    </a>
  );
};

export const License = ({ photo }: { photo: Photo }) => (
  <StyledLicense>
    <p>
      Photo <em>{photo.title}</em> by <Photographer photo={photo} />.
    </p>
    {(() => {
      switch (photo.license) {
        case 'CC BY-ND 3.0':
          return (
            <p>
              Licensed under the{' '}
              <a
                href={'https://creativecommons.org/licenses/by-nd/3.0/'}
                target={'blank'}
                rel={'noreferrer noopener'}
              >
                Attribution-NoDerivs 3.0 Unported (CC BY-ND 3.0)
              </a>{' '}
              license.
            </p>
          );
        case 'CC BY-SA 4.0':
          return (
            <p>
              Licensed under the{' '}
              <a
                href={'https://creativecommons.org/licenses/by-sa/4.0/'}
                target={'blank'}
                rel={'noreferrer noopener'}
              >
                Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
              </a>{' '}
              license.
            </p>
          );
        case 'CC0':
          <p>
            Licensed as
            <a
              href={
                'https://creativecommons.org/share-your-work/public-domain/cc0'
              }
              target={'blank'}
              rel={'noreferrer noopener'}
            >
              Public Domain
            </a>
            .
          </p>;
      }
    })()}
    <p>
      © {new Date(photo.takenAt).getFullYear()} <Photographer photo={photo} />.
      All rights reserved.
    </p>
  </StyledLicense>
);
