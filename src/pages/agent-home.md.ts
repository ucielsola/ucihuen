import type { APIRoute } from 'astro';
import { agentHomeMarkdown } from '../lib/agentMarkdown';

export const GET: APIRoute = () =>
	new Response(agentHomeMarkdown, {
		headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
	});
