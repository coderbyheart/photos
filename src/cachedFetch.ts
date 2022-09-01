const parse = <T extends Record<string, any>>(
	cacheEntry: string,
): {
	data?: T
	expires: number
} => {
	try {
		return JSON.parse(cacheEntry)
	} catch {
		return {
			expires: -1,
		}
	}
}

export const cachedFetch = async <T extends Record<string, any>>(
	options: Parameters<typeof fetch>[0],
	cacheTimeInMinutes = 60,
): Promise<T> => {
	const key = JSON.stringify(options)
	const cached = localStorage.getItem(key)
	const entry = cached !== null ? parse<T>(cached) : undefined

	if (
		entry !== undefined &&
		'data' in entry &&
		(entry?.expires ?? -1) >= Date.now()
	) {
		console.debug(`cachedFetch`, 'hit', key)
		return entry.data as T
	}

	console.debug(`cachedFetch`, 'miss', key)
	const res = await fetch(options)
	const data = await res.json()
	localStorage.setItem(
		key,
		JSON.stringify({
			data,
			expires: Date.now() + cacheTimeInMinutes * 60 * 1000,
		}),
	)
	return data as T
}
