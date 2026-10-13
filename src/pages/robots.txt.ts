import type { APIRoute } from 'astro';

// Mientras el sitio esté en prueba se pide a los buscadores que no lo recorran.
export const GET: APIRoute = () => {
  const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';
  const cuerpo = `User-agent: *\n${indexable ? 'Allow: /' : 'Disallow: /'}\n`;
  return new Response(cuerpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
