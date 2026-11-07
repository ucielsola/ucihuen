'use strict';
// Maps JavaScript API y Places API (New) deben estar habilitadas para esta clave.
const root = document.getElementById('ucihuen-map');
const API_KEY = root.dataset.apiKey || '';
const translations = JSON.parse(root.dataset.labels);
// El ID predeterminado usa el estilo publicado para Ucihuen.
const MAP_ID = root.dataset.mapId || '37609b52e1099339a5834130';
const center = { lat: -42.066, lng: -71.614 };
const home = {
	id: 'home',
	name: 'Cabañas Ucihuen',
	query: 'Cabañas Ucihuen Los Alerces 880 Lago Puelo Chubut',
	icon: '🏡',
	category: 'home'
};
const locations = [
	{
		id: 'ypf',
		name: 'YPF',
		query: 'YPF estación de servicio Lago Puelo Chubut',
		icon: '⛽',
		category: 'services'
	},
	{
		id: 'anonima',
		name: 'Supermercado La Anónima',
		query: 'Supermercado La Anónima Lago Puelo Chubut',
		icon: '🛒',
		category: 'services'
	},
	{
		id: 'parque',
		name: 'Parque Nacional Lago Puelo',
		query: 'Parque Nacional Lago Puelo Chubut',
		icon: '🌲',
		category: 'nature'
	},
	{
		id: 'rio-azul',
		name: 'Pasarela Río Azul',
		query: 'Pasarela Río Azul Lago Puelo Chubut',
		icon: '🌊',
		category: 'nature'
	},
	{
		id: 'cayun',
		name: 'Balneario Cayún',
		query: 'Balneario Cayún Lago Puelo Chubut',
		icon: '🏞️',
		category: 'nature'
	},
	{
		id: 'feria',
		name: 'Feria Regional El Bolsón',
		query: 'Feria Regional Artesanal Plaza Pagano El Bolsón',
		icon: '🎨',
		category: 'activities'
	},
	{
		id: 'laberinto',
		name: 'Laberinto Patagonia',
		query: 'Laberinto Patagonia El Hoyo Chubut',
		icon: '🧩',
		category: 'activities'
	},
	{
		id: 'ski',
		name: 'Centro Ski Perito Moreno',
		query: 'Centro de Ski Cerro Perito Moreno El Bolsón',
		icon: '⛷️',
		category: 'activities'
	},
	{
		id: 'patriada',
		name: 'Puerto Patriada',
		query: 'Puerto Patriada Lago Epuyén El Hoyo Chubut',
		icon: '🏖️',
		category: 'nature'
	},
	{
		id: 'confluencia',
		name: 'Pasarela La Confluencia',
		query: 'Pasarela La Confluencia Lago Puelo Chubut',
		icon: '🌉',
		category: 'nature'
	},
	{
		id: 'mirador',
		name: 'Sendero Mirador del Lago',
		query: 'Sendero Mirador del Lago Parque Nacional Lago Puelo',
		icon: '🥾',
		category: 'nature'
	},
	{
		id: 'pobladores',
		name: 'Sendero Antiguos Pobladores',
		query: 'Sendero Antiguos Pobladores Lago Puelo Chubut',
		icon: '🌳',
		category: 'nature'
	}
];
const registry = new globalThis.Map(); // No sombrear google.maps.Map.
const $ = (id) => document.getElementById(id);
const labels = {
	nature: translations.nature,
	services: translations.services,
	activities: translations.activities
};
const mapsSearch = (query) =>
	'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
let map,
	infoWindow,
	Place,
	AdvancedMarkerElement,
	filter = 'all';
const homeEntry = { config: home, marker: null, position: null, place: null };

function message(text) {
	$('message').textContent = text;
	$('message').hidden = false;
}
function addRow(config) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'place';
	button.dataset.category = config.category;
	const name = document.createElement('strong');
	name.textContent = config.icon + ' ' + config.name;
	const status = document.createElement('small');
	status.textContent = labels[config.category] + ' · ' + translations.searching;
	button.append(name, status);
	button.addEventListener('click', () => focus(config.id));
	$('places').append(button);
	registry.set(config.id, { config, button, status, marker: null, position: null, place: null });
}
locations.forEach((location, index) => {
	if (index >= 2) location.name = translations.places[index - 2];
	addRow(location);
});

function applyFilter(category) {
	filter = category;
	document
		.querySelectorAll('[data-filter]')
		.forEach((button) =>
			button.setAttribute('aria-pressed', String(button.dataset.filter === category))
		);
	for (const entry of registry.values()) {
		const visible = category === 'all' || entry.config.category === category;
		entry.button.hidden = !visible;
		if (entry.marker) entry.marker.map = visible ? map : null;
	}
	if (infoWindow) infoWindow.close();
}
document
	.querySelectorAll('[data-filter]')
	.forEach((button) => button.addEventListener('click', () => applyFilter(button.dataset.filter)));

