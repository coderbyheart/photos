import { sized as awsSized, thumb as awsThumb } from './aws'
import { sized as cfSized, thumb as cfThumb } from './contentful'

const isContentfulImage = (url: string): boolean =>
	/images\.ctfassets\.net/.test(url)

const isPhotosCDNImage = (url: string): boolean => /lambda-url/.test(url)

export const thumb = (size: number, { url }: { url: string }): string => {
	if (isContentfulImage(url)) return cfThumb(size, { url })
	if (isPhotosCDNImage(url)) return awsThumb(size, { url })
	return url
}

export const sized = (
	{ width, height }: { width: number; height: number },
	{ url }: { url: string },
) => {
	if (isContentfulImage(url)) return cfSized({ width, height }, { url })
	if (isPhotosCDNImage(url)) return awsSized({ width, height }, { url })
	return url
}
