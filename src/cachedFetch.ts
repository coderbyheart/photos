const cache = new Map<string, { data: unknown; expires: number }>()

export const cachedFetch = async <T extends Record<string, any>>(
	options: Parameters<typeof fetch>[0],
	cacheTimeInMinutes = 60,
): Promise<T> => {
	const key = JSON.stringify(options)
	const entry = cache.get(key)

	if (entry !== undefined && entry.expires >= Date.now()) {
		console.debug(`cachedFetch`, 'hit', key)
		return entry.data as T
	}

	console.debug(`cachedFetch`, 'miss', key)
	const res = await fetch(options)
	const data = await res.json()
	cache.set(key, {
		data,
		expires: Date.now() + cacheTimeInMinutes * 60 * 1000,
	})
	return data as T
}
