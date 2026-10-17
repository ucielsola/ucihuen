import { defineMiddleware } from 'astro:middleware';
import agentHomeMarkdown from './content/agent-home.md?raw';
import { markdownResponse } from './lib/contentNegotiation.mjs';

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.url.pathname !== '/') return next();

	const markdown = markdownResponse(context.request.headers.get('accept'), agentHomeMarkdown);
	if (markdown) return markdown;

	const response = await next();
	const vary = response.headers.get('Vary');
	if (!vary || vary.toLowerCase() === 'accept-encoding') {
		response.headers.set('Vary', vary ? `${vary}, Accept` : 'Accept');
	} else if (
		!vary
			.toLowerCase()
			.split(',')
			.map((value) => value.trim())
			.includes('accept')
	) {
		response.headers.set('Vary', `${vary}, Accept`);
	}
	response.headers.set(
		'Cache-Control',
		'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
	);
	return response;
});