function showInfo(entry) {
	const box = document.createElement('div');
	box.className = 'info';
	const name = document.createElement('strong');
	name.textContent = entry.config.name;
	const link = document.createElement('a');
	link.href = entry.place?.googleMapsURI || mapsSearch(entry.config.query);
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	link.textContent = translations.openMaps + ' ↗';
	box.append(name, link);
	infoWindow.setContent(box);
	infoWindow.open({ anchor: entry.marker, map });
}
function focus(id) {
	const entry = id === 'home' ? homeEntry : registry.get(id);
	if (entry.position && map) {
		map.panTo(entry.position);
		map.setZoom(14);
		showInfo(entry);
	} else window.open(mapsSearch(entry.config.query), '_blank', 'noopener,noreferrer');
}
$('home').addEventListener('click', () => focus('home'));
$('fit').addEventListener('click', () => {
	if (!map) return;
	const visible = [homeEntry, ...registry.values()].filter(
		(entry) =>
			entry.position &&
			(entry === homeEntry || filter === 'all' || entry.config.category === filter)
	);
	if (!visible.length) return;
	if (visible.length === 1) {
		map.panTo(visible[0].position);
		map.setZoom(14);
		return;
	}
	const bounds = new google.maps.LatLngBounds();
	visible.forEach((entry) => bounds.extend(entry.position));
	map.fitBounds(bounds, 50);
});

async function locate(entry) {
	try {
		const { places } = await Place.searchByText({
			textQuery: entry.config.query,
			fields: ['displayName', 'location', 'googleMapsURI'],
			maxResultCount: 1,
			language: root.lang || 'es',
			region: 'ar',
			locationBias: { center, radius: 50000 }
		});
		const place = places?.[0];
		if (!place?.location) throw new Error('Sin resultado con ubicación');
		entry.place = place;
		entry.position = place.location;
		const pin = document.createElement('div');
		pin.className =
			'pin ' + (entry.config.category === 'home' ? 'home-pin' : entry.config.category);
		pin.textContent = entry.config.icon;
		entry.marker = new AdvancedMarkerElement({
			map:
				entry.config.category === 'home' || filter === 'all' || filter === entry.config.category
					? map
					: null,
			position: place.location,
			title: entry.config.name,
			content: pin,
			zIndex: entry.config.category === 'home' ? 100 : 1
		});
		entry.marker.addListener('click', () => showInfo(entry));
		if (entry === homeEntry) {
			$('home-status').textContent = translations.homeLocated;
			map.panTo(place.location);
			map.setZoom(12);
		} else entry.status.textContent = labels[entry.config.category] + ' · ' + translations.viewMap;
	} catch (error) {
		console.warn('No se pudo ubicar ' + entry.config.name, error);
		if (entry === homeEntry) $('home-status').textContent = translations.notLocated;
		else {
			entry.button.classList.add('error');
			entry.status.textContent = translations.notLocated;
		}
	}
}
async function initMap() {
	try {
		const [, markerLibrary, placesLibrary] = await Promise.all([
			google.maps.importLibrary('maps'),
			google.maps.importLibrary('marker'),
			google.maps.importLibrary('places')
		]);
		AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement;
		Place = placesLibrary.Place;
		map = new google.maps.Map($('map'), {
			center,
			zoom: 11,
			mapId: MAP_ID,
			mapTypeControl: false,
			streetViewControl: false
		});
		infoWindow = new google.maps.InfoWindow();
		$('message').hidden = true;
		await locate(homeEntry);
		let next = 0;
		const worker = async () => {
			while (next < locations.length) await locate(registry.get(locations[next++].id));
		};
		await Promise.all([worker(), worker(), worker()]);
	} catch (error) {
		console.error('No se pudo cargar el mapa', error);
		showLoadError();
	}
}
function showLoadError() {
	message(translations.loadError);
	$('home-status').textContent = translations.notLocated;
	for (const entry of registry.values()) {
		if (!entry.position) entry.status.textContent = translations.notLocated;
	}
}
globalThis.initUcihuenMap = initMap;
globalThis.gm_authFailure = showLoadError;
function loadMap() {
	if (!API_KEY.trim()) {
		showLoadError();
		return;
	}
	const script = document.createElement('script');
	script.src =
		'https://maps.googleapis.com/maps/api/js?key=' +
		encodeURIComponent(API_KEY) +
		'&loading=async&callback=initUcihuenMap&v=weekly';
	script.async = true;
	script.onerror = showLoadError;
	document.head.append(script);
}
if ('IntersectionObserver' in window) {
	const observer = new IntersectionObserver(
		(entries) => {
			if (entries.some((entry) => entry.isIntersecting)) {
				observer.disconnect();
				loadMap();
			}
		},
		{ rootMargin: '300px' }
	);
	observer.observe(root);
} else {
	loadMap();
}
