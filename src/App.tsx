import { Navigate, Route, Routes } from 'react-router-dom';
import { useSesion } from '@/auth/AuthProvider';
import { RutaProtegida } from '@/auth/RutaProtegida';
import { rutaInicial } from '@/auth/roles';
import { InicioPage } from '@/inicio/InicioPage';
import { Layout } from '@/layout/Layout';
import { RemoteHost } from '@/remotes/RemoteHost';
import { REMOTOS } from '@/remotes/remotos';

export function App() {
  const sesion = useSesion();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={sesion.roles.length ? <InicioPage /> : <Navigate to={rutaInicial(sesion.roles)} replace />} />
        {REMOTOS.map((r) => (
          <Route
            key={r.nombre}
            path={`${r.ruta}/*`}
            element={
              <RutaProtegida roles={[r.rol]}>
                <RemoteHost nombre={r.nombre} url={r.url} />
              </RutaProtegida>
            }
          />
        ))}
        <Route path="/sin-rol" element={<p role="alert">Tu cuenta no tiene un rol de CondoHub asignado. Contacta a la administración.</p>} />
        <Route path="*" element={<p>Página no encontrada.</p>} />
      </Route>
    </Routes>
  );
}