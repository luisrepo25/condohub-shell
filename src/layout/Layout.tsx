import { NavLink, Outlet } from 'react-router-dom';
import { useSesion } from '@/auth/AuthProvider';
import { menuPara } from '@/auth/roles';

export function Layout() {
  const sesion = useSesion();
  return (
    <>
      <header style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #ccc' }}>
        <strong>CondoHub</strong>
        <nav style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          {menuPara(sesion.roles).map((item) => (
            <NavLink key={item.ruta} to={item.ruta}>
              {item.etiqueta}
            </NavLink>
          ))}
        </nav>
        <span>
          {sesion.usuario.nombre} ({sesion.roles.join(', ') || 'sin rol'})
        </span>
        <button onClick={() => void sesion.cerrarSesion()}>Cerrar sesión</button>
      </header>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </>
  );
}