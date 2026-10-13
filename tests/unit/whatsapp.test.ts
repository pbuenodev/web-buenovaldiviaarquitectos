import { describe, expect, it } from 'vitest';
import { sitio } from '../../src/config/site';
import { enlaceWhatsApp } from '../../src/lib/whatsapp';

describe('enlaceWhatsApp', () => {
  it('usa solo los dígitos del número', () => {
    expect(enlaceWhatsApp('+56 9 0000 0000', 'Hola')).toBe('https://wa.me/56900000000?text=Hola');
  });

  it('codifica el mensaje', () => {
    const enlace = enlaceWhatsApp('56900000000', 'Hola, ¿conversamos? Sí & pronto');
    expect(new URL(enlace).searchParams.get('text')).toBe('Hola, ¿conversamos? Sí & pronto');
    expect(enlace).not.toContain(' ');
  });

  it('rechaza un número sin dígitos', () => {
    expect(() => enlaceWhatsApp('por definir', 'Hola')).toThrow(/sin dígitos/);
  });
});

describe('mensajes configurados', () => {
  it('el mensaje de una obra la nombra', () => {
    expect(sitio.whatsapp.mensajeObra('Edificio Los Leones')).toBe(
      'Hola, vi el proyecto Edificio Los Leones en su portafolio y me gustaría conversar.',
    );
  });

  it('el mensaje general es el acordado', () => {
    expect(sitio.whatsapp.mensajeGeneral).toBe('Hola, vi su portafolio y me gustaría conversar sobre un proyecto.');
  });
});
