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
  --serif-font-family: 'Roboto Slab', serif;
  --sans-font-family: 'Roboto', serif;
  --sans-normal-font-weight: 300;
  --sans-thin-font-weight: 100;
}
html {
  background-color: var(--background-color-dark);
}
body {
  font-family: var(--serif-font-family);
  font-size: 20px;
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--sans-font-family);
    font-weight: var(--sans-thin-font-weight);
  }
}
`;

const AlbumsPage = () => <AlbumGallery />;
const PhotosPage = () => <Photos />;
const AlbumPage = ({ id }: { id: string }) => <Album id={id} />;

export const App = () => {
  return (
    <Fragment>
      <GlobalStyle />
      <Router>
        <Route path="/" component={AlbumsPage} />
        <Route path="/photos" component={PhotosPage} />
        <Route path="/album/:id" component={AlbumPage} />
      </Router>
    </Fragment>
  );
};
