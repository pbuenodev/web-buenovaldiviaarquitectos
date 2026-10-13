/** Enlace `wa.me` con el mensaje ya escrito. El número puede traer espacios, guiones o `+`. */
export function enlaceWhatsApp(numero: string, mensaje: string): string {
  const digitos = numero.replace(/\D/g, '');
  if (!digitos) throw new Error(`Número de WhatsApp sin dígitos: "${numero}".`);
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensaje)}`;
}
