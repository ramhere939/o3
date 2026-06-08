import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  LayoutDashboard, Users, Box, AlertCircle, Database, 
  Settings, LogOut, Bell, FileText, Shield
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Role } from '@/types/auth';

interface NavItem {
  path: string;
  label: string;
  icon: any;
  allowedRoles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['Super Admin', 'KYC Admin', 'Catalog Admin', 'Ops Admin', 'Finance Admin', 'Content Admin'] },
  { path: '/admin/kyc', label: 'KYC Management', icon: Users, allowedRoles: ['Super Admin', 'KYC Admin'] },
  { path: '/admin/catalog', label: 'Catalog Moderation', icon: Box, allowedRoles: ['Super Admin', 'Catalog Admin'] },
  { path: '/admin/disputes', label: 'Dispute Management', icon: AlertCircle, allowedRoles: ['Super Admin', 'Ops Admin'] },
  { path: '/admin/masters/chemicals', label: 'Master Data', icon: Database, allowedRoles: ['Super Admin', 'Catalog Admin', 'Content Admin'] },
  { path: '/admin/admin-users', label: 'Admin Users', icon: Shield, allowedRoles: ['Super Admin'] },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText, allowedRoles: ['Super Admin'] },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell, allowedRoles: ['Super Admin', 'KYC Admin', 'Catalog Admin', 'Ops Admin', 'Finance Admin', 'Content Admin'] },
  { path: '/admin/settings', label: 'Settings', icon: Settings, allowedRoles: ['Super Admin', 'KYC Admin', 'Catalog Admin', 'Ops Admin', 'Finance Admin', 'Content Admin'] },
];

export default function AdminLayout() {
  const { user, logout, hasRole } = useAuthStore();

  const filteredNavItems = NAV_ITEMS.filter((item) => hasRole(item.allowedRoles));

  return (
    <div className="flex h-screen w-full bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="font-bold text-xl text-primary">O3 Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-6">
          <div className="font-medium text-muted-foreground flex items-center gap-2">
            Role: <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-semibold">{user?.role}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 border-l pl-4">
              <div className="text-sm text-right">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={logout} className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
