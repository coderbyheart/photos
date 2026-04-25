import fs from 'node:fs'
import path from 'node:path'

const clientId = process.env.GOOGLE_CLIENT_ID ?? ''
const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? ''
const refreshToken = process.env.YT_REFRESH_TOKEN ?? ''

let accessToken = process.env.YT_ACCESS_TOKEN ?? ''

const refreshAccessToken = async (): Promise<void> => {
	const res = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			refresh_token: refreshToken,
			grant_type: 'refresh_token',
		}),
	})
	const data: { access_token: string } = await res.json()
	accessToken = data.access_token
	console.log('Access token refreshed.')
}

type PlaylistItem = {
	snippet: {
		resourceId: { videoId: string }
		title: string
	}
}

const getUploadsPlaylistId = async (): Promise<string> => {
	const params = new URLSearchParams({ part: 'contentDetails', mine: 'true' })
	let res = await fetch(
		`https://www.googleapis.com/youtube/v3/channels?${params}`,
		{ headers: { Authorization: `Bearer ${accessToken}` } },
	)
	if (res.status === 401) {
		await refreshAccessToken()
		res = await fetch(
			`https://www.googleapis.com/youtube/v3/channels?${params}`,
			{ headers: { Authorization: `Bearer ${accessToken}` } },
		)
	}
	const data = await res.json()
	return data.items[0].contentDetails.relatedPlaylists.uploads
}

const fetchAllVideoIdsFromPlaylist = async (
	playlistId: string,
): Promise<{ id: string; title: string }[]> => {
	const info: { id: string; title: string }[] = []
	let pageToken: string | undefined

	do {
		const params = new URLSearchParams({
			playlistId,
			part: 'snippet',
			maxResults: '50',
			...(pageToken !== undefined ? { pageToken } : {}),
		})
		const res = await fetch(
			`https://www.googleapis.com/youtube/v3/playlistItems?${params}`,
			{ headers: { Authorization: `Bearer ${accessToken}` } },
		)
		const data: { items: PlaylistItem[]; nextPageToken?: string } =
			await res.json()
		for (const item of data.items)
			info.push({
				id: item.snippet.resourceId.videoId,
				title: item.snippet.title,
			})
		pageToken = data.nextPageToken
	} while (pageToken !== undefined)

	return info
}

const uploadsPlaylistId = await getUploadsPlaylistId()
console.log(`Uploads playlist: ${uploadsPlaylistId}`)
const allVideoIds = await fetchAllVideoIdsFromPlaylist(uploadsPlaylistId)
console.log(`Found ${allVideoIds.length} uploaded videos on channel`)

// Build lookup: original filename -> { id, recordingDate }
const byFilename = new Map<string, { id: string; recordingDate?: string }>()
for (const { id, title } of allVideoIds) {
	byFilename.set(title, { id })
}
console.log(byFilename)

const photosDir = './data/photos'
const files = fs
	.readdirSync(photosDir)
	.filter((f) => f.startsWith('VID') && f.endsWith('.md'))
	.sort()

let matched = 0
const unmatched: string[] = []

for (const file of files) {
	const filePath = path.join(photosDir, file)
	let content = fs.readFileSync(filePath, 'utf-8')

	const titleMatch = content.match(/^title: (.+)$/m)
	if (titleMatch === null) {
		console.warn(`No title in ${file}`)
		continue
	}

	const title = titleMatch[1].trim().replace('.mp4', '')
	const match = byFilename.get(title)

	if (match !== undefined) {
		if (match.recordingDate !== undefined)
			content = content.replace(
				/^takenAt: '.+'$/m,
				`takenAt: '${match.recordingDate}'`,
			)
		content = content.replace(
			/(license: CC BY-ND 3\.0\n)/,
			`$1video:\n  youtube: ${match.id}\n`,
		)
		fs.writeFileSync(filePath, content)
		console.log(
			`✓ ${title} -> ${match.id}${match.recordingDate !== undefined ? ` (${match.recordingDate})` : ''}`,
		)
		matched++
	} else {
		console.warn(`✗ ${title} -> not found`)
		unmatched.push(title)
	}
}

console.log(`\nMatched ${matched} of ${files.length} videos`)
if (unmatched.length > 0) {
	console.log('Unmatched:')
	for (const t of unmatched) console.log(`  ${t}`)
}
