import { Fragment } from 'preact'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import { PhotoThumb } from './Album'
import { Gallery } from './AlbumGallery'
import { Photo } from './Photo'
import { sized } from './resized'

export const PhotosByMonth = ({
	photoId,
	year,
	month,
}: {
	photoId?: string
	year: string
	month: string
}) => {
	const [photos, setPhotos] = useState<string[]>([])
	useEffect(() => {
		fetch(`/data/photos-byMonth-${year}-${month}.json`)
			.then((res) => res.json())
			.then((p) => setPhotos((photos) => [...photos, ...p]))
			.catch(() => {
				console.error(
					`Failed to load /data/photos-byMonth-${year}-${month}.json!`,
				)
			})
	}, [year, month])
	if (photos.length === 0) return <p>Loading ...</p>
	const getNextPhotoId = (increment = 1) =>
		photos[(photos.indexOf(photoId ?? photos[0]) + increment) % photos.length]
	return (
		<Fragment>
			{photoId && (
				<Photo
					id={photoId}
					onClose={() => {
						route(`/takenAt/${year}/${month}`)
					}}
					onPrev={() => {
						let k = photos.indexOf(photoId) - 1
						if (k < 0) k = photos.length - 1
						route(`/takenAt/${year}/${month}/${encodeURIComponent(photos[k])}`)
						window.scrollTo({ top: 0 })
					}}
					onNext={() => {
						route(
							`/takenAt/${year}/${month}/${encodeURIComponent(
								getNextPhotoId(),
							)}`,
						)
						window.scrollTo({ top: 0 })
					}}
					onLoad={(size) => {
						// Preload next image
						fetch(`/data/photos/${getNextPhotoId(2)}.json`)
							.then((res) => res.json())
							.then(({ url }) =>
								fetch(sized(size, { url }), { mode: 'no-cors' }),
							)
							.catch(() => {
								console.error(
									`Failed to load /data/photos/${getNextPhotoId(2)}.json!`,
								)
							})
					}}
				/>
			)}
			<Gallery>
				{photos.map((photoId, k) => (
					<PhotoThumb
						id={photoId}
						key={k}
						onClick={() => {
							route(`/takenAt/${year}/${month}/${encodeURIComponent(photoId)}`)
						}}
					/>
				))}
			</Gallery>
		</Fragment>
	)
}
