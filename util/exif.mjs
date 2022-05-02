import { run } from './run.mjs';

export const exif = async (f) =>
  (await run('exiv2', '-PExgnycv', f))
    .split('\n')
    .filter((s) => s.length > 0)
    .reduce((info, s) => {
      const { cat, prop, format, len, value } = s.match(
        /(?<addr>[^ ]+) +(?<cat>[^ ]+) +(?<prop>[^ ]+) +(?<format>[^ ]+) +(?<len>[0-9]+) +(?<value>.+)/,
      ).groups;
      if (info[cat] === undefined) {
        info[cat] = {};
      }
      let v = value;
      switch (format) {
        case 'Rational':
        case 'SRational':
          v = value
            .split(' ')
            .map((v) => {
              const [a, b] = v.split('/');
              return parseInt(a) / parseInt(b);
            })
            .map((n) => (isNaN(n) ? 0 : n));
          break;
        case 'Short':
          v = parseInt(value, 10);
          break;
        case 'Long':
          v = parseFloat(value);
          break;
      }
      info[cat][prop] = v;
      return info;
    }, {});

export const geo = (exif) => {
  if (exif?.GPSInfo?.GPSLatitude === undefined) return;
  const [latDeg, latMin, latSec] = exif.GPSInfo.GPSLatitude;
  const latDir = exif.GPSInfo.GPSLatitudeRef;
  const [lngDeg, lngMin, lngSec] = exif.GPSInfo.GPSLongitude;
  const lngDir = exif.GPSInfo.GPSLongitudeRef;
  return {
    lat: dmsToDecimal(latDeg, latMin, latSec, latDir),
    lng: dmsToDecimal(lngDeg, lngMin, lngSec, lngDir),
  };
};

const dmsToDecimal = (degrees, minutes, seconds, direction) => {
  let decimal = degrees + minutes / 60 + seconds / (60 * 60);

  if (direction == 'S' || direction == 'W') {
    decimal = decimal * -1;
  }
  return decimal;
};
