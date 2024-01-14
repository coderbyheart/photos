import { format } from 'date-fns'
import fs from 'node:fs'

const id = process.argv[process.argv.length - 1]
const apiKey = process.env.YT_API_KEY ?? ''

type Info = {
	id: string
	snippet: {
		publishedAt: string // e.g. '2024-01-13T13:05:24Z'
		channelId: string // e.g. 'UCo39WsJa_nSOLqWsozWLJHw'
		title: string // e.g. 'Fatbike tour in Lappland during winter 2024'
		description: string // e.g. 'Organized by Roll Outdoors we did an amazing four hour fatbike tour through the Urho Kekkonen National Park.\n\n#codefreeze2024 #lappland #fatbike #urhokekkonen #rolloutdoors'
		tags?: string[] // e.g. [ 'codefreeze2024', 'lappland', 'fatbike' ]
	}
	recordingDetails: {
		locationDescription?: string // 'Saariselkä'
		location?: {
			latitude: number // e.g. 68.4196636
			longitude: number // e.g. 27.4100029
			altitude: number // e.g. 0
		}
		recordingDate?: string //e.g. '2024-01-11T00:00:00Z'
	}
}
const ytInfo = async (id: string): Promise<Info> => {
	const reqUrl = `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(
		id,
	)}&key=${encodeURIComponent(apiKey)}&part=snippet&part=recordingDetails`

	const res = await fetch(reqUrl, {
		method: 'GET',
	})

	const info = await res.json()

	return {
		id,
		...info.items[0],
	}
}

const youTubeToMarkdow = (info: Info): { id: string; markdown: string } => {
	if (info.recordingDetails.recordingDate === undefined)
		throw new Error(`${info.id} is missing a recording date.`)
	const markdown = [
		`title: ${info.snippet.title}`,
		`takenAt: '${info.recordingDetails.recordingDate}'`,
		`license: CC BY-ND 3.0`,
		`video:`,
		`  youtube: ${info.id}`,
	]
	if (info.recordingDetails.location !== undefined) {
		markdown.push(
			`geo:`,
			`  lat: ${info.recordingDetails.location.latitude}`,
			`  lng: ${info.recordingDetails.location.longitude}`,
		)
	}
	if (info.snippet.tags !== undefined) {
		markdown.push(`tags:`, ...info.snippet.tags.map((tag) => `  - ${tag}`))
	}

	return {
		id: `${format(
			new Date(info.recordingDetails.recordingDate),
			"yyyyMMdd'T'HHmmss",
		)}-${info.id}`,
		markdown: [`---`, ...markdown, `---`, '', info.snippet.description].join(
			'\n',
		),
	}
}

const info = await ytInfo(id)
const { id: basename, markdown } = youTubeToMarkdow(info)

console.log(markdown)

fs.writeFileSync(`./data/photos/${basename}.md`, markdown)
console.log(`${basename} written.`)
