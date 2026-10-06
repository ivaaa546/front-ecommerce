import Link from 'next/link';
import { ArrowUpRight, FolderTree, Image, Package, ShoppingBag } from 'lucide-react';

const sections = [
  { title: 'Pedidos', description: 'Consulta los pedidos entrantes y acompaña cada entrega.', href: '/admin/pedidos', action: 'Gestionar pedidos', icon: ShoppingBag, featured: true },
  { title: 'Productos', description: 'Edita tu catálogo, sus imágenes, precios e inventario.', href: '/admin/productos', action: 'Gestionar productos', icon: Package },
  { title: 'Categorías', description: 'Organiza los productos para que sea fácil encontrarlos.', href: '/admin/categorias', action: 'Organizar categorías', icon: FolderTree },
  { title: 'Configuración', description: 'Actualiza el nombre, los banners y el costo de envío.', href: '/admin/configuracion', action: 'Configurar tienda', icon: Image },
];

export default function AdminDashboard() {
  return <div className="space-y-10">
    <header className="flex flex-col gap-6 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tu tienda, al día.</h1>
        <p className="mt-3 max-w-xl leading-relaxed text-neutral-500">Un punto de partida para revisar pedidos, mantener el catálogo y actualizar la experiencia de compra.</p>
      </div>
      <Link href="/admin/configuracion" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <Image className="h-4 w-4" aria-hidden="true" /> Ajustar portada
      </Link>
    </header>

    <section aria-labelledby="admin-shortcuts">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="admin-shortcuts" className="text-lg font-semibold">Accesos rápidos</h2>
        <span className="text-sm text-neutral-500">4 áreas de gestión</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map(section => {
          const Icon = section.icon;
          return <Link key={section.href} href={section.href} className={`group flex min-h-[190px] flex-col justify-between rounded-2xl p-6 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${section.featured ? 'bg-primary text-white' : 'border border-neutral-200 bg-white hover:border-neutral-400'}`}>
            <div className="flex items-start justify-between gap-4">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${section.featured ? 'bg-white/10' : 'bg-neutral-100'}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <ArrowUpRight className="h-5 w-5 opacity-50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{section.title}</h3>
              <p className={`mt-2 max-w-sm text-sm leading-relaxed ${section.featured ? 'text-white/70' : 'text-neutral-500'}`}>{section.description}</p>
              <span className={`mt-5 inline-flex text-sm font-semibold ${section.featured ? 'text-white' : 'text-primary'}`}>{section.action}</span>
            </div>
          </Link>;
        })}
      </div>
    </section>
  </div>;
}
