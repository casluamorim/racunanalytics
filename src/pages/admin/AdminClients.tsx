import { Sidebar } from '@/components/Sidebar';
import AdminDashboard from '@/pages/AdminDashboard';

// AdminClients reuses the AdminDashboard which already has the clients table
export default function AdminClients() {
  return <AdminDashboard />;
}
