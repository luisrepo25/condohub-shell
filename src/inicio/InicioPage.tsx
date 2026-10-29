import { Link } from 'react-router-dom';
import { useSesion } from '@/auth/AuthProvider';
import { modulosPara } from './modulos';
import { fechaLarga, primerNombre, saludo } from './presentacion';
import './inicio.css';

/** Bienvenida: saluda y ofrece los portales de la persona; ya no salta directo a una funcionalidad. */
export function InicioPage() {
  const sesion = useSesion();
  const ahora = new Date();
  const modulos = modulosPara(sesion.roles);
  return (
    <section aria-labelledby="inicio-titulo">
      <div className="ch-inicio-cabecera">
        <p className="ch-inicio-fecha">{fechaLarga(ahora)}</p>
        <h1 id="inicio-titulo" className="ch-inicio-titulo">
          {saludo(ahora)}, {primerNombre(sesion.usuario.nombre)}
        </h1>
        <p className="ch-inicio-sub">¿Qué quieres hacer hoy?</p>
      </div>
      <div className="ch-inicio-rejilla">
        {modulos.map((m) => (
          <Link key={m.ruta} to={m.ruta} className="ch-modulo">
            <span className="ch-modulo-icono" aria-hidden="true">{m.icono}</span>
            <h2 className="ch-modulo-titulo">{m.titulo}</h2>
            <p className="ch-modulo-texto">{m.descripcion}</p>
            <span className="ch-modulo-ir">Abrir →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
