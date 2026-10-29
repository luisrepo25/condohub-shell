import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSesion } from '@/auth/AuthProvider';
import { menuPara } from '@/auth/roles';
import { etiquetaRol, iniciales } from '@/inicio/presentacion';
import { BotonTema } from '@/tema/BotonTema';
import './layout.css';

export function Layout() {
  const sesion = useSesion();
  const { pathname } = useLocation();
  const roles = sesion.roles.map(etiquetaRol).join(', ') || 'Sin rol';
  return (
    <>
      <header className="ch-barra">
        <Link to="/" className="ch-marca">CondoHub</Link>
        <nav className="ch-nav" aria-label="Principal">
          {menuPara(sesion.roles).map((item) => (
            <NavLink key={item.ruta} to={item.ruta}>
              {item.etiqueta}
            </NavLink>
          ))}
        </nav>
        <div className="ch-usuario">
          <span className="ch-avatar" aria-hidden="true">{iniciales(sesion.usuario.nombre)}</span>
          <span className="ch-usuario-datos">
            <span className="ch-usuario-nombre">{sesion.usuario.nombre}</span>
            <span className="ch-usuario-rol">{roles}</span>
          </span>
        </div>
        <BotonTema />
        <button onClick={() => void sesion.cerrarSesion()}>Cerrar sesión</button>
      </header>
      <main className="ch-contenido" key={pathname.split('/')[1]}>
        <Outlet />
      </main>
    </>
  );
}
