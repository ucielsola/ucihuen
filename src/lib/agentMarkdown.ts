import { bookingOptions, BOOKING_URL, MAP_URL, PARK_URL } from './config';
import { excursions } from './data/excursions';
import { amenityIcons, getCabins } from './data/stay';
import { sitePageUrl } from './i18n';
import { getMessages } from './messages';

const m = getMessages('es');
const cabins = getCabins('es');
const title = '# Cabañas Ucihuen';
const summary =
	'> Alquiler de cabañas para 4 y 7 personas en Lago Puelo, Chubut, Patagonia Argentina.';
const location = m.faq_location_answer;
const bookingNote =
	'Los precios y la disponibilidad se consultan para las fechas y el número de huéspedes en los canales de reserva. El sitio no publica tarifas ni un calendario propio y no confirma reservas. El anuncio de Airbnb enlazado corresponde a la cabaña para 4 personas.';
const bookingLinks = bookingOptions
	.map(
		({ name, url, phone }) =>
			`- [${name}](${url}): ${phone ? `Consultas y reservas directas al ${phone}.` : 'Consultar fechas y tarifas en el anuncio.'}`
	)
	.join('\n');
const languages = `- [Español](${sitePageUrl('/')}): Alojamiento, comodidades y preguntas frecuentes.
- [English](${sitePageUrl('/', 'en')}): Cabin information, amenities, and FAQs.
- [Português](${sitePageUrl('/', 'pt')}): Informações das cabanas, comodidades e perguntas frequentes.`;

export const llmsMarkdown = `${title}

${summary}

${location} Para tarifas y disponibilidad, consultá los canales de reserva. Las herramientas WebMCP son de solo lectura.

## Información para asistentes

- [Referencia completa](${sitePageUrl('/llms-full.txt')}): Cabañas, comodidades, ubicación, paseos, reservas y preguntas frecuentes en Markdown.
- [Resumen del alojamiento](${sitePageUrl('/agent-home.md')}): Versión Markdown de la información principal de la portada en español.
- [Recursos para agentes](${sitePageUrl('/agents')}): Herramientas WebMCP, parámetros y límites.

## Páginas para visitantes

${languages}
- [Galería](${sitePageUrl('/galeria')}): Fotos de las cabañas y del predio.
- [Paseos](${sitePageUrl('/paseos')}): Diez excursiones con indicaciones y enlaces a destinos.
- [Contacto](${sitePageUrl('/contact')}): Dirección y consultas directas.

## Reservas

${bookingLinks}

## Optional

- [Mapa del sitio XML](${sitePageUrl('/sitemap.xml')}): Páginas canónicas en español, inglés y portugués.
`;

const cabinSections = cabins
	.map(
		({ id, title, floors, rooms, bedrooms }) => `### ${title}

${floors}. ${rooms.join(', ')}. [Ver fotos](${sitePageUrl('/galeria')}#${id}).
${bedrooms === null ? `\n${m.faq_bedrooms_answer}\n` : ''}`
	)
	.join('\n');

const excursionSections = excursions
	.map(
		({ id, titleKey, descKey, mapsUrl, websiteUrl }) => `### ${id}. ${m[titleKey]}

${m[descKey]}

- [Cómo llegar](${mapsUrl})${websiteUrl ? `\n- [Información del destino](${websiteUrl})` : ''}
`
	)
	.join('\n');

const faq = ['pets', 'parking', 'breakfast', 'wifi']
	.map((topic) => `### ${m[`faq_${topic}_question`]}\n\n${m[`faq_${topic}_answer`]}\n`)
	.join('\n');

export const llmsFullMarkdown = `${title}

${summary}

${location} El alojamiento está en la Comarca Andina del Paralelo 42°, cerca de El Bolsón y El Hoyo.

## Cabañas

${cabinSections}
## Comodidades

${m.home_amenities_desc}

Equipamiento y servicios publicados:

${Object.keys(amenityIcons)
	.map((key) => `- ${m[key]}`)
	.join('\n')}

## Ubicación y acceso

- [Cómo llegar a Cabañas Ucihuen](${MAP_URL}): Buscá Los Alerces 880, Villa Turística Lago Puelo, Chubut, Argentina.
- [Acceso al Parque Nacional Lago Puelo](${PARK_URL}/horarios-como-llegar): Información de Parques Nacionales sobre el acceso por la Ruta Provincial 16.

## Paseos y excursiones

La [guía de paseos](${sitePageUrl('/paseos')}) reúne estos diez destinos. Consultá a cada destino por horarios, accesos y condiciones actuales.

${excursionSections}
## Tarifas, reservas y contacto

${bookingNote}

${bookingLinks}
- [Contacto del alojamiento](${sitePageUrl('/contact')}): Dirección y canales oficiales.

## Reseñas de huéspedes

Algunas reseñas en [Booking.com](${BOOKING_URL}#tab-reviews) mencionan la atención de los anfitriones y el patio con árboles. La [portada](${sitePageUrl('/')}#resenas) muestra una selección de reseñas de Google cuando están disponibles. Consultá la [ficha en Google Maps](${MAP_URL}) y los anuncios de reserva para leer reseñas en su fuente.

## Preguntas frecuentes

${faq}
## Idiomas y documentación

${languages}
- [Recursos para agentes](${sitePageUrl('/agents')}): Herramientas WebMCP de solo lectura para consultar datos publicados, canales de reserva y paseos.
`;

export const agentHomeMarkdown = `${title}

${summary}

## Alojamiento

${location}

${cabins.map((cabin) => `- ${cabin.title}. ${cabin.floors}.`).join('\n')}

${m.home_amenities_desc}

${m.faq_pets_answer}

## Consultas y reservas

${bookingNote}

${bookingLinks}

## Más información

- [Fotos de las cabañas](${sitePageUrl('/galeria')})
- [Paseos recomendados](${sitePageUrl('/paseos')})
- [Información ampliada](${sitePageUrl('/llms-full.txt')})
- [Recursos para agentes](${sitePageUrl('/agents')})
`;
