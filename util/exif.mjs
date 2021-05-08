import { run } from './run.mjs';

export const exif = async (f) =>
  (await run('exiv2', '-Pkyct', f))
    .split('\n')
    .filter((s) => s.length > 0)
    .reduce(
      (info, s) => ({
        ...info,
        [s.substr(0, 45).trim()]: s.substr(60).trim(),
      }),
      {},
    );

const geoRx = /(?<deg>[0-9\.]+)deg (?<min>[0-9\.]+)' (?<sec>[0-9\.]+)"/;
const toDecimalCoords = (degrees, minutes, seconds, direction) => {
  var dd =
    parseInt(degrees, 10) +
    parseInt(minutes, 10) / 60 +
    parseInt(seconds, 10) / 3600;
  if (direction == 'South' || direction == 'West') {
    dd = dd * -1;
  }
  return dd;
};
export const geo = (exif) => {
  if (exif['Exif.GPSInfo.GPSLatitude'] === undefined) return;
  const { deg: latDeg, min: latMin, sec: latSec } = exif[
    'Exif.GPSInfo.GPSLatitude'
  ].match(geoRx).groups;
  const lat = toDecimalCoords(
    latDeg,
    latMin,
    latSec,
    exif['Exif.GPSInfo.GPSLatitudeRef'],
  );

  const { deg: lngDeg, min: lngMin, sec: lngSec } = exif[
    'Exif.GPSInfo.GPSLongitude'
  ].match(geoRx).groups;
  const lng = toDecimalCoords(
    lngDeg,
    lngMin,
    lngSec,
    exif['Exif.GPSInfo.GPSLongitudeRef'],
  );

  return { lat, lng };
};
