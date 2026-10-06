'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, Tags, ShoppingBag, Settings, LogOut, ArrowUpRight, Menu, X } from 'lucide-react';
const links = [
  {name:'Resumen', href:'/admin', icon:LayoutDashboard},
  {name:'Pedidos', href:'/admin/pedidos', icon:ShoppingBag},
  {name:'Productos', href:'/admin/productos', icon:Package},
  {name:'Categorías', href:'/admin/categorias', icon:Tags},
  {name:'Configuración', href:'/admin/configuracion', icon:Settings},
];
export default function AdminLayout({children}:{children:React.ReactNode}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthenticated(!!token);
    setMenuOpen(false);
    if (!token && pathname !== '/admin/login') router.replace('/admin/login');
  }, [pathname, router]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e:KeyboardEvent) => { if(e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);
  if (pathname === '/admin/login') return <main className="min-h-screen flex items-center justify-center bg-neutral-100 px-5 py-12">{children}</main>;
  if (!authenticated) return <main className="flex min-h-screen items-center justify-center text-neutral-500">Verificando acceso…</main>;
  const current = links.find(l => l.href === pathname || (l.href !== '/admin' && pathname.startsWith(l.href+'/')))?.name || 'Administración';
  return <div className="admin-surface min-h-screen bg-neutral-50 lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
    <aside className="lg:sticky lg:top-0 lg:h-screen bg-[#171717] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 py-6 lg:py-9"><Link href="/admin" className="text-xl font-bold tracking-tight">Administración<span className="block mt-1 text-xs font-normal text-neutral-400">Tu tienda, en un solo lugar</span></Link><button type="button" onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden flex h-11 w-11 items-center justify-center rounded-lg hover:bg-neutral-800" aria-label={menuOpen ? 'Cerrar navegación' : 'Abrir navegación'} aria-expanded={menuOpen}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button></div>
      <nav aria-label="Administración" className={`${menuOpen ? 'block' : 'hidden'} lg:block px-3 pb-5 lg:flex-1`}><ul className="space-y-1">{links.map(item => {const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href+'/'));return <li key={item.href}><Link href={item.href} aria-current={active ? 'page' : undefined} className={`flex min-h-12 items-center gap-3 rounded-lg px-4 text-sm transition-colors ${active ? 'bg-white text-primary font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'}`}><item.icon className="h-4 w-4" aria-hidden="true" />{item.name}</Link></li>;})}</ul></nav>
      <div className={`${menuOpen ? 'block' : 'hidden'} lg:block border-t border-neutral-800 p-3`}><Link href="/" className="flex min-h-12 items-center gap-3 rounded-lg px-4 text-sm text-neutral-300 hover:text-white"><ArrowUpRight className="h-4 w-4" aria-hidden="true" />Ver tienda</Link><button onClick={() => {localStorage.removeItem('token'); setAuthenticated(false); router.replace('/admin/login');}} className="flex min-h-12 w-full items-center gap-3 rounded-lg px-4 text-sm text-neutral-300 hover:text-white"><LogOut className="h-4 w-4" aria-hidden="true" />Cerrar sesión</button></div>
    </aside>
    <div className="min-w-0"><header className="hidden lg:flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-8"><span className="text-sm text-neutral-500">Administración / <span className="text-primary font-medium">{current}</span></span><Link href="/" className="inline-flex items-center gap-2 text-sm font-medium">Abrir tienda <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></header><main id="admin-content" className="mx-auto max-w-[1400px] p-5 sm:p-8 lg:p-10">{children}</main></div>
  </div>;
}
