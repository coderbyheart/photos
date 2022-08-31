import { sized as cfSized, thumb as cfThumb } from './contentful'

const isContentfulImage = (url: string): boolean =>
	/images\.ctfassets\.net/.test(url)

export const thumb = (size: number, { url }: { url: string }): string =>
	isContentfulImage(url) ? cfThumb(size, { url }) : url

export const sized = (
	{ width, height }: { width: number; height: number },
	{ url }: { url: string },
) => (isContentfulImage(url) ? cfSized({ width, height }, { url }) : url)
