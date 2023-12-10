import { Fragment } from 'preact'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import { PhotoThumb } from './Album'
import { Gallery } from './AlbumGallery'
import { Photo } from './Photo'
import { sized } from './resized'

export const PhotosByTag = ({
	photoId,
	tag,
}: {
	photoId?: string
	tag: string
}) => {
	const [taggedPhotos, setTaggedPhotos] = useState<Record<string, string[]>>({})
	const [page, setPage] = useState<number>(1)
	const itemsPerPage = 50
	useEffect(() => {
		fetch('/data/photos-tags.json')
			.then((res) => res.json())
			.then((p) => setTaggedPhotos(p))
	}, [])
	if (Object.keys(taggedPhotos).length === 0) return <p>Loading ...</p>
	const getNextPhotoId = (increment = 1) =>
		taggedPhotos[tag][
			(taggedPhotos[tag].indexOf(photoId ?? taggedPhotos[tag][0]) + increment) %
				taggedPhotos[tag].length
		]
	return (
		<Fragment>
			{photoId && (
				<Photo
					id={photoId}
					onClose={() => {
						route(`/tag/${tag}`)
					}}
					onPrev={() => {
						let k = taggedPhotos[tag].indexOf(photoId) - 1
						if (k < 0) k = taggedPhotos[tag].length - 1
						route(`/tag/${tag}/${encodeURIComponent(taggedPhotos[tag][k])}`)
						window.scrollTo({ top: 0 })
					}}
					onNext={() => {
						route(`/tag/${tag}/${encodeURIComponent(getNextPhotoId())}`)
						window.scrollTo({ top: 0 })
					}}
					onLoad={(size) => {
						// Preload next image
						fetch(`/data/photos/${getNextPhotoId(2)}.json`)
							.then((res) => res.json())
							.then(({ url }) =>
								fetch(sized(size, { url }), { mode: 'no-cors' }),
							)
					}}
				/>
			)}
			<Gallery>
				{taggedPhotos[tag].slice(0, page * itemsPerPage).map((photoId, k) => (
					<PhotoThumb
						id={photoId}
						key={k}
						onClick={() => {
							route(`/tag/${tag}/${encodeURIComponent(photoId)}`)
						}}
					/>
				))}
			</Gallery>
		</Fragment>
	)
}
