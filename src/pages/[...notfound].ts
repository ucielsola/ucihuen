import type { APIRoute } from 'astro';
import { markdownResponse } from '../lib/contentNegotiation.mjs';

export const prerender = false;

const markdownBody = `# No se encontró esta página

La dirección solicitada no existe en el sitio de Cabañas Ucihuen. Consultá [la información para asistentes](https://ucihuen.com.ar/llms.txt) o [el mapa del sitio](https://ucihuen.com.ar/sitemap.xml) para encontrar el contenido disponible.
`;

const htmlBody = `<!doctype html>
<html lang="es">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Página no encontrada | Cabañas Ucihuen</title>
	</head>
	<body>
		<main>
			<h1>Página no encontrada</h1>
			<p>La dirección solicitada no existe en el sitio de Cabañas Ucihuen.</p>
			<p><a href="/">Volver al inicio</a> · <a href="/llms.txt">Información para asistentes</a></p>
		</main>
	</body>
</html>`;

export const GET: APIRoute = ({ request }) => {
	const markdown = markdownResponse(request.headers.get('accept'), markdownBody, 404);
	if (markdown) return markdown;

	return new Response(htmlBody, {
		status: 404,
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'no-store',
			Vary: 'Accept'
		}
	});
};
