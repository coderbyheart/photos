const { promises: fs } = require('fs');
const path = require('path');
const remark = require('remark');
const html = require('remark-html');
const frontmatter = require('remark-frontmatter');
const extract = require('remark-extract-frontmatter');
const yaml = require('yaml').parse;
const toHTML = remark()
  .use(html)
  .use(frontmatter, ['yaml'])
  .use(extract, { yaml: yaml });

const updateIfChanged = async (source, target) => {
  const sourceModified = (await fs.stat(source)).mtime;
  let targetModified = -1;
  try {
    targetModified = (await fs.stat(target)).mtime;
  } catch {}
  if (targetModified >= sourceModified) return;
  console.log(`Loading ${source} ...`);
  const doc = await parse(await fs.readFile(source, 'utf-8'));
  console.log(`Writing ${target} ...`);
  await fs.writeFile(target, JSON.stringify(doc), 'utf8');
};

const parse = async (el) =>
  new Promise((resolve, reject) =>
    toHTML.process(el, (err, file) => {
      if (err !== undefined && err !== null) return reject(err);
      return resolve({
        ...file.data,
        html: file.contents,
      });
    }),
  );

module.exports = async function () {
  const dataFolder = path.join(process.cwd(), 'data-js', 'photos');
  console.log(dataFolder);
  await fs.mkdir(dataFolder, {
    recursive: true,
  });
  // Albums
  return Promise.all([
    fs
      .readdir(path.join(process.cwd(), 'data', 'albums'))
      .then(async (files) => {
        const albums = await Promise.all(
          files
            .filter((s) => s.endsWith('.md'))
            .map(async (album) => ({
              slug: album.replace(/\.md$/, ''),
              ...(await parse(
                await fs.readFile(
                  path.join(process.cwd(), 'data', 'albums', album),
                  'utf-8',
                ),
              )),
            })),
        );
        await fs.writeFile(
          path.join(process.cwd(), 'data-js', `albums.json`),
          JSON.stringify(
            albums.reduce((albums, album) => {
              const { slug, ...rest } = album;
              return {
                ...albums,
                [slug]: rest,
              };
            }, {}),
          ),
          'utf-8',
        );
      }),
    fs
      .readdir(path.join(process.cwd(), 'data', 'photos'))
      .then(async (files) => {
        const photos = files.filter((s) => s.endsWith('.md'));
        return Promise.all([
          fs.writeFile(
            path.join(process.cwd(), 'data-js', `stats.json`),
            JSON.stringify({ photos: photos.length }),
            'utf-8',
          ),
          ...photos.map(async (f) => {
            const p = path.parse(f);
            return updateIfChanged(
              path.join(process.cwd(), 'data', 'photos', f),
              path.join(process.cwd(), 'data-js', 'photos', `${p.name}.json`),
            );
          }),
        ]);
      }),
  ]);
};
