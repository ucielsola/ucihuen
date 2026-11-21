import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { dev } from 'astro';
import { markdownResponse } from '../src/lib/contentNegotiation.mjs';

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8');
const built = (path) => read(`../dist/client/${path}`);
const site = 'https://ucihuen.com.ar';
const locales = ['es', 'en', 'pt'];
const homepage = await renderProductionHomepage();

async function renderProductionHomepage() {
	const { default: handler } =
		await import('../.vercel/output/functions/_render.func/dist/server/entry.mjs');
	const server = createServer(handler);
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	try {
		const url = `http://127.0.0.1:${server.address().port}/`;
		const html = await fetch(url, { headers: { Accept: 'text/html' } });
		const markdown = await fetch(url, { headers: { Accept: 'text/markdown' } });
		return {
			html: await html.text(),
			markdown: await markdown.text(),
			variesByAccept: /\bAccept\b/i.test(html.headers.get('Vary') || ''),
			htmlStatus: html.status,
			markdownStatus: markdown.status,
			markdownType: markdown.headers.get('Content-Type')
		};
	} finally {
		server.close();
	}
}

function htmlFor(path) {
	return path === '/' ? homepage.html : built(`${path.slice(1)}/index.html`);
}

function markdownLinks(markdown) {
	return [...markdown.matchAll(/\[[^\]\n]+\]\(([^\s)]+)\)/g)].map(([, href]) => href);
}

function htmlText(html) {
	return html.replace(/<script\b[^>]*>.*?<\/script>/gs, '').replace(/<[^>]+>/g, ' ');
}

test('homepage offers Organization and LodgingBusiness identity data', async () => {
	const html = await read('../dist/client/en/index.html');
	const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
	const schemas = blocks.map(([, json]) => JSON.parse(json));
	assert.match(html, /<h1\b/);
	assert.match(html, /<html lang="en"/);
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
	for (const locale of locales) {
		for (const page of ['about', 'contact', 'privacy', 'agents']) {
			const prefix = locale === 'es' ? '' : `${locale}/`;
			const html = await read(`../dist/client/${prefix}${page}/index.html`);
			const visibleText = htmlText(html).replace(/\s+/g, ' ');
			assert.ok(visibleText.length >= 500, `${locale}/${page} has at least 500 characters`);
		}
	}
});

