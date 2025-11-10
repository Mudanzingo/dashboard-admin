import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/useAuth';

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };
  return (
    <button onClick={toggle} className="text-xs px-2 py-1 rounded border">
      {dark ? 'Claro' : 'Oscuro'}
    </button>
  );
}

export function AppLayout() {
  const { user, signOut } = useAuth();
  return (
    <div className="flex h-full">
      <aside className="w-56 border-r bg-zinc-50 dark:bg-zinc-800 p-4 flex flex-col gap-4">
        <div className="font-bold text-sm">Mudanzingo</div>
        <nav className="flex flex-col gap-1 text-sm">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'font-semibold' : '')}>Dashboard</NavLink>
          <NavLink to="/products" className={({ isActive }) => (isActive ? 'font-semibold' : '')}>Productos</NavLink>
        </nav>
        <div className="mt-auto flex flex-col gap-2 text-xs">
          <ThemeToggle />
          {user && (
            <button onClick={signOut} className="border rounded px-2 py-1">Salir</button>
          )}
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-12 border-b flex items-center justify-between px-4 text-sm bg-white dark:bg-zinc-900">
          <div>Hola {user?.username}</div>
          <Link to="/dashboard" className="underline">Inicio</Link>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
