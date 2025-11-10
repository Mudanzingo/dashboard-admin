import { useAuth } from '@/auth/useAuth';

export default function LoginPage() {
  const { signIn } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-semibold">Mudanzingo</h1>
      <p className="text-sm">Inicia sesión para continuar</p>
      <button onClick={() => signIn()} className="px-4 py-2 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">Iniciar sesión</button>
    </div>
  );
}
