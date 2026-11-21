import type { APIRoute } from 'astro';
import { llmsFullMarkdown } from '../lib/agentMarkdown';

export const GET: APIRoute = () =>
	new Response(llmsFullMarkdown, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
