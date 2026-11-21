# Cabañas Ucihuen - [Ucihuen.com.ar](https://ucihuen.com.ar)

- ⚡️ SSR
- 🌐 Hosted with [Vercel](https://vercel.app)
- 🧡 Built with [SvelteKit](https://kit.svelte.dev)
- 📩 Forms submissions handled with [FormSubmit](https://formsubmit.co/)
- 🗺 Google Maps API
- 🔔 [Svelte Modals](https://github.com/mattjennings/svelte-modals)

### Mapa de ubicación

El mapa usa Maps Embed API con `PUBLIC_API_KEY`. Google requiere que la API y la facturación estén habilitadas en el proyecto, aunque las solicitudes de Maps Embed no tienen cargo. Restringí la clave a los dominios y las API necesarias en Google Cloud.

### Información para agentes

`src/lib/agentMarkdown.ts` genera `/llms.txt`, `/llms-full.txt` y `/agent-home.md` a partir de los datos que comparte el sitio. Para validar los archivos publicados, corré `npm run build` y después `npm run test:agent-readiness`. El [protocolo de evaluación](tests/agent-evaluation.md) describe cómo comparar las tres fuentes con un modelo externo.
