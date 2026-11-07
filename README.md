# Cabañas Ucihuen - [Ucihuen.com.ar](https://ucihuen.com.ar)

- ⚡️ SSR
- 🌐 Hosted with [Vercel](https://vercel.app)
- 🧡 Built with [SvelteKit](https://kit.svelte.dev)
- 📩 Forms submissions handled with [FormSubmit](https://formsubmit.co/)
- 🗺 Google Maps API
- 🔔 [Svelte Modals](https://github.com/mattjennings/svelte-modals)

### Mapa de ubicación

El mapa usa `PUBLIC_API_KEY` con Maps JavaScript API y Places API (New) habilitadas y autorizadas para la clave. Se carga cuando el visitante se acerca a la sección y consulta hasta 13 lugares en Places; estas consultas pueden generar cargos según la tarifa y cuota vigentes de Google Maps Platform. Los resultados de búsqueda pueden variar y deben comprobarse.

El mapa usa por defecto el ID de mapa de Ucihuen, asociado al estilo publicado que oculta los puntos de interés del mapa base. Se puede sustituir mediante `PUBLIC_GOOGLE_MAP_ID` en el entorno de despliegue. Las variables públicas de Astro se incorporan al sitio generado: restringir la clave a los dominios y API necesarios en Google Cloud.
