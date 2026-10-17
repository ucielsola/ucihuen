import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('homepage offers Organization and LodgingBusiness identity data', async () => {
	const html = await read('../dist/client/index.html');
	const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
	const schemas = blocks.map(([, json]) => JSON.parse(json));
	const organization = schemas.find((schema) => schema['@type'] === 'Organization');
	assert.ok(organization, 'homepage includes Organization JSON-LD');
	assert.equal(organization.name, 'Cabañas Ucihuen');
	assert.ok(organization.contactPoint.telephone);
	assert.ok(organization.contactPoint.contactType);
	assert.equal(organization.address['@type'], 'PostalAddress');
	assert.ok(schemas.some((schema) => schema['@type'] === 'LodgingBusiness'));
});

test('trust pages are published in all locales with substantial translated content', async () => {
	for (const locale of ['es', 'en', 'pt']) {
		for (const page of ['about', 'contact', 'privacy']) {
			const prefix = locale === 'es' ? '' : `${locale}/`;
			const html = await read(`../dist/client/${prefix}${page}/index.html`);
			const visibleText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
			assert.ok(visibleText.length >= 500, `${locale}/${page} has at least 500 characters`);
		}
	}
});

test('agent guidance and Markdown error body link to useful site resources', async () => {
	const guidance = await read('../dist/client/llms.txt');
	const home = await read('../dist/client/agent-home.md');
	const notFound = await read('../dist/client/404.md');
	assert.match(guidance, /Cuándo y cómo usar esta información/);
	assert.match(guidance, /no consulta inventario ni confirma reservas/);
	assert.match(home, /Cabañas Ucihuen/);
	assert.match(notFound, /no existe/);
	assert.match(notFound, /llms\.txt/);
});

test('Vercel routes negotiate Markdown on the homepage and return Markdown 404s', async () => {
	const config = JSON.parse(await read('../vercel.json'));
	const markdownHome = config.routes[0];
	assert.equal(markdownHome.src, '^/$');
	assert.equal(markdownHome.has[0].key, 'Accept');
	assert.match(markdownHome.has[0].value.pre, /text\/markdown/);
	assert.equal(markdownHome.dest, '/agent-home.md');
	assert.equal(markdownHome.headers['Content-Type'], 'text/markdown; charset=utf-8');
	assert.equal(markdownHome.headers.Vary, 'Accept');
	assert.equal(config.routes[1].src, '^/$');
	assert.equal(config.routes[1].headers.Vary, 'Accept');
	assert.equal(config.routes[2].handle, 'filesystem');
	assert.ok(
		config.routes.some((route) => route.src === '^/api/reviews/?$' && route.dest === '_render')
	);
	const markdown404 = config.routes.find((route) => route.dest === '/404.md');
	assert.equal(markdown404.status, 404);
	assert.equal(markdown404.headers['Content-Type'], 'text/markdown; charset=utf-8');
	assert.equal(config.routes.at(-1).status, 404);
});

test('sitemap includes localized trust pages', async () => {
	const sitemap = await read('../dist/client/sitemap.xml');
	for (const path of ['/about', '/contact', '/privacy', '/en/about', '/pt/privacy']) {
		assert.ok(sitemap.includes(`https://ucihuen.com.ar${path}`), `sitemap includes ${path}`);
	}
});
