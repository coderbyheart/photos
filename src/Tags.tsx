import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'

import { Link } from 'preact-router'

const TagsNav = styled.nav`
	color: var(--text-color-light);
	font-family: var(--headline-font-family);
	text-align: center;

	span {
		font-weight: var(--headline-thin-font-weight);
		font-size: 60%;
		padding-left: 0.25rem;
		@media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
			padding-left: 0.5rem;
		}
	}

	ul {
		list-style: none;
		padding: 0;
	}
	li {
		margin: 0;
		display: inline-block;
		padding: 0 0.5rem 0 0.5rem;
		@media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
			padding: 0 2rem 0 2rem;
		}
		&.level-1 {
			font-size: 200%;
		}
		&.level-2 {
			font-size: 150%;
			opacity: 0.95;
		}
		&.level-3 {
			opacity: 0.9;
		}
		&.level-4 {
			opacity: 0.85;
		}
		&.level-5 {
			opacity: 0.8;
		}
		&.level-6 {
			opacity: 0.75;
		}
		&.level-7 {
			opacity: 0.7;
		}
		&.level-8 {
			font-size: 90%;
			opacity: 0.65;
		}
		&.level-9 {
			font-size: 80%;
			opacity: 0.6;
		}
		&.level-10 {
			font-size: 70%;
			opacity: 0.55;
		}
		&.level-3,
		&.level-4,
		&.level-5,
		&.level-6,
		&.level-7,
		&.level-8,
		&.level-9,
		&.level-10 {
			padding: 0.25rem 0.5rem 0.25rem 0.5rem;
		}
	}
`
const StyledLink = styled(Link)`
	color: var(--text-color-light);
	font-weight: var(--headline-normal-font-weight);
	text-decoration: none;
`

export const Tags = () => {
	const [tags, setTags] = useState<{ name: string; count: number }[]>([])

	useEffect(() => {
		fetch('/data/photos-tags.json')
			.then((res) => res.json())
			.then((tags) => {
				setTags(
					Object.entries(tags)
						.map(([name, photos]) => ({
							name,
							count: (photos as string[]).length,
						}))
						.sort(({ count: c1 }, { count: c2 }) => c2 - c1),
				)
			})
			.catch(() => {
				console.error(`Failed to load /data/photos-tags.json!`)
			})
	}, [])

	return (
		<TagsNav>
			<ul>
				{tags.map(({ name, count }, k, tags) => {
					const level = 10 - Math.floor(((tags.length - k) / tags.length) * 9)
					return (
						<li class={`level-${level}`}>
							<StyledLink href={`/tag/${encodeURIComponent(name)}`}>
								{name}
							</StyledLink>
							{count > 1 && <span>{count}</span>}
						</li>
					)
				})}
			</ul>
		</TagsNav>
	)
}
