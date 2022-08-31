import { ComponentChildren, createContext } from 'preact'
import { useContext, useEffect, useState } from 'preact/hooks'

export const Scrolling = createContext<boolean>(false)

export const useScroll = () => useContext(Scrolling)

export const ScrollingProvider = ({
	children,
}: {
	children: ComponentChildren
}) => {
	const [scrolling, setScrolling] = useState<boolean>(false)

	useEffect(() => {
		let scrollTimeout: NodeJS.Timeout | undefined = undefined

		const updateScrolling = () => {
			const isScrolling = window.scrollY > 0
			setScrolling(isScrolling)
			scrollTimeout = undefined
		}

		const scrollListener = () => {
			if (scrollTimeout === undefined) updateScrolling()
			if (scrollTimeout !== undefined) clearTimeout(scrollTimeout)
			scrollTimeout = setTimeout(updateScrolling, 250)
		}
		window.addEventListener('scroll', scrollListener)

		return () => {
			window.removeEventListener('scroll', scrollListener)
			if (scrollTimeout !== undefined) clearTimeout(scrollTimeout)
		}
	}, [])

	return <Scrolling.Provider value={scrolling}>{children}</Scrolling.Provider>
}
