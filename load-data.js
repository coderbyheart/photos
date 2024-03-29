import { promises as fs } from 'fs'
import * as path from 'path'
import format from 'rehype-format'
import html from 'rehype-stringify'
import { remark } from 'remark'
import extract from 'remark-extract-frontmatter'
import frontmatter from 'remark-frontmatter'
import remark2rehype from 'remark-rehype'
import yaml from 'yaml'

const toHTML = remark()
	.use(frontmatter, ['yaml'])
	.use(extract, { yaml: yaml.parse })
	.use(remark2rehype)
	.use(format)
	.use(html)

const photosPerPage = 50

const writeFile = async (target, data) =>
	fs.writeFile(target, JSON.stringify(data), 'utf-8')

const parse = async (el) =>
	new Promise((resolve, reject) =>
		toHTML.process(el, (err, file) => {
			if (err !== undefined && err !== null) return reject(err)
			return resolve({
				...file.data,
				html: file.value.length > 0 ? file.value : undefined,
			})
		}),
	)

const main = async () => {
	const dataFolder = path.join(process.cwd(), 'public', 'data', 'photos')
	await fs.mkdir(dataFolder, {
		recursive: true,
	})

	return Promise.all([
		// Albums
		fs
			.readdir(path.join(process.cwd(), 'data', 'albums'))
			.then(async (files) => {
				const albums = await Promise.all(
					files
						.filter((s) => s.endsWith('.md'))
						.map(async (album) => ({
							slug: album.replace(/\.md$/, ''),
							doc: await parse(
								await fs.readFile(
									path.join(process.cwd(), 'data', 'albums', album),
									'utf-8',
								),
							),
						})),
				)

				albums.sort(({ doc: { createdAt: a } }, { doc: { createdAt: b } }) =>
					b.localeCompare(a),
				)

				await writeFile(
					path.join(process.cwd(), 'public', 'data', `albums.json`),
					albums.reduce((albums, album) => {
						const { slug, doc } = album
						return {
							...albums,
							[slug]: doc,
						}
					}, {}),
				)
			}),
		// Photos
		fs
			.readdir(path.join(process.cwd(), 'data', 'photos'))
			.then(async (files) => {
				const photos = files.filter((s) => s.endsWith('.md'))
				await writeFile(
					path.join(process.cwd(), 'public', 'data', `stats.json`),
					{
						photos: photos.length,
					},
				)
				const tags = {}
				const photoDocs = await Promise.all(
					photos.map(async (f) => {
						const p = path.parse(f)
						const source = path.join(process.cwd(), 'data', 'photos', f)
						const target = path.join(
							process.cwd(),
							'public',
							'data',
							'photos',
							`${p.name}.json`,
						)
						const doc = await parse(await fs.readFile(source, 'utf-8'))
						const slug = path.parse(f).name
						doc.tags
							?.map((tag) => tag.toLowerCase())
							.forEach((tag) => {
								if (tags[tag] === undefined) {
									tags[tag] = [slug]
								} else {
									tags[tag].push(slug)
								}
							})
						const sourceModified = (await fs.stat(source)).mtime
						let targetModified = -1
						try {
							targetModified = (await fs.stat(target)).mtime
						} catch {}
						if (targetModified < sourceModified) {
							await writeFile(target, doc)
						}
						return { slug, doc }
					}),
				)
				// Sort photos by date taken, write paginated
				photoDocs.sort(({ doc: { takenAt: a } }, { doc: { takenAt: b } }) =>
					b.localeCompare(a),
				)
				const photoPages = photoDocs.reduce(
					(chunks, { slug }) => {
						if ((chunks[chunks.length - 1].length ?? 0) >= photosPerPage) {
							chunks.push([])
						}
						chunks[chunks.length - 1].push(slug)
						return chunks
					},
					[[]],
				)
				await Promise.all(
					photoPages.map((page, k) =>
						writeFile(
							path.join(
								process.cwd(),
								'public',
								'data',
								`photos-takenAt-${k}.json`,
							),
							page,
						),
					),
				)
				// Group by year and month
				const photoMonths = photoDocs.reduce((photosByMonth, { slug, doc }) => {
					const month = doc.takenAt.substr(0, 7)
					if (photosByMonth[month] === undefined) {
						photosByMonth[month] = []
					}
					photosByMonth[month].push(slug)
					return photosByMonth
				}, {})
				await Promise.all(
					Object.entries(photoMonths).map(([month, slugs]) =>
						writeFile(
							path.join(
								process.cwd(),
								'public',
								'data',
								`photos-byMonth-${month}.json`,
							),
							slugs,
						),
					),
				)
				// Write tags
				await writeFile(
					path.join(process.cwd(), 'public', 'data', `photos-tags.json`),
					tags,
				)
			}),
	])
}

main()
