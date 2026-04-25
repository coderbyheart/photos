import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState } from 'preact/hooks'
import styled from 'styled-components'
import '../node_modules/mapbox-gl/dist/mapbox-gl.css'
import { thumb } from './contentful'
import { useLocation } from 'preact-iso'

mapboxgl.accessToken = import.meta.env.PUBLIC_MAPBOX_TOKEN

/** Distinct, saturated hues for GPX tracks on light basemaps (cycles if >20 tracks). */
const TRACK_COLORS = [
	'#911EB4', // purple
	'#3CB44B', // green
	'#32CD32', // lime green
	'#F58231', // orange
	'#42D4F4', // cyan
	'#F032E6', // magenta
	'#469990', // teal
	'#800000', // maroon
	'#000075', // navy
	'#6F2DBD', // violet
	'#9A6324', // brown
	'#FF1493', // deep pink
	'#00CED1', // dark turquoise
	'#4363D8', // blue
	'#FFD700', // gold
	'#DC143C', // crimson
	'#1E90FF', // dodger blue
	'#8B008B', // dark magenta
	'#228B22', // forest green
	'#E6194B', // vivid red
] as const

const AlbumContainer = styled.aside`
	background-color: var(--text-color-light);
	color: var(--background-color-dark);
	padding: 1rem;
`

const MapContainer = styled.div`
	height: 80vh;
`

const MapIcon = styled.div`
	background-image: url('/mapbox-icon.png');
	background-size: cover;
	background-position: center;
	width: 50px;
	height: 50px;
	border-radius: 10%;
	cursor: pointer;
	box-shadow: 0 0 5px 0px #00000073;
`

const ToggleLabel = styled.label`
	display: flex;
	align-items: center;
	gap: 0.4rem;
	font-size: 0.875rem;
	justify-content: flex-end;
	padding: 0.4rem 0;
	cursor: pointer;
`

const MapSettings = styled.aside`
	display: flex;
	flex-direction: row;
	gap: 0.5rem;
`

type MediaWithLocation = (Photo | Video) & {
	geo: { lat: number; lng: number }
}

const MAP_HEIGHT_KEY = 'map-height'

export const AlbumMap = ({ album }: { album: Album }) => {
	const [mediaWithLocation, setMediaWithLocation] = useState<
		MediaWithLocation[]
	>([])
	const [savedHeight] = useState<number | null>(() => {
		const v = localStorage.getItem(MAP_HEIGHT_KEY)
		return v !== null ? parseInt(v, 10) : null
	})

	useEffect(() => {
		let isMounted = true
		Promise.all(
			album.photos.map((id) =>
				fetch(`/data/photos/${id}.json`)
					.then((res) => res.json())
					.then((photo) => ({ ...photo, id }))
					.catch(() => {
						console.error(`Failed to load photo ${id}!`)
						return {}
					}),
			),
		)
			.then((withMaybeLocation) =>
				withMaybeLocation.filter(({ geo }) => geo !== undefined),
			)
			.then((mediaWithLocation) => {
				if (!isMounted) return
				if (mediaWithLocation.length > 0)
					console.debug(
						`Album has`,
						mediaWithLocation.length,
						'entries with geo location',
					)
				if (mediaWithLocation.length > 0)
					setMediaWithLocation(mediaWithLocation)
			})

		return () => {
			isMounted = false
		}
	}, [album])

	if (mediaWithLocation.length === 0) {
		if (savedHeight !== null)
			return <AlbumContainer style={{ height: savedHeight }} />
		return null
	}

	return (
		<Map
			mediaWithLocation={mediaWithLocation}
			album={album}
			onHeightMeasured={(h) =>
				localStorage.setItem(MAP_HEIGHT_KEY, String(h))
			}
		/>
	)
}

const CIRCLES_LAYER_ID = 'photo-circles'
const VIDEO_CIRCLES_LAYER_ID = 'video-circles'

