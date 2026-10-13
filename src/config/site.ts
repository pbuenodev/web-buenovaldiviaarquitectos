// Datos de la oficina y de contacto. Es el único lugar donde se cambian.
// PROVISIONAL: el número de WhatsApp y las redes son de relleno hasta que el cliente entregue los reales.

export const sitio = {
  nombre: 'Bueno Valdivia Arquitectos',
  descripcion: 'Portafolio de obras de Bueno Valdivia Arquitectos. Chile, más de 30 años de trayectoria.',
  lema: 'Chile · Más de 30 años',
  whatsapp: {
    numero: '+56 9 0000 0000',
    mensajeGeneral: 'Hola, vi su portafolio y me gustaría conversar sobre un proyecto.',
    mensajeObra: (nombre: string) => `Hola, vi el proyecto ${nombre} en su portafolio y me gustaría conversar.`,
  },
  // Una red sin dirección (cadena vacía) no se muestra.
  redes: [
    { nombre: 'Instagram', url: 'https://instagram.com/' },
    { nombre: 'Facebook', url: 'https://facebook.com/' },
  ],
};
