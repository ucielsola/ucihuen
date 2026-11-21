import type { APIRoute } from 'astro';
import { getReviews } from '../../lib/services/reviews';

// Keep the homepage static while allowing this endpoint to run on Vercel at request time.
export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		const { reviews } = await getReviews();

		return new Response(JSON.stringify({ reviews }), {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=60'
			}
		});
	} catch (error) {
		console.error('Unable to load Google reviews:', error);
		return new Response(JSON.stringify({ reviews: [] }), {
			status: 502,
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
		});
	}
};
