// Main entry point that orchestrates the Dashboard components
import { DashboardLayout } from './DashboardLayout';
import { DashboardProvider } from './DashboardContext';

export function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  );
}
