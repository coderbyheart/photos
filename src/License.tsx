import { h, Fragment } from 'preact';
import styled from 'styled-components';

const StyledLicense = styled.div`
  font-size: 14px;
  margin-top: 1rem;
`;

export const License = ({ photo }: { photo: Photo }) => (
  <StyledLicense>
    <p>
      Photo <em>{photo.title}</em> by{' '}
      <a
        href={'https://coderbyheart.com/'}
        target={'blank'}
        rel={'noreferrer noopener'}
      >
        Markus Tacker
      </a>
      .
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
        case 'None':
        default:
          return (
            <p>
              © {new Date(photo.takenAt).getFullYear()} Markus Tacker. All
              rights reserved.
            </p>
          );
      }
    })()}
  </StyledLicense>
);
