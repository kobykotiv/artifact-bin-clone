export { DashboardLayout } from './DashboardLayout';
export { DashboardProvider } from './DashboardContext';
export type { LayoutState } from './types';

export function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  );
}
