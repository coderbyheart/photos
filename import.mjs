import { promises as fs, createReadStream } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import yaml from 'js-yaml';
import contentfulManagement from 'contentful-management';
import Bottleneck from 'bottleneck';
const limiter = new Bottleneck({
  minTime: 1000 / 5,
  maxConcurrent: 5,
});
const cfM = contentfulManagement.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_API_TOKEN,
});
const env = await limiter
  .schedule(() => cfM.getSpace(process.env.CONTENTFUL_SPACE))
  .then((space) => limiter.schedule(() => space.getEnvironments()))
  .then((res) => res.items[0]);

const importFolder = process.argv[process.argv.length - 1];

const files = await fs.readdir(importFolder);

const run = (...args) =>
  new Promise((resolve, reject) => {
    const [cmd, ...rest] = args;
    const i = spawn(cmd, rest);

    let data = [];
    i.stdout.on('data', (d) => {
      data.push(d.toString());
    });

    let err = [];
    i.stderr.on('data', (data) => {
      err.push(data.toString());
    });

    i.on('close', (code) => {
      if (code === 0) return resolve(data.join('\n'));
      reject(err.join('\n'));
    });
  });

await Promise.all(
  files.map(async (file) => {
    const f = path.join(importFolder, file);
    try {
      const checksum = (await run('sha256sum', f)).split(' ')[0];
      const exif = (await run('exiv2', '-Pkyct', f))
        .split('\n')
        .filter((s) => s.length > 0)
        .reduce(
          (info, s) => ({
            ...info,
            [s.substr(0, 45).trim()]: s.substr(60).trim(),
          }),
          {},
        );

      const takenAt = new Date(
        exif['Exif.Image.DateTime'].replace(
          /^([0-9]{4}):([0-9]{2}):([0-9]{2}) /,
          '$1-$2-$3T',
        ),
      );

      const outFile = path.join(
        process.cwd(),
        'data',
        'photos',
        `${takenAt
          .toISOString()
          .substr(0, 19)
          .replace(/[-:]/g, '')}-${checksum}.md`,
      );

      let contentType = 'image/jpeg';
      if (/png$/i.test(path.parse(f).ext)) contentType = 'image/png';
      if (/gif$/i.test(path.parse(f).ext)) contentType = 'image/gif';
      const assetDraft = await env.createAssetFromFiles({
        fields: {
          title: {
            'en-US': checksum,
          },
          file: {
            'en-US': {
              contentType,
              fileName: path.parse(f).name,
              file: createReadStream(f),
            },
          },
        },
      });

      const readyAsset = await limiter.schedule(() =>
        assetDraft.processForAllLocales(),
      );
      const asset = await limiter.schedule(() => readyAsset.publish());
      console.log(outFile);
      await fs.writeFile(
        outFile,
        [
          '---',
          yaml
            .dump({
              title: file,
              takenAt,
              license: 'CC BY-ND 4.0',
              // geo: { lat: 50.228306, lng: 8.621735 },
              // tags: ['blue', 'grass', 'sphere'],
              url: asset.fields.file['en-US'].url,
              size: asset.fields.file['en-US'].details.size,
              image: asset.fields.file['en-US'].details.image,
              exif,
            })
            .trim(),
          '---',
        ].join('\n'),
        'utf-8',
      );
    } catch (err) {
      console.error(`Failed to import ${f}`);
      console.error(err);
    }
  }),
);
