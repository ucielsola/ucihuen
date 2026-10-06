<script lang="ts">
	import { Swiper, SwiperSlide } from 'swiper/svelte';
	import { Autoplay } from 'swiper/core';
	import 'swiper/css';
	import ReviewCard from './ReviewCardIsland.svelte';

	interface Review {
		autor_name: string;
		autor_image: string | null;
		review_text: string;
		review_link: string;
		review_rating: string;
		review_date: string;
	}

	let {
		locale = 'es',
		loadingText = 'Loading reviews…',
		unavailableText = 'Reviews are temporarily unavailable.'
	}: { locale?: string; loadingText?: string; unavailableText?: string } = $props();

	const BATCH = 8;
	let reviews = $state<Review[]>([]);
	let loaded = $state(BATCH);
	let loading = $state(true);
	let failed = $state(false);

	$effect(() => {
		let cancelled = false;

		fetch('/api/reviews')
			.then(async (response) => {
				if (!response.ok) throw new Error('Unable to load reviews');
				return (await response.json()) as { reviews: Review[] };
			})
			.then((data) => {
				if (!cancelled) reviews = data.reviews;
			})
			.catch(() => {
				if (!cancelled) failed = true;
			})
			.finally(() => {
				if (!cancelled) loading = false;
			});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (loaded < reviews.length) {
			const timer = setTimeout(() => {
				loaded = Math.min(loaded + BATCH, reviews.length);
			}, 800);
			return () => clearTimeout(timer);
		}
	});
</script>

{#if reviews.length}
	<div id="swiper-container">
		<Swiper
			modules={[Autoplay]}
			autoplay={{
				disableOnInteraction: false,
				pauseOnMouseEnter: true
			}}
			loop={true}
			speed={900}
			centeredSlides={true}
			slidesPerView={1.105}
			spaceBetween={10}
			breakpoints={{
				1024: {
					slidesPerView: 3.2,
					spaceBetween: 20
				},
				1280: {
					slidesPerView: 3.5
				},
				1440: {
					slidesPerView: 3.9
				},
				1600: {
					slidesPerView: 4.3
				},
				1700: {
					slidesPerView: 4.95
				}
			}}
		>
			{#each reviews as rev, i}
				<SwiperSlide>
					<ReviewCard
						name={rev.autor_name}
						avatarUrl={rev.autor_image}
						rating={rev.review_rating}
						date={rev.review_date}
						text={rev.review_text}
						link={rev.review_link}
						imageLoaded={i < loaded}
						{locale}
					/>
				</SwiperSlide>
			{/each}
		</Swiper>
	</div>
{:else if loading}
	<p class="reviews-status" aria-live="polite">{loadingText}</p>
{:else if failed}
	<p class="reviews-status" role="status">{unavailableText}</p>
{/if}

<style>
	.reviews-status {
		margin: 0;
		padding: 1rem var(--padding-inline);
		text-align: center;
		color: var(--base-color);
	}
</style>
