const hiRes = (size: number): number =>
	Math.floor(size * (window.devicePixelRatio ?? 1))

export const thumb = (size: number, { url }: { url: string }): string =>
	`${url}?f=thumb&w=${hiRes(size)}&q=8`

export const sized = (
	{ width, height }: { width: number; height: number },
	{ url }: { url: string },
) => `${url}?f=scaled&w=${hiRes(width)}&h=${hiRes(height)}&q=9`
