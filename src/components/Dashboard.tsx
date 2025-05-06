import { DashboardProvider } from './Dashboard/DashboardContext';
import { DashboardLayout } from './Dashboard/DashboardLayout';
import '@/styles/dashboard.css'; // Import dashboard specific styles

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  );
}
