import { notFound } from 'next/navigation';
import AdminSettings, { type SettingsSectionId } from '@/components/admin/SettingsPage';

const sectionBySlug: Record<string, SettingsSectionId> = {
  identidad: 'identity',
  envio: 'shipping',
  portada: 'banners',
  'enlaces-rapidos': 'quick-links',
  footer: 'footer',
  'meta-pixel': 'tracking',
};

export default function AdminSettingsSectionPage({ params }: { params: { section: string } }) {
  const section = sectionBySlug[params.section];
  if (!section) notFound();
  return <AdminSettings section={section} />;
}
