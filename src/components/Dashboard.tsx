import { DashboardProvider } from './Dashboard/DashboardContext';
import { DashboardLayout } from './Dashboard/DashboardLayout';
import '@/styles/dashboard.css';

/**
 * Main Dashboard component that serves as the entry point for the authenticated user experience.
 * Sets up the DashboardProvider for state management and renders the DashboardLayout.
 * 
 * The dashboard is organized in a magazine-style layout with sections for:
 * - Legal document drafting
 * - Pseudocode generation
 * - Working papers
 * - Documentation
 * - Project export tools (PDF, DOCX)
 * 
 * The layout is optimized for large screens with responsive panels and content areas
 * that make effective use of available space on wide displays.
 */
export default function Dashboard() {
  return (
    <DashboardProvider>
      <div className="dashboard-container large-screen-optimized">
        <DashboardLayout />
      </div>
    </DashboardProvider>
  );
}
