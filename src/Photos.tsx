import { Fragment } from 'preact'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import { PhotoThumb } from './Album'
import { Gallery } from './AlbumGallery'
import { LoadMoreButton } from './LoadMoreButton'
import { Photo } from './Photo'
import { sized } from './resized'

const Button = styled.button`
	background: transparent;
	color: var(--text-color-light);
	border: 1px solid var(--text-color-light);
	border-radius: 5px;
`

export const Photos = ({ photoId }: { photoId?: string }) => {
	const [page, setPage] = useState(0)
	const [photos, setPhotos] = useState<string[]>([])
	useEffect(() => {
		fetch(`/data/photos-takenAt-${page}.json`)
			.then((res) => res.json())
			.then((p) => setPhotos((photos) => [...photos, ...p]))
			.catch(() => {
				console.error(`Failed to load /data/photos-takenAt-${page}.json!`)
			})
	}, [page])
	if (photos.length === 0) return <p>Loading ...</p>
	const getNextPhotoId = (increment = 1) =>
		photos[(photos.indexOf(photoId ?? photos[0]) + increment) % photos.length]
	return (
		<Fragment>
			{photoId && (
				<Photo
					id={photoId}
					onClose={() => {
						route(`/photos`)
					}}
					onPrev={() => {
						let k = photos.indexOf(photoId) - 1
						if (k < 0) k = photos.length - 1
						route(`/photo/${encodeURIComponent(photos[k])}`)
						window.scrollTo({ top: 0 })
					}}
					onNext={() => {
						route(`/photo/${encodeURIComponent(getNextPhotoId())}`)
						window.scrollTo({ top: 0 })
					}}
					onLoad={(size) => {
						// Preload next image
						fetch(`/data/photos/${getNextPhotoId(2)}.json`)
							.then((res) => res.json())
							.then(({ url }) =>
								fetch(sized(size, { url }), {
									mode: 'no-cors',
								}),
							)
							.catch(() => {
								console.error(`/data/photos/${getNextPhotoId(2)}.json`)
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
							route(`/photo/${encodeURIComponent(photoId)}`)
						}}
					/>
				))}
			</Gallery>
			<LoadMoreButton
				onVisible={() => {
					setPage((page) => page + 1)
				}}
				onClick={() => {
					setPage((page) => page + 1)
				}}
			/>
		</Fragment>
	)
}
