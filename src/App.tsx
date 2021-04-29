import { h, Fragment } from 'preact';
import { AlbumGallery } from './AlbumGallery';
import { Router, Route } from 'preact-router';
import { Photos } from './Photos';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { Album } from './Album';

import './reset.css';

const theme = {
  mobileBreakpoint: '500px',
  desktopBreakpoint: '1000px',
};

const GlobalStyle = createGlobalStyle`

:root {
  --background-color-dark: #191919;
  --text-color-light: #f2f2f2;
  --text-shadow: -1px 1px 2px #00000099, 1px 1px 2px #00000099, 1px -1px 2px #00000099, -1px -1px 2px #00000099;
  --serif-font-family: 'Roboto Slab', serif;
  --sans-font-family: 'Roboto', serif;
  --sans-normal-font-weight: 300;
  --sans-thin-font-weight: 100;
  --grid-gap: 16px;
  --mobile-breakpoint: ${theme.mobileBreakpoint};
  --desktop-breakpoint: ${theme.desktopBreakpoint};
}
html {
  background-color: var(--background-color-dark);
}
body {
  font-family: var(--serif-font-family);
  font-size: 16px;
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--sans-font-family);
    font-weight: var(--sans-thin-font-weight);
  }
}
`;

const AlbumsPage = () => <AlbumGallery />;
const PhotosPage = () => <Photos />;
const AlbumPage = ({
  albumId,
  photoId,
}: {
  albumId: string;
  photoId?: string;
}) => <Album albumId={albumId} photoId={photoId} />;

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Route path="/" component={AlbumsPage} />
        <Route path="/photos" component={PhotosPage} />
        <Route path="/album/:albumId" component={AlbumPage} />
        <Route path="/album/:albumId/photo/:photoId" component={AlbumPage} />
      </Router>
    </ThemeProvider>
  );
};
