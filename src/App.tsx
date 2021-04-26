import { h, Fragment } from 'preact';
import { AlbumGallery } from './AlbumGallery';
import { Router, Route } from 'preact-router';
import { Photos } from './Photos';
import { createGlobalStyle } from 'styled-components';
import { Album } from './Album';

import './reset.css';

const GlobalStyle = createGlobalStyle`

:root {
  --background-color-dark: #191919;
  --text-color-light: #f2f2f2;
  --text-shadow: 0 1px 1px #000;
}
html {
  background-color: var(--background-color-dark);
}
body {
  font-family: 'Noto Sans', sans-serif;
}
`;

const AlbumsPage = () => <AlbumGallery />;
const PhotosPage = () => <Photos />;
const AlbumPage = ({ albumId }: { albumId: string }) => (
  <Album id={parseInt(albumId.split('-').pop() as string, 10)} />
);

export const App = () => {
  return (
    <Fragment>
      <GlobalStyle />
      <Router>
        <Route path="/" component={AlbumsPage} />
        <Route path="/photos" component={PhotosPage} />
        <Route path="/album/:albumId" component={AlbumPage} />
      </Router>
    </Fragment>
  );
};
