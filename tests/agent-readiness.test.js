import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('homepage offers Organization and LodgingBusiness identity data', async () => {
	const html = await read('../dist/client/index.html');
	const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
	const schemas = blocks.map(([, json]) => JSON.parse(json));
	assert.match(html, /<h1\b/);
	assert.match(html, /<html lang="es"/);
	assert.match(html, /<link rel="canonical"/);
	assert.match(html, /<meta property="og:image"/);
	assert.match(html, /<meta property="og:type"/);
	assert.ok(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').length > 500);
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
		for (const page of ['about', 'contact', 'privacy', 'agents']) {
			const prefix = locale === 'es' ? '' : `${locale}/`;
			const html = await read(`../dist/client/${prefix}${page}/index.html`);
			const visibleText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
			assert.ok(visibleText.length >= 500, `${locale}/${page} has at least 500 characters`);
		}
	}
});

test('agent guidance and developer resources describe available tools and their limits', async () => {
	const guidance = await read('../dist/client/llms.txt');
	const agentGuide = await read('../dist/client/agents/index.html');
	assert.match(guidance, /Cuándo y cómo usar esta información/);
	assert.match(guidance, /no consulta inventario ni confirma reservas/);
	assert.match(guidance, /When to use this site/);
	assert.match(guidance, /ucihuen\.com\.ar\/agents/);
	assert.match(agentGuide, /get_stay_information/);
	assert.match(agentGuide, /get_booking_options/);
	assert.match(agentGuide, /find_local_excursions/);
	assert.match(agentGuide, /de solo lectura|read-only/);
});

test('Vercel config preserves Astro-generated routing and function routes', async () => {
	const config = JSON.parse(await read('../vercel.json'));
	assert.deepEqual(config, { trailingSlash: false, cleanUrls: true });
	const output = JSON.parse(await read('../.vercel/output/config.json'));
	assert.ok(output.routes.some((route) => route.handle === 'filesystem'));
	assert.ok(output.routes.some((route) => route.src === '^/api/reviews/?$'));
});

test('sitemap includes localized trust pages', async () => {
	const sitemap = await read('../dist/client/sitemap.xml');
	for (const path of [
		'/about',
		'/contact',
		'/privacy',
		'/agents',
		'/en/about',
		'/en/agents',
		'/pt/privacy',
		'/pt/agents'
	]) {
		assert.ok(sitemap.includes(`https://ucihuen.com.ar${path}`), `sitemap includes ${path}`);
	}
});