test('llms.txt follows the proposal and llms-full.txt has a single, ordered hierarchy', async () => {
	const llms = await built('llms.txt');
	const full = await built('llms-full.txt');
	for (const markdown of [llms, full]) {
		assert.match(markdown, /^# Cabañas Ucihuen\n\n> [^\n]+\n\n/);
		assert.equal([...markdown.matchAll(/^# /gm)].length, 1);
		assert.equal(markdown.match(/^> /gm).length, 1);
		assert.ok(markdownLinks(markdown).length >= 10);
	}

	const [context, ...sections] = llms.split(/^## /m);
	assert.match(context, /tarifas y disponibilidad/);
	assert.doesNotMatch(context.slice(1), /^#+ /m);
	assert.ok(sections.length >= 3);
	for (const section of sections) {
		const [heading, ...links] = section.trimEnd().split('\n');
		assert.ok(heading);
		assert.equal(links.shift(), '');
		assert.ok(links.length > 0);
		for (const line of links) assert.match(line, /^- \[[^\]]+\]\(https:\/\/[^\s)]+\): .+$/);
	}
	assert.match(llms, /^## Optional$/m);

	let hasSection = false;
	for (const [, hashes] of full.matchAll(/^(#+) .+/gm)) {
		assert.ok(hashes.length <= 3);
		if (hashes.length === 2) hasSection = true;
		if (hashes.length === 3) assert.ok(hasSection, 'H3 follows an H2');
	}
	assert.equal([...full.matchAll(/^### \d+\. /gm)].length, 10);
	for (const heading of [
		'Cabañas',
		'Ubicación y acceso',
		'Tarifas, reservas y contacto',
		'Reseñas de huéspedes',
		'Preguntas frecuentes',
		'Idiomas y documentación'
	]) {
		assert.ok(full.includes(`## ${heading}\n`));
	}
});

test('Markdown links are absolute HTTPS URLs and resolve to production files and anchors on site', async () => {
	for (const file of ['llms.txt', 'llms-full.txt', 'agent-home.md']) {
		const markdown = await built(file);
		assert.equal(await read(`../.vercel/output/static/${file}`), markdown);
		for (const href of new Set(markdownLinks(markdown))) {
			const url = new URL(href);
			assert.equal(url.protocol, 'https:');
			assert.ok(url.hostname.includes('.'));
			assert.equal(url.username + url.password, '');
			if (url.origin !== site) continue;
			const { pathname, hash } = url;
			assert.ok(pathname === '/' || !pathname.endsWith('/'), `canonical URL for ${href}`);
			if (pathname.includes('.')) {
				assert.ok(await built(pathname.slice(1)));
			} else {
				const html = await htmlFor(pathname);
				assert.ok(html.includes(`<link rel="canonical" href="${site}${pathname}"`), href);
				if (hash) assert.ok(html.includes(`id="${hash.slice(1)}"`), `anchor for ${href}`);
			}
		}
	}
});

test('Markdown negotiation varies production homepage responses and leaves normal HTML available', async () => {
	const body = await built('agent-home.md');
	assert.equal(homepage.htmlStatus, 200);
	assert.equal(homepage.markdownStatus, 200);
	assert.equal(homepage.markdownType, 'text/markdown; charset=utf-8');
	assert.equal(homepage.markdown, body);
	assert.equal(homepage.variesByAccept, true);
	const response = markdownResponse('text/html, text/markdown;q=0.9', body);
	assert.ok(response);
	assert.equal(response.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
	assert.equal(response.headers.get('Vary'), 'Accept');
	assert.equal(await response.text(), body);
	assert.equal(markdownResponse('text/markdown;q=0, text/html', body), null);
	assert.equal(markdownResponse('text/html', body), null);
	const notFound = markdownResponse(
		'text/markdown',
		'# Not found\n\nSee [llms.txt](https://ucihuen.com.ar/llms.txt).',
		404
	);
	assert.equal(notFound.status, 404);
	assert.equal(notFound.headers.get('Cache-Control'), 'no-store');
});

test('Vercel config preserves Astro-generated homepage and function routing', async () => {
	const config = JSON.parse(await read('../vercel.json'));
	assert.deepEqual(config, { trailingSlash: false, cleanUrls: true });
	const output = JSON.parse(await read('../.vercel/output/config.json'));
	assert.ok(output.routes.some((route) => route.handle === 'filesystem'));
	assert.ok(output.routes.some((route) => route.src === '^/api/reviews/?$'));
	assert.ok(output.routes.some((route) => route.src === '^/$' && route.dest === '_render'));
	assert.ok(
		output.routes.some((route) => route.src === '^(?:/(.*?))?/?$' && route.dest === '_render')
	);
});

test('sitemap lists all localized canonicals with reciprocal hreflang, and robots allows crawling', async () => {
	const sitemap = await built('sitemap.xml');
	const urls = new Map(
		[...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(.*?)<\/url>/gs)].map(
			([, canonical, links]) => [canonical, links]
		)
	);
	assert.equal(urls.size, 21);
	const robots = await built('robots.txt');
	assert.match(robots, /^User-agent: \*\nAllow: \/$/m);
	assert.ok(robots.includes(`Sitemap: ${site}/sitemap.xml`));

	for (const page of ['/', '/galeria', '/paseos', '/about', '/contact', '/privacy', '/agents']) {
		const paths = locales.map((locale) =>
			locale === 'es' ? page : `/${locale}${page === '/' ? '' : page}`
		);
		const variants = [...locales, 'x-default'].map(
			(locale, index) => `rel="alternate" hreflang="${locale}" href="${site}${paths[index % 3]}"`
		);
		for (const [index, path] of paths.entries()) {
			const html = await htmlFor(path);
			const attributes = urls.get(site + path);
			assert.ok(attributes, `sitemap includes ${path}`);
			assert.ok(html.includes(`<html lang="${locales[index]}"`), path);
			assert.ok(html.includes(`<link rel="canonical" href="${site}${path}"`), path);
			assert.ok(html.includes('<link rel="describedby" href="/llms.txt"'), path);
			assert.equal(
				html.includes('rel="alternate" type="text/markdown" href="/agent-home.md"'),
				path === '/'
			);
			for (const variant of variants) {
				assert.ok(attributes.includes(variant), path);
				assert.ok(html.includes(variant), path);
			}
			const prefix = index === 0 ? '' : `/${locales[index]}`;
			assert.ok(html.includes(`href="${prefix}/agents"`), `footer from ${path}`);
		}
	}
});

test('booking and cabin facts agree across the published pages and references', async () => {
	const llms = await built('llms.txt');
	const full = await built('llms-full.txt');
	const booking = [
		'https://www.booking.com/hotel/ar/cabana-ucihuen.es-ar.html',
		'https://www.airbnb.com.ar/rooms/1320462855669343724',
		'https://wa.link/hfh2e3'
	];
	const phone = '+54 9 11 3158-6242';
	for (const doc of [llms, full, homepage.markdown]) {
		for (const url of booking) assert.ok(markdownLinks(doc).includes(url));
		assert.ok(doc.includes(phone));
	}

	const spanish = JSON.parse(await read('../messages/es.json'));
	for (const key of [
		'faq_location_answer',
		'faq_bedrooms_answer',
		'faq_pets_answer',
		'faq_breakfast_answer',
		'faq_parking_answer',
		'home_amenities_desc'
	]) {
		assert.ok(full.includes(spanish[key]), key);
	}
	assert.match(full, /### Cabaña para 7 personas\n\nDos plantas\. 2 Habitaciones/);
	assert.match(full, /### Cabaña para 4 personas\n\nUna planta\. Cocina-Comedor/);
	assert.match(full, /a menos de 3 km del Parque Nacional Lago Puelo/);
	assert.match(full, /El sitio no publica tarifas ni un calendario propio/);
	assert.match(full, /Airbnb enlazado corresponde a la cabaña para 4 personas/);
	for (let i = 1; i <= 10; i++) {
		assert.ok(full.includes(`### ${i}. ${spanish[`excursion_${i}_title`]}`));
		assert.ok(full.includes(spanish[`excursion_${i}_desc`]));
	}

	for (const locale of locales) {
		const prefix = locale === 'es' ? '' : `/${locale}`;
		const m = JSON.parse(await read(`../messages/${locale}.json`));
		const home = await htmlFor(prefix || '/');
		const contact = await htmlFor(prefix + '/contact');
		const gallery = await htmlFor(prefix + '/galeria');
		for (const html of [home, contact]) {
			for (const url of booking) assert.ok(html.includes(`href="${url}"`), url);
			assert.ok(htmlText(html).includes(phone));
		}
		assert.ok(htmlText(home).includes(m.faq_bedrooms_answer));
		assert.ok(htmlText(home).includes(m.faq_capacity_answer));
		const bedrooms = m.room_bedrooms_2;
		const layouts = [
			home.match(/href="[^"]*#cab-1"[^>]*>(.*?)<\/a>/s)?.[1],
			home.match(/href="[^"]*#cab-2"[^>]*>(.*?)<\/a>/s)?.[1],
			gallery.match(/<article id="cab-1"[^>]*>.*?<h3[^>]*>(.*?)<\/h3>/s)?.[1],
			gallery.match(/<article id="cab-2"[^>]*>.*?<h3[^>]*>(.*?)<\/h3>/s)?.[1]
		];
		for (const [index, layout] of layouts.entries()) {
			assert.ok(layout, locale);
			assert.equal(layout.includes(bedrooms), index % 2 === 0);
			assert.ok(!layout.includes(m.room_bedrooms_1));
		}
	}
});

function webMcpScript(html) {
	const scripts = [...html.matchAll(/<script>(.*?)<\/script>/gs)];
	const script = scripts.find(([, source]) => source.includes('const agentSiteData ='))?.[1];
	assert.ok(script, 'built page contains the WebMCP script');
	return script;
}

async function registeredTools(script, { legacy = false, reject } = {}) {
	const tools = new Map();
	const modelContext = {
		async registerTool(tool) {
			if (tool.name === reject) throw new Error('Registration rejected');
			tools.set(tool.name, tool);
		}
	};
	runInNewContext(script, {
		document: legacy ? {} : { modelContext },
		navigator: legacy ? { modelContext } : {}
	});
	await new Promise(setImmediate);
	return tools;
}

// Check the JSON Schema keywords used by the tools against actual callback results.
function assertSchema(schema, value) {
	const type =
		value === null
			? 'null'
			: Array.isArray(value)
				? 'array'
				: Number.isInteger(value)
					? 'integer'
					: typeof value;
	assert.ok([schema.type].flat().includes(type), `expected ${schema.type}, got ${type}`);
	if (type === 'object') {
		for (const key of schema.required) assert.ok(Object.hasOwn(value, key), key);
		assert.equal(schema.additionalProperties, false);
		for (const [key, field] of Object.entries(value)) {
			assert.ok(Object.hasOwn(schema.properties, key), key);
			assertSchema(schema.properties[key], field);
		}
	}
	if (type === 'array') for (const item of value) assertSchema(schema.items, item);
	if (type === 'string' && schema.format === 'uri') {
		const url = new URL(value);
		assert.equal(url.protocol, 'https:');
		assert.equal(url.username + url.password, '');
	}
}

test('built WebMCP callbacks match the localized guide and publish read-only site data', async () => {
	for (const locale of locales) {
		const path = locale === 'es' ? '' : `/${locale}`;
		const m = JSON.parse(await read(`../messages/${locale}.json`));
		const html = await htmlFor(path + '/agents');
		const tools = await registeredTools(webMcpScript(html));
		const names = ['get_stay_information', 'get_booking_options', 'find_local_excursions'];
		assert.deepEqual([...tools.keys()], names);
		for (const tool of tools.values()) {
			assert.ok(html.includes(`<code>${tool.name}</code>`));
			assert.ok(htmlText(html).includes(tool.description));
			assert.deepEqual(JSON.parse(JSON.stringify(tool.annotations)), { readOnlyHint: true });
			assert.equal(tool.inputSchema.type, 'object');
			assert.equal(tool.inputSchema.additionalProperties, false);
		}
		assert.ok(html.includes('href="/llms.txt"') && html.includes('href="/llms-full.txt"'));
		const [stay, booking, excursions] = names.map((name) => tools.get(name));
		const topics = ['all', 'location', 'capacity', 'amenities', 'nearby'];
		assert.deepEqual(Array.from(stay.inputSchema.properties.topic.enum), topics);
		assert.equal(stay.inputSchema.required.length, 0);
		assertSchema(stay.outputSchema, await stay.execute({}));
		for (const topic of topics) {
			const result = await stay.execute({ topic });
			assertSchema(stay.outputSchema, result);
			assert.ok(Object.hasOwn(result, topic === 'all' ? 'name' : topic));
			assert.equal(result.source, site + (path || '/'));
		}
		const capacity = await stay.execute({ topic: 'capacity' });
		assert.deepEqual(
			Array.from(capacity.cabins, (cabin) => [cabin.capacity, cabin.bedrooms]),
			[
				[7, 2],
				[4, null]
			]
		);
		assert.equal(capacity.bedroomNote, m.faq_bedrooms_answer);
		const amenities = await stay.execute({ topic: 'amenities' });
		assert.ok(amenities.amenityList.includes(m.amenity_pets));
		assert.ok(amenities.amenityList.includes(m.amenity_parking));
		assert.equal(amenities.amenities, m.home_amenities_desc);

		assert.deepEqual(Object.keys(booking.inputSchema.properties), []);
		const options = await booking.execute();
		assertSchema(booking.outputSchema, options);
		assert.equal(options.source, site + path + '/contact');
		assert.equal(options.message, m.booking_agent_availability);
		const contact = await htmlFor(path + '/contact');
		for (const { url, phone } of options.options) {
			assert.ok(contact.includes(`href="${url}"`));
			if (phone) assert.ok(htmlText(contact).includes(phone));
		}

		assert.deepEqual(Array.from(excursions.inputSchema.required), ['query']);
		assert.equal(excursions.inputSchema.properties.query.maxLength, 120);
		const found = await excursions.execute({ query: 'RÍO AZUL' });
		assertSchema(excursions.outputSchema, found);
		assert.equal(found.source, site + path + '/paseos');
		assert.ok(
			found.results.some(
				({ name, description }) =>
					name === m.excursion_2_title && description === m.excursion_2_desc
			)
		);
		for (const query of ['', '   ', 'not-a-local-activity', 'a'.repeat(130)]) {
			const empty = await excursions.execute({ query });
			assertSchema(excursions.outputSchema, empty);
			assert.equal(empty.results.length, 0);
			assert.ok(empty.query.length <= 120);
		}
	}
});

test('WebMCP is optional and each registration can fail independently', async () => {
	const script = webMcpScript(await htmlFor('/agents'));
	assert.doesNotThrow(() => runInNewContext(script, { document: {}, navigator: {} }));
	assert.doesNotThrow(() =>
		runInNewContext(script, { document: { modelContext: {} }, navigator: {} })
	);
	const legacy = await registeredTools(script, { legacy: true, reject: 'get_stay_information' });
	assert.deepEqual([...legacy.keys()], ['get_booking_options', 'find_local_excursions']);
});

test('public agent endpoints return the appropriate media types over local HTTP', async () => {
	const server = await dev({ logLevel: 'silent', server: { host: '127.0.0.1' } });
	try {
		const origin = `http://127.0.0.1:${server.address.port}`;
		for (const [path, expected] of Object.entries({
			'/llms.txt': 'text/plain',
			'/llms-full.txt': 'text/plain',
			'/agent-home.md': 'text/markdown',
			'/agents': 'text/html',
			'/robots.txt': 'text/plain',
			'/sitemap.xml': 'application/xml'
		})) {
			const response = await fetch(origin + path, { redirect: 'manual' });
			assert.equal(response.status, 200, path);
			assert.equal(response.headers.get('content-type')?.split(';')[0], expected, path);
			const body = await response.text();
			if (expected !== 'text/html') assert.equal(body, await built(path.slice(1)));
		}
	} finally {
		await server.stop();
	}
});
