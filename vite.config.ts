import preact from '@preact/preset-vite'
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'

const { version, homepage } = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'),
)

process.env.PUBLIC_VERSION ?? version ?? Date.now()
process.env.PUBLIC_HOMEPAGE = homepage

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	base: `${(process.env.BASE_URL ?? '').replace(/\/+$/, '')}/`,
	preview: {
		host: 'localhost',
		port: 8080,
	},
	server: {
		host: 'localhost',
		port: 8080,
	},
	resolve: {},
	build: {
		outDir: './build',
	},
	envPrefix: 'PUBLIC_',
	esbuild: {
		// See https://github.com/vitejs/vite/issues/8644
		logOverride: { 'this-is-undefined-in-esm': 'silent' },
	},
})
