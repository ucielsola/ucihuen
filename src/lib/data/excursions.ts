import { PARK_URL } from '../config';

interface Excursion {
	id: number;
	titleKey: string;
	descKey: string;
	tagKeys: string[];
	image: string;
	mapsUrl: string;
	websiteUrl: string | null;
}

function directions(destination: string) {
	const params = new URLSearchParams({
		api: '1',
		origin: 'Cabañas Ucihuen, Los Alerces 880, Lago Puelo',
		destination
	});
	return `https://www.google.com/maps/dir/?${params}`;
}

export const excursions: Excursion[] = [
	{
		id: 1,
		titleKey: 'excursion_1_title',
		descKey: 'excursion_1_desc',
		tagKeys: ['excursion_tag_nature', 'excursion_tag_trails', 'excursion_tag_trekking'],
		image: '/paseos/puelo.webp',
		mapsUrl: directions('Parque Nacional Lago Puelo, Chubut'),
		websiteUrl: PARK_URL
	},
	{
		id: 2,
		titleKey: 'excursion_2_title',
		descKey: 'excursion_2_desc',
		tagKeys: ['excursion_tag_beach', 'excursion_tag_trekking', 'excursion_tag_nature'],
		image: '/paseos/pasarela.webp',
		mapsUrl: directions('Pasarela Río Azul, Lago Puelo, Chubut'),
		websiteUrl: 'https://turismo.lagopuelo.gob.ar/notas/pasarela-rio-azul.html'
	},
	{
		id: 3,
		titleKey: 'excursion_3_title',
		descKey: 'excursion_3_desc',
		tagKeys: ['excursion_tag_beach', 'excursion_tag_nature', 'excursion_tag_trails'],
		image: '/paseos/cayun.webp',
		mapsUrl: directions('Balneario Cayún, Chubut'),
		websiteUrl: null
	},
	{
		id: 4,
		titleKey: 'excursion_4_title',
		descKey: 'excursion_4_desc',
		tagKeys: ['excursion_tag_market', 'excursion_tag_gastronomy', 'excursion_tag_family'],
		image: '/paseos/feria-artesana.webp',
		mapsUrl: directions('Feria Regional El Bolsón, Plaza Pagano, Río Negro'),
		websiteUrl: 'https://www.turismoelbolson.gob.ar/feria-regional-artesanos'
	},
	{
		id: 5,
		titleKey: 'excursion_5_title',
		descKey: 'excursion_5_desc',
		tagKeys: ['excursion_tag_adventure', 'excursion_tag_nature', 'excursion_tag_family'],
		image: '/paseos/laberinto.webp',
		mapsUrl: directions('Laberinto Patagonia, El Hoyo, Chubut'),
		websiteUrl: 'https://laberintopatagonia.com/'
	},
	{
		id: 6,
		titleKey: 'excursion_6_title',
		descKey: 'excursion_6_desc',
		tagKeys: ['excursion_tag_ski', 'excursion_tag_adventure', 'excursion_tag_trekking'],
		image: '/paseos/ski.webp',
		mapsUrl: directions('Cerro Perito Moreno, Río Negro'),
		websiteUrl: 'https://www.laderas.com.ar/'
	},
	{
		id: 7,
		titleKey: 'excursion_7_title',
		descKey: 'excursion_7_desc',
		tagKeys: ['excursion_tag_beach', 'excursion_tag_water_sports', 'excursion_tag_nature'],
		image: '/paseos/patriada.webp',
		mapsUrl: directions('Puerto Patriada, El Hoyo, Chubut'),
		websiteUrl: 'https://turismoelhoyo.ar/site/'
	},
	{
		id: 8,
		titleKey: 'excursion_8_title',
		descKey: 'excursion_8_desc',
		tagKeys: ['excursion_tag_nature', 'excursion_tag_trails', 'excursion_tag_family'],
		image: '/paseos/confluencia.webp',
		mapsUrl: directions('Pasarela La Confluencia, Chubut'),
		websiteUrl: null
	},
	{
		id: 9,
		titleKey: 'excursion_9_title',
		descKey: 'excursion_9_desc',
		tagKeys: ['excursion_tag_trekking', 'excursion_tag_viewpoint', 'excursion_tag_nature'],
		image: '/paseos/mirador.webp',
		mapsUrl: directions('Sendero Mirador del Lago, Lago Puelo, Chubut'),
		websiteUrl: `${PARK_URL}/actividades`
	},
	{
		id: 10,
		titleKey: 'excursion_10_title',
		descKey: 'excursion_10_desc',
		tagKeys: ['excursion_tag_history', 'excursion_tag_trails', 'excursion_tag_nature'],
		image: '/paseos/pobladores.webp',
		mapsUrl: directions('-42.082592,-71.5963947'),
		websiteUrl: 'https://turismo.lagopuelo.gob.ar/historia.html'
	}
];
