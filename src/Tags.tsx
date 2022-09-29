import { useEffect, useState } from 'preact/hooks'
import styled from 'styled-components'

import { Link } from 'preact-router'

const TagsNav = styled.nav`
	color: var(--text-color-light);
	font-family: var(--headline-font-family);

	text-align: center;

	span {
		opacity: 0.8;
		font-size: 60%;
		padding-left: 0.5rem;
	}

	ul {
		list-style: none;
		padding: 0;
	}
	li {
		margin: 0;
		display: inline-block;
		padding: 0 2rem 0 0;
	}
`
const StyledLink = styled(Link)`
	color: var(--text-color-light);
	font-weight: var(--headline-bold-font-weight);
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
	}, [])

	return (
		<TagsNav>
			<ul>
				{tags.map(({ name, count }, k, tags) => {
					const percentage = (tags.length - k) / tags.length
					return (
						<li style={{ fontSize: `${75 + percentage * 200}%` }}>
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
