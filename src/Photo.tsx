import { Fragment } from 'preact'
import { Link } from 'preact-router'
import { useEffect, useLayoutEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import { cachedFetch } from './cachedFetch'
import { ChevronLeft as PrevIcon } from './icons/ChevronLeft'
import { ChevronRight as NextIcon } from './icons/ChevronRight'
import { Download as DownloadIcon } from './icons/Download'
import { MapPin as MapIcon } from './icons/MapPin'
import { X as CloseIcon } from './icons/X'
import { License } from './License'
import { PhotoCaption } from './PhotoCaption'
import { sized } from './resized'

export const Dim = styled.div`
	display: flex;
	position: relative;
	height: 100vh;
	width: 100%;
	justify-content: center;
	align-items: center;
`
const Fullscreen = styled.div`
	height: 100vh;
	width: 100vw;
	@media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
		height: calc(100vh - 2 * var(--grid-gap));
		width: calc(100vw - 3 * var(--grid-gap));
	}
	background-position: 50% 50%;
	background-repeat: no-repeat;
	background-size: contain;
	video {
		height: 100%;
	}
	display: flex;
	align-content: center;
	justify-content: center;
	align-items: center;
	@keyframes fadeIn {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
	animation: fadeIn ease 0.5s;
`
const PrevNav = styled.div`
	position: absolute;
	width: 25%;
	min-width: 50px;
	height: 50%;
	min-height: 50px;
	left: 0;
	display: flex;
	align-content: center;
	align-items: center;
	color: var(--text-color-light);
	svg {
		display: none;
	}
	&:hover {
		svg {
			display: inline-block;
			opacity: 50%;
		}
	}
`
const NextNav = styled(PrevNav)`
	left: auto;
	right: 0;
	justify-content: flex-end;
`
const Button = styled.button`
	color: var(--text-color-light);
	position: absolute;
	top: 0;
	right: 0;
	padding: 0;
	border: 0;
	background: transparent;
	opacity: 50%;
`
const Info = styled.aside`
	color: var(--text-color-light);
	h1 {
		font-weight: var(--headline-normal-font-weight);
	}
	a {
		color: inherit;
	}
	margin: 1rem;
	@media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
		margin: 2rem auto 4rem auto;
	}
	max-width: var(--content-max-width);
	svg {
		height: 20px;
		width: 20px;
		margin: 0 0.25rem;
		transform: translateY(4px);
	}
`
const Description = styled.div`
	@media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
		margin: 1rem 0;
	}
`

export const PhotoEl = styled.main``

const LoadingPhoto = styled.div`
	display: flex;
	height: calc(100vh + 50px);
	width: 100%;
	justify-content: center;
	align-items: center;
	color: var(--text-color-light);
	opacity: 0.5;
	code {
		@keyframes fadeIn {
			0% {
				opacity: 0;
			}
			100% {
				opacity: 1;
			}
		}
		animation: fadeIn ease 0.5s;
	}
`

export const Photo = ({
	id,
	onNext,
	onPrev,
	onClose,
	onLoad,
}: {
	id: string
	onNext?: () => unknown
	onPrev?: () => unknown
	onClose?: () => unknown
	onLoad?: ({ width, height }: { width: number; height: number }) => unknown
}) => {
	const [photo, setPhoto] = useState<Photo | undefined>(undefined)
	const [photoSrc, setPhotoSrc] = useState<string | undefined>(undefined)
	const [video, setVideo] = useState<Video | undefined>(undefined)

	useLayoutEffect(() => {
		window.onkeyup = ({ key }: KeyboardEvent) => {
			switch (key) {
				case 'ArrowRight':
					onNext?.()
					return
				case 'ArrowLeft':
					onPrev?.()
					return
				case 'Escape':
					onClose?.()
					return
			}
		}
	}, [])

	useEffect(() => {
		let isMounted = true
		cachedFetch<Photo | Video>(`/data/photos/${id}.json`)
			.then((p) => {
				if (!isMounted) return
				if ('image' in p) {
					setVideo(undefined)
					setPhoto({ ...p, id })
					setPhotoSrc(
						sized(
							{
								width: document.documentElement.clientWidth,
								height: document.documentElement.clientHeight,
							},
							p,
						),
					)
				} else {
					setPhoto(undefined)
					setPhotoSrc(undefined)
					setVideo({ ...p, id })
					onLoad?.({
						width: document.documentElement.clientWidth,
						height: document.documentElement.clientHeight,
					})
				}
			})
			.catch(() => {
				console.error(`Failed to load photo data: ${id}`)
			})
		return () => {
			isMounted = false
		}
	}, [id])

	useEffect(() => {
		if (photoSrc === undefined) return
		fetch(photoSrc).then(() =>
			onLoad?.({
				width: document.documentElement.clientWidth,
				height: document.documentElement.clientHeight,
			}),
		)
	}, [photoSrc])

	if (photo === undefined && video === undefined)
		return (
			<LoadingPhoto>
				<code>Loading {id} ...</code>
			</LoadingPhoto>
		)

	const media = (photo ?? video) as Media

	return (
		<PhotoEl>
			<Dim>
				{photoSrc && (
					<Fullscreen
						style={{
							backgroundImage: photoSrc ? `url(${photoSrc})` : undefined,
						}}
					/>
				)}
				{video?.url && (
					<Fullscreen>
						<video src={video.url} autoPlay={true} />
					</Fullscreen>
				)}
				{video?.video?.youtube && <YoutubePlayer media={video} />}
				<PhotoCaption media={media} key={media.id} />
				<PrevNav onClick={() => onPrev?.()}>
					<PrevIcon />
				</PrevNav>
				<NextNav onClick={() => onNext?.()}>
					<NextIcon />
				</NextNav>
				<Button onClick={() => onClose?.()}>
					<CloseIcon />
				</Button>
			</Dim>
			<Info>
				<h1>{media.title}</h1>
				{media.tags &&
					media.tags.map((tag, k) => (
						<Fragment key={k}>
							<Link href={`/tags/${tag}`}>#{tag}</Link>{' '}
						</Fragment>
					))}
				{media.html && (
					<Description dangerouslySetInnerHTML={{ __html: media.html }} />
				)}
				{media.geo && (
					<p>
						<a
							href={`https://www.google.com/maps/search/${media.geo.lat},${media.geo.lng}`}
							target={'blank'}
							rel={'noreferrer noopener'}
						>
							<MapIcon /> {media.geo.lat}, {media.geo.lng}
						</a>
					</p>
				)}
				{media.license !== 'None' && media.url && (
					<p>
						<a title={'Download'} href={media.url} target={'blank'}>
							<DownloadIcon />
							{(media.size / 1024 / 1024).toFixed(1)} MB
						</a>
					</p>
				)}
				<License media={media} />
			</Info>
		</PhotoEl>
	)
}

const YoutubePlayer = ({ media }: { media: Video }) => {
	const videoWidth = media.video.width ?? 650
	const videoHeight = media.video.height ?? 1150
	const portrait = videoWidth < videoHeight
	let width = document.documentElement.clientWidth
	let height = width * (videoHeight / videoWidth)
	if (portrait) {
		height = document.documentElement.clientHeight - 30
		width = height * (videoWidth / videoHeight)
	}
	return (
		<Fullscreen>
			<iframe
				width={width}
				height={height}
				src={`https://www.youtube-nocookie.com/embed/${media.video.youtube}?controls=0&autoplay=1&loop=1&modestbranding=1&rel=0&showinfo=0`}
				title={media.title}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen={true}
			></iframe>
		</Fullscreen>
	)
}
