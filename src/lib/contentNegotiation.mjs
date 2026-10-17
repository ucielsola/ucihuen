export function markdownResponse(accept, body, status = 200) {
	const acceptsMarkdown = (accept || '').split(',').some((entry) => {
		const [mediaType, ...parameters] = entry.trim().toLowerCase().split(';');
		const quality = parameters.find((parameter) => parameter.trim().startsWith('q='));
		return mediaType.trim() === 'text/markdown' && (!quality || Number(quality.split('=')[1]) > 0);
	});

	if (!acceptsMarkdown) return null;

	return new Response(body, {
		status,
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			Vary: 'Accept',
			'Cache-Control':
				status === 404
					? 'no-store'
					: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
		}
	});
}
