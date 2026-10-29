import { useEffect, useState } from 'react';
import { aplicarTema, guardarTema, leerTema, type Tema } from './tema';

/** Interruptor claro/oscuro de la barra: aplica el tema al instante y recuerda la elección. */
export function BotonTema() {
  const [tema, setTema] = useState<Tema>(leerTema);

  useEffect(() => aplicarTema(tema), [tema]);

  const alternar = () => {
    const siguiente: Tema = tema === 'claro' ? 'oscuro' : 'claro';
    guardarTema(siguiente);
    setTema(siguiente);
  };

  const oscuro = tema === 'oscuro';
  return (
    <button type="button" className="ch-icono-boton" onClick={alternar} aria-pressed={oscuro} aria-label={oscuro ? 'Usar tema claro' : 'Usar tema oscuro'} title={oscuro ? 'Tema claro' : 'Tema oscuro'}>
      <span aria-hidden="true">{oscuro ? '☀' : '☾'}</span>
    </button>
  );
}
