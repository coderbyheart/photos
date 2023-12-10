import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { createReadStream, promises as fs } from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import { exif, geo } from './util/exif.js'
import { run } from './util/run.js'

const s3 = new S3Client({})
const { bucketName } = fromEnv({ bucketName: 'BUCKET_NAME' })(process.env)
const PhotosCDNEndpoint = `https://7w7z6ydf2htamqdsm6nbxm7sma0nkltc.lambda-url.eu-central-1.on.aws/`

const importPhoto = async (photo) => {
	const checksum = (await run('sha256sum', photo)).split(' ')[0].substr(0, 8)

	const { ext, base } = path.parse(photo)
	if (!['.jpeg', '.jpg'].includes(ext))
		throw new Error(`Unsupported file extension: ${ext}`)
	const mediaInfo = await exif(photo)
	const contentType = 'image/jpeg'
	const geoInfo = geo(mediaInfo)

	if (mediaInfo === undefined) {
		throw new Error(`Could read exif data for ${photo}!`)
	}

	const takenAt = new Date(
		mediaInfo.Image.DateTime.replace(
			/^([0-9]{4}):([0-9]{2}):([0-9]{2}) /,
			'$1-$2-$3T',
		),
	)

	const fileName = `${takenAt
		.toISOString()
		.substr(0, 19)
		.replace(/[-:]/g, '')}-${checksum}`
	const outFile = path.join(process.cwd(), 'data', 'photos', `${fileName}.md`)

	const Key = `${new Date().toISOString().slice(0, 10)}/${base}`
	await s3.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key,
			Body: createReadStream(photo),
		}),
	)

	// Preview image
	// @see https://transitive-bullshit.github.io/lqip-modern/
	const thumbnail = await fetch(`${PhotosCDNEndpoint}${Key}?f=placeholder`, {
		redirect: 'follow',
	})
	const orig = thumbnail.headers.get('x-amz-meta-original') // e.g. '/2023-12-10/IMG20231207121810.jpg JPEG 3456x4608 8-bit sRGB'
	const [width, height] = orig
		.split(' ')[2]
		.split('x')
		.map((s) => parseInt(s, 10))

	console.log(outFile)
	await fs.writeFile(
		outFile,
		[
			'---',
			yaml
				.dump({
					title: fileName,
					takenAt,
					license: 'CC BY-ND 4.0',
					url: `${PhotosCDNEndpoint}${Key}`,
					size: (await fs.stat(photo)).size, // e.g. 5106419
					image: {
						width, //e.g. 3008,
						height, //e.g. 4000,
					},
					thumbnail: `data:image/webp;base64,${Buffer.from(
						await thumbnail.arrayBuffer(),
					).toString('base64')}`,
					geo: geoInfo,
					contentType,
					mediaInfo,
				})
				.trim(),
			'---',
		].join('\n'),
		'utf-8',
	)
}

await importPhoto(process.argv[process.argv.length - 1])
