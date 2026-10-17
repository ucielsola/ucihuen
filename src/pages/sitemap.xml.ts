import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/config';

interface Page {
	path: string;
	es: string;
	en: string;
	pt: string;
}

const pages: Page[] = [
	{ path: '/', es: '/', en: '/en/', pt: '/pt/' },
	{ path: '/galeria', es: '/galeria', en: '/en/galeria', pt: '/pt/galeria' },
	{ path: '/paseos', es: '/paseos', en: '/en/paseos', pt: '/pt/paseos' },
	...['about', 'contact', 'privacy', 'agents'].map((path) => ({
		path: `/${path}`,
		es: `/${path}`,
		en: `/en/${path}`,
		pt: `/pt/${path}`
	}))
];

export const GET: APIRoute = () => {
	const urls = pages
		.map(
			(p) => `
  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${SITE_URL}${p.es}" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${p.en}" />
    <xhtml:link rel="alternate" hreflang="pt" href="${SITE_URL}${p.pt}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${p.path}" />
  </url>`
		)
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}
</urlset>`;

	return new Response(xml.trim(), {
		headers: { 'Content-Type': 'application/xml' }
	});
};
