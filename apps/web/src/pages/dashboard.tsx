import { useAuth } from '@/auth/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Bienvenido</h1>
      <p className="text-sm">Has iniciado sesión como <strong>{user?.username}</strong>.</p>
      <div className="text-xs text-zinc-500">Personaliza este dashboard con métricas, gráficos y accesos rápidos.</div>
    </div>
  );
}
