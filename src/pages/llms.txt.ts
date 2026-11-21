import type { APIRoute } from 'astro';
import { llmsMarkdown } from '../lib/agentMarkdown';

export const GET: APIRoute = () =>
	new Response(llmsMarkdown, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
