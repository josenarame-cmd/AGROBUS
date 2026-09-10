import { LucideIcon } from 'lucide-react';
import { FarmerEmptyState, FarmerPageHeader, FarmerSectionHeader, FarmerServiceState } from '../components/farmer/FarmerUi';

interface FarmerFeaturePageProps {
  title: string;
  section: string;
  description: string;
  icon: LucideIcon;
  connected?: boolean;
  nextPath?: string;
  nextLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function FarmerFeaturePage({
  title,
  section,
  description,
  icon: Icon,
  connected = false,
  nextPath,
  nextLabel,
  emptyTitle = 'Nothing to show yet',
  emptyDescription = 'Your records will appear here once this service is connected to your farmer account.',
}: FarmerFeaturePageProps) {
  return (
    <section className="farmer-content animate-fade-in">
      <FarmerPageHeader eyebrow={section} title={title} description={description} icon={Icon} action={nextPath && nextLabel ? { to: nextPath, label: nextLabel } : undefined} />
      <div className="space-y-6">
        <FarmerServiceState connected={connected} />
        <section className="farmer-surface overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <FarmerSectionHeader title={connected ? 'Your records' : 'Your workspace'} description={connected ? 'Information from your authenticated farmer account.' : 'A calm place for this part of your agricultural journey.'} />
          </div>
          <FarmerEmptyState icon={Icon} title={connected ? emptyTitle : 'This area is ready for your data'} description={connected ? emptyDescription : 'There are no connected records to display yet. AGROBUS keeps this space clear until real data is available.'} action={nextPath && nextLabel ? { to: nextPath, label: nextLabel } : undefined} />
        </section>
      </div>
    </section>
  );
}