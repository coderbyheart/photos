type Album = {
	id: string
	title: string
	createdAt: string
	cover?: string
	photos: string[]
	html?: string
	track?: string[]
	geo?: { lat: number; lng: number }
}

type Media = {
	id: string
	title: string
	takenAt: string
	license: 'CC0' | 'CC BY-ND 3.0' | 'CC BY-ND 4.0' | 'CC BY-SA 4.0' | 'None'
	geo?: { lat: number; lng: number }
	tags?: string[]
	url: string
	size: number
	contentType: string
	html?: string
	photographer?: {
		name: string
		url?: string
	}
}

type Photo = Media & {
	image: { width: number; height: number }
	thumbnail?: string // e.g. `data:image/webp;base64,UklGRmAAAABXR...`
	preview?: string // e.g. `data:image/webp;base64,UklGRmAAAABXR...`
}

type PhotoWithThumbnail = Photo & {
	thumbnail: string // e.g. `data:image/webp;base64,UklGRmAAAABXR...`
	preview?: string // e.g. `data:image/webp;base64,UklGRmAAAABXR...`
}

type Video = Media & {
	video: {
		width: number
		height: number
		youtube?: string
	}
}

interface ImportMeta {
	env: {
		PUBLIC_MAPBOX_TOKEN: string
	}
}
