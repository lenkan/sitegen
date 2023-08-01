all: install build

install:
	npm install

build:
	npx esbuild src/cli.ts --outfile=dist/cli.js --bundle --format=cjs --platform=node --packages=external
	npx esbuild src/api.mts --outfile=dist/api.cjs --bundle --format=cjs --platform=node --packages=external
	npx esbuild src/api.mts --outfile=dist/api.mjs --bundle --format=esm --platform=node --packages=external
	npx tsc src/api.mts --emitDeclarationOnly --declaration --outDir dist/

publish:
	npm publish --access=public

lint:
	npx eslint src

clean:
	rm -rf node_modules/
	rm -rf dist/
	echo "Clean done"
