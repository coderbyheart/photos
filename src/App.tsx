import { h, Fragment } from 'preact';
import { AlbumGallery } from './AlbumGallery';
import { Router, Route } from 'preact-router';
import { Photos } from './Photos';
import { createGlobalStyle } from 'styled-components';

import './reset.css';

const GlobalStyle = createGlobalStyle`
html {
  background-color: #f3f5f6;
}
body {
  font-family: 'Noto Sans', sans-serif;
}`;

const AlbumsPage = () => <AlbumGallery />;
const PhotosPage = () => <Photos />;

export const App = () => {
  return (
    <Fragment>
      <GlobalStyle />
      <Router>
        <Route path="/" component={AlbumsPage} />
        <Route path="/photos" component={PhotosPage} />
      </Router>
    </Fragment>
  );
};
