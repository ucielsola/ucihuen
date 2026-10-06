<script lang="ts">
	import { getWeatherDescriptionKey, getWeather } from '$lib/services/weather';
	import { getThemeByTime } from '$lib/utils/weatherTheme';
	import { getMessages } from '$lib/messages';
	import { X } from 'lucide-svelte';
	import WeatherSkeleton from './weather/WeatherSkeleton.svelte';
	import WeatherHeader from './weather/WeatherHeader.svelte';
	import WeatherIcon from './weather/WeatherIcon.svelte';
	import TemperatureDisplay from './weather/TemperatureDisplay.svelte';
	import WeatherStats from './weather/WeatherStats.svelte';
	import ForecastToggle from './weather/ForecastToggle.svelte';
	import ForecastContainer from './weather/ForecastContainer.svelte';

	let { locale = 'es' } = $props();
	const m = getMessages(locale);

	let weather = $state<Awaited<ReturnType<typeof getWeather>>>(null);
	let info = $derived(
		weather ? getWeatherDescriptionKey(weather.current?.weather_code || 0) : null
	);
	let isNight = $derived(weather ? !weather.current?.is_day : true);
	let expanded = $state(false);
	let hovered = $state(false);
	let theme = $state(getThemeByTime());
	let widgetElement: HTMLElement | undefined = $state();

	$effect(() => {
		getWeather().then((data) => {
			weather = data;
		});
	});

	$effect(() => {
		if (widgetElement) {
			widgetElement.setAttribute('data-theme', theme);
		}
	});
</script>

<div class="weather-reserved">
	{#if !weather}
		<WeatherSkeleton />
	{/if}

	{#if weather && info}
		<button
			class="widget"
			aria-label={m['weather_aria_label']}
			onmouseenter={() => (hovered = true)}
			onmouseleave={() => (hovered = false)}
			onclick={() => (expanded = true)}
			bind:this={widgetElement}
		>
			<div class="glow" class:glow-active={hovered}></div>

			<WeatherHeader {info} {m} />

			<div class="temp-section">
				<div class="temp-row">
					<WeatherIcon {isNight} {hovered} />
					<TemperatureDisplay
						temp={weather.current.temp}
						apparentTemp={weather.current.apparent_temp}
						{m}
					/>
				</div>
			</div>

			<div class="divider"></div>

			<WeatherStats
				windSpeed={weather.current.wind_speed}
				precipitation={weather.current.precipitation}
				{m}
			/>
		</button>

		<ForecastToggle {expanded} {theme} onToggle={() => (expanded = !expanded)} {m} />

		{#if expanded}
			<button
				class="backdrop"
				onclick={() => (expanded = false)}
				onkeydown={(e) => e.key === 'Escape' && (expanded = false)}
				aria-label={m['weather_close']}
			></button>
			<div class="modal" data-theme={theme}>
				<div class="modal-content">
					<div class="modal-header">
						<h2 class="modal-title">{m['weather_forecast_title']}</h2>
						<button
							class="modal-close"
							onclick={() => (expanded = false)}
							aria-label={m['weather_close']}
						>
							<X size={20} />
						</button>
					</div>
					<ForecastContainer forecast={weather.forecast} />
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.weather-reserved {
		min-height: 23rem;
	}

	.widget {
		position: relative;
		overflow: hidden;
		width: 100%;
		max-width: 340px;
		margin-inline: auto;
		border-radius: var(--weather-radius-lg);
		background-color: var(--weather-bg);
		border: 1px solid var(--weather-border);
		padding: 24px;
		color: var(--weather-text-light);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.3),
			0 1px 2px rgba(0, 0, 0, 0.2);
		transition:
			transform var(--weather-duration) var(--easing),
			box-shadow var(--weather-duration) var(--easing);
		display: flex;
		flex-direction: column;
		gap: var(--weather-spacing-lg);
		cursor: pointer;
	}

	.widget:hover {
		transform: var(--weather-transform);
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.4),
			0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.glow {
		position: absolute;
		top: -40px;
		right: -40px;
		width: 120px;
		height: 120px;
		border-radius: 9999px;
		background: radial-gradient(circle, rgba(165, 180, 252, 0.12) 0%, transparent 70%);
		transition: opacity var(--weather-duration) var(--easing);
		opacity: 0.5;
		pointer-events: none;
	}

	.glow-active {
		opacity: 1;
	}

	.temp-section {
		display: flex;
		flex-direction: column;
		gap: var(--weather-spacing-sm);
	}

	.temp-row {
		display: flex;
		align-items: center;
		gap: var(--weather-spacing-md);
	}

	.divider {
		height: 1px;
		background: linear-gradient(to right, transparent, var(--weather-divider), transparent);
	}

	@media screen and (min-width: 1024px) {
		.widget {
			max-width: 400px;
		}
	}

	.backdrop {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 9998;
		animation: fadeIn 0.2s ease;
		cursor: pointer;
	}

	.modal {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: 20px;
		animation: slideUp 0.3s ease;

		pointer-events: none;
	}

	.modal-content {
		background-color: var(--weather-bg);
		border-radius: var(--weather-radius-lg);
		border: 1px solid var(--weather-border-hover);
		padding: 24px;
		max-width: 800px;
		max-height: 90vh;
		overflow-y: auto;

		pointer-events: auto;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--weather-spacing-md);
	}

	.modal-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--weather-text-primary);
		margin: 0;
	}

	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background-color: var(--weather-toggle-bg);
		border: none;
		color: var(--weather-text-secondary);
		cursor: pointer;
		transition: all var(--weather-duration) var(--easing);
	}

	.modal-close:hover {
		background-color: var(--weather-toggle-bg-hover);
		color: var(--weather-text-primary);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
