import type { APIRoute } from 'astro';
import { locales, sitePageUrl } from '../lib/i18n';

const pages = ['/', '/galeria', '/paseos', '/about', '/contact', '/privacy', '/agents'];

export const GET: APIRoute = () => {
	const urls = pages.flatMap((path) => {
		const alternatives = [...locales, 'x-default']
			.map((locale) => {
				const href = sitePageUrl(path, locale === 'x-default' ? 'es' : locale);
				return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${href}" />`;
			})
			.join('\n');

		return locales.map(
			(locale) => `  <url>
    <loc>${sitePageUrl(path, locale)}</loc>
${alternatives}
  </url>`
		);
	});

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
};
