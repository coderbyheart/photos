import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'
import { useScroll } from './useScroll'

const StyledPhotoCaption = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	padding: 1rem;
	@media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
		font-size: 20px;
		bottom: 2rem;
		left: 2rem;
		max-width: 90vw;
		padding: 0.5rem 2rem;
		border-radius: 15px;
	}
	color: var(--text-color-light);
	text-shadow: var(--text-shadow);
	h1 {
		font-family: var(--headline-font-family);
		font-weight: var(--headline-normal-font-weight);
		font-size: 18px;
	}
	@media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
		h1 {
			font-size: 200%;
		}
	}
	background-color: #191919dd;
	a {
		color: inherit;
	}
`
export const PhotoCaption = ({ media }: { media: Media }) => {
	const scrolling = useScroll()
	const [visible, setVisible] = useState<boolean>(true)
	useEffect(() => {
		let isMounted = true
		const clear = setTimeout(() => {
			isMounted && setVisible(false)
		}, 5000)

		return () => {
			isMounted = false
			clearTimeout(clear)
		}
	}, [scrolling])
	if (scrolling) return null
	if (!visible) return null
	if (ignoreTitle(media.title)) return null
	return (
		<StyledPhotoCaption>
			<h1>{media.title}</h1>
			{media.html && <div dangerouslySetInnerHTML={{ __html: media.html }} />}
		</StyledPhotoCaption>
	)
}

const ignoreTitle = (title: string): boolean => /^[0-9]{8}T[0-9]{6}/.test(title)
