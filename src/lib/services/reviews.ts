import { getSecret } from 'astro:env/server';

const CACHE_TTL_MS = 10 * 60 * 1000;
const API_URL = 'https://api.uciel.xyz/api/google-reviews/reviews';

interface Review {
	autor_name: string;
	autor_image: string | null;
	review_text: string;
	review_link: string;
	review_rating: string;
	review_date: string;
}

interface ReviewsResult {
	reviews: Review[];
}

interface Cache {
	data: ReviewsResult | null;
	expires: number;
}

let cache: Cache = { data: null, expires: 0 };

function formatIsoDate(iso: string): string {
	const d = new Date(iso);
	const dd = String(d.getDate()).padStart(2, '0');
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const yyyy = d.getFullYear();
	return `${dd}/${mm}/${yyyy}`;
}

interface ApiReview {
	review_id: string;
	author: string;
	author_image: string | null;
	rating: number;
	snippet: string;
	iso_date: string;
	review_url: string | null;
}

interface ReviewsResponse {
	reviews: ApiReview[];
	count: number;
	timestamp: string;
}

function mapApiReview(r: ApiReview): Review {
	return {
		autor_name: r.author,
		autor_image: r.author_image,
		review_text: r.snippet,
		review_link: r.review_url ?? '',
		review_rating: String(r.rating),
		review_date: formatIsoDate(r.iso_date)
	};
}

async function fetchApiReviews(): Promise<Review[]> {
	const apiKey = getSecret('UCIEL_API_KEY');
	if (!apiKey) throw new Error('UCIEL_API_KEY is missing');

	const res = await fetch(API_URL, {
		headers: { Authorization: `Bearer ${apiKey}` }
	});
	if (!res.ok) throw new Error(`Google reviews API returned HTTP ${res.status}`);

	const data: ReviewsResponse = await res.json();
	return data.reviews.map(mapApiReview);
}

export async function getReviews(): Promise<ReviewsResult> {
	const now = Date.now();
	if (cache.data && cache.expires > now) return cache.data;

	const reviews = await fetchApiReviews();
	const filtered = reviews.filter((r) => r.review_text && Number(r.review_rating) >= 4);

	const result: ReviewsResult = { reviews: filtered };
	cache = { data: result, expires: now + CACHE_TTL_MS };
	return result;
}

export type { Review, ReviewsResult };
