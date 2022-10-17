import { Link } from 'preact-router'
import styled from 'styled-components'

const Header = styled.header`
	color: var(--text-color-light);
	font-size: 12px;
	font-family: var(--headline-font-family);
	font-weight: var(--headline-normal-font-weight);
	padding: 0 1rem;
	h1 {
		font-size: inherit;
		font-weight: inherit;
		strong {
			font-weight: var(--headline-bold-font-weight);
			text-transform: uppercase;
		}
	}
	a {
		color: inherit;
		text-decoration: none;
	}
	nav {
		> a + a {
			:before {
				content: '·';
				padding: 0.5rem;
			}
		}
	}
	section {
		display: flex;
		justify-content: space-between;
		margin: 1rem auto;
		max-width: var(--content-max-width);
	}
`

const Subtitle = styled.span`
	display: none;
	&:before {
		content: ' · ';
	}
	@media (min-width: ${(props) => props.theme.mobileBreakpoint}) {
		display: inline;
	}
`

export const Navigation = () => (
	<Header>
		<section>
			<h1>
				<a href={'https://coderbyheart.com'} rel="me">
					<strong>Markus Tacker</strong>
				</a>
				<Subtitle>Photos</Subtitle>
			</h1>
			<nav>
				<Link href="/">Albums</Link>
				<Link href="/photos">All photos</Link>
				<Link href="/tags">Tags</Link>
			</nav>
		</section>
	</Header>
)