const Map = ({
	mediaWithLocation,
	album,
	onHeightMeasured,
}: {
	mediaWithLocation: MediaWithLocation[]
	album: Album
	onHeightMeasured: (height: number) => void
}) => {
	const mapRef = useRef(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const [mapInstance, setMapInstance] = useState<mapboxgl.Map>()
	const [showThumbnails, setShowThumbnails] = useState(false)
	const [showPhotoLocations, setShowPhotoLocations] = useState(true)
	const mapDestroyedRef = useRef(false)
	const { route } = useLocation()
	const routeRef = useRef(route)
	useEffect(() => {
		routeRef.current = route
	}, [route])

	useEffect(() => {
		if (containerRef.current === null) return
		const h = containerRef.current.offsetHeight
		if (h > 0) onHeightMeasured(h)
	}, [])

	useEffect(() => {
		if (mapRef.current === null) return
		console.debug(`[AlbumMap:Map]`, 'creating map')

		const storageKey = 'map-state'
		const saved = localStorage.getItem(storageKey)
		const savedState = saved
			? (JSON.parse(saved) as { center: [number, number]; zoom: number })
			: null

		const map = new mapboxgl.Map({
			container: mapRef.current,
			style: 'mapbox://styles/mapbox/streets-v11',
			center: savedState?.center ??
				album.geo ?? [10.394980097332425, 63.43050145201516],
			zoom: savedState?.zoom ?? 6,
		})

		map.on('moveend', () => {
			const center = map.getCenter()
			localStorage.setItem(
				storageKey,
				JSON.stringify({
					center: [center.lng, center.lat],
					zoom: map.getZoom(),
				}),
			)
		})

		if (album.tracks !== undefined) {
			map.on('load', () => {
				for (const [i, track] of album.tracks!.entries()) {
					const routeId = `route-${i}`

					map.addSource(routeId, {
						type: 'geojson',
						data: {
							type: 'Feature',
							properties: {},
							geometry: {
								type: 'LineString',
								coordinates: (track.points as string[]).map((pos) => {
									const [lat, lng] = pos.split(',').map(Number)
									return [lng, lat]
								}),
							},
						},
					})
					map.addLayer({
						id: routeId,
						type: 'line',
						source: routeId,
						layout: {
							'line-join': 'round',
							'line-cap': 'round',
						},
						paint: {
							'line-color':
								track.color ?? TRACK_COLORS[i % TRACK_COLORS.length],
							'line-opacity': 0.9,
							'line-width': 6,
						},
					})

					if (track.name !== undefined) {
						map.on('mouseenter', routeId, () => {
							map.getCanvas().style.cursor = 'pointer'
						})

						map.on('mouseleave', routeId, () => {
							map.getCanvas().style.cursor = ''
						})

						map.on('click', routeId, (event) => {
							if (event.lngLat === undefined) return
							new mapboxgl.Popup()
								.setLngLat(event.lngLat)
								.setText(track.name!)
								.addTo(map)
						})
					}
				}
			})
		}

		map.on('load', () => {
			setMapInstance(map)
		})

		return () => {
			console.debug(`[AlbumMap:Map]`, 'destroying map')
			mapDestroyedRef.current = true
			map.remove()
		}
	}, [])

	useEffect(() => {
		if (mapInstance === undefined) return

		const photosWithLocation = mediaWithLocation.filter(
			(m) => !('video' in m && m.video !== undefined),
		)
		const videosWithLocation = mediaWithLocation.filter(
			(m) => 'video' in m && m.video !== undefined,
		)

		for (const [layerId, media, strokeColor] of [
			[CIRCLES_LAYER_ID, photosWithLocation, '#e00073'],
			[VIDEO_CIRCLES_LAYER_ID, videosWithLocation, '#0071C7'],
		] as const) {
			if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId)
			if (mapInstance.getSource(layerId)) mapInstance.removeSource(layerId)

			mapInstance.addSource(layerId, {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: media.map((m) => ({
						type: 'Feature' as const,
						properties: { mediaId: m.id },
						geometry: {
							type: 'Point' as const,
							coordinates: [m.geo.lng, m.geo.lat],
						},
					})),
				},
			})

			const beforeId =
				album.tracks !== undefined &&
				album.tracks.length > 0 &&
				mapInstance.getLayer('route-0') !== undefined
					? 'route-0'
					: undefined

			mapInstance.addLayer(
				{
					id: layerId,
					type: 'circle',
					source: layerId,
					paint: {
						'circle-radius': 10,
						'circle-color': 'transparent',
						'circle-opacity': 0.8,
						'circle-stroke-width': 2,
						'circle-stroke-color': strokeColor,
					},
				},
				beforeId,
			)

			mapInstance.on('click', layerId, (event) => {
				const mediaId = event.features?.[0]?.properties?.mediaId
				if (mediaId === undefined) return
				sessionStorage.setItem(
					`scroll-album-${album.id}`,
					String(window.scrollY),
				)
				routeRef.current(
					`/album/${encodeURIComponent(album.id)}/photo/${encodeURIComponent(mediaId)}`,
				)
			})

			mapInstance.on('mouseenter', layerId, () => {
				mapInstance.getCanvas().style.cursor = 'pointer'
			})

			mapInstance.on('mouseleave', layerId, () => {
				mapInstance.getCanvas().style.cursor = ''
			})
		}

		return () => {
			if (mapDestroyedRef.current) return
			for (const layerId of [CIRCLES_LAYER_ID, VIDEO_CIRCLES_LAYER_ID]) {
				if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId)
				if (mapInstance.getSource(layerId)) mapInstance.removeSource(layerId)
			}
		}
	}, [mapInstance, mediaWithLocation])

	useEffect(() => {
		if (mapInstance === undefined) return
		const visibility = showPhotoLocations ? 'visible' : 'none'
		for (const layerId of [CIRCLES_LAYER_ID, VIDEO_CIRCLES_LAYER_ID]) {
			if (mapInstance.getLayer(layerId))
				mapInstance.setLayoutProperty(layerId, 'visibility', visibility)
		}
	}, [showPhotoLocations, mapInstance])

	return (
		<AlbumContainer ref={containerRef}>
			<MapSettings>
				<ToggleLabel>
					<input
						type="checkbox"
						checked={showPhotoLocations}
						onChange={(e) =>
							setShowPhotoLocations((e.target as HTMLInputElement).checked)
						}
					/>
					Show photo locations
				</ToggleLabel>
				<ToggleLabel>
					<input
						type="checkbox"
						checked={showThumbnails}
						onChange={(e) =>
							setShowThumbnails((e.target as HTMLInputElement).checked)
						}
					/>
					Show thumbnails
				</ToggleLabel>
			</MapSettings>
			<MapContainer ref={mapRef}>
				{mapInstance !== undefined &&
					showThumbnails &&
					mediaWithLocation.map((media) => (
						<MapMarker
							key={media.id}
							album={album}
							media={media}
							map={mapInstance}
						/>
					))}
			</MapContainer>
		</AlbumContainer>
	)
}
const MapMarker = ({
	album,
	media,
	map,
}: {
	album: Album
	media: MediaWithLocation
	map: mapboxgl.Map
}) => {
	const markerRef = useRef<HTMLDivElement>(null)
	const { route } = useLocation()

	useEffect(() => {
		if (markerRef.current === null) return
		console.debug(`[AlbumMap:Marker]`, 'creating marker', media.geo)
		const marker = new mapboxgl.Marker(markerRef.current)
			.setLngLat(media.geo)
			.addTo(map)

		return () => {
			console.debug(`[AlbumMap:Marker]`, 'destroying marker')
			marker.remove()
		}
	}, [])

	const handleClick = () => {
		sessionStorage.setItem(`scroll-album-${album.id}`, String(window.scrollY))
		route(
			`/album/${encodeURIComponent(album.id)}/photo/${encodeURIComponent(media.id)}`,
		)
	}

	let backgroundImage: string | undefined
	if ('image' in media) backgroundImage = thumb(50, media)
	if ('video' in media && 'youtube' in media.video)
		backgroundImage = `https://img.youtube.com/vi/${media.video.youtube}/hqdefault.jpg`

	return (
		<div ref={markerRef} onClick={handleClick}>
			<MapIcon
				style={{
					backgroundImage: backgroundImage
						? `url(${backgroundImage})`
						: undefined,
				}}
			/>
		</div>
	)
}
