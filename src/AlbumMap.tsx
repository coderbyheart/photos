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

const MapDot = styled.div`
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background-color: transparent;
	border: 2px solid #e00073;
	cursor: pointer;
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

type MediaWithLocation = (Photo | Video) & {
	geo: { lat: number; lng: number }
}

export const AlbumMap = ({ album }: { album: Album }) => {
	const [mediaWithLocation, setMediaWithLocation] = useState<
		MediaWithLocation[]
	>([])

	useEffect(() => {
		let isMounted = true
		const t = setTimeout(() => {
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
		}, 1000)

		return () => {
			isMounted = false
			clearTimeout(t)
		}
	}, [album])

	if (mediaWithLocation.length === 0) return null

	return <Map mediaWithLocation={mediaWithLocation} album={album} />
}

const Map = ({
	mediaWithLocation,
	album,
}: {
	mediaWithLocation: MediaWithLocation[]
	album: Album
}) => {
	const mapRef = useRef(null)
	const [mapInstance, setMapInstance] = useState<mapboxgl.Map>()
	const [showThumbnails, setShowThumbnails] = useState(false)

	useEffect(() => {
		if (mapRef.current === null) return
		console.debug(`[AlbumMap:Map]`, 'creating map')

		const map = new mapboxgl.Map({
			container: mapRef.current,
			style: 'mapbox://styles/mapbox/streets-v11',
			center: album.geo ?? [10.394980097332425, 63.43050145201516],
			zoom: 6,
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
								coordinates: (track.points as string[]).map((pos) =>
								{
									const [lat, lng] = pos.split(',').map(Number)
									return [lng, lat]
								},
								),
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
							'line-color': track.color ?? TRACK_COLORS[i % TRACK_COLORS.length],
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
			map.remove()
		}
	}, [])

	return (
		<AlbumContainer>
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
			<MapContainer ref={mapRef}>
				{mapInstance !== undefined &&
					mediaWithLocation.map((media) => (
						<MapMarker
							key={media.id}
							album={album}
							media={media}
							map={mapInstance}
							showThumbnail={showThumbnails}
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
	showThumbnail,
}: {
	album: Album
	media: MediaWithLocation
	map: mapboxgl.Map
	showThumbnail: boolean
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
		route(
			`/album/${encodeURIComponent(album.id)}/photo/${encodeURIComponent(media.id)}`,
		)
	}

	let backgroundImage: string | undefined
	if (showThumbnail) {
		if ('image' in media) backgroundImage = thumb(50, media)
		if ('video' in media && 'youtube' in media.video)
			backgroundImage = `https://img.youtube.com/vi/${media.video.youtube}/hqdefault.jpg`
	}

	return (
		<div ref={markerRef} onClick={handleClick}>
			{showThumbnail ? (
				<MapIcon
					style={{
						backgroundImage: backgroundImage
							? `url(${backgroundImage})`
							: undefined,
					}}
				/>
			) : (
				<MapDot />
			)}
		</div>
	)
}

