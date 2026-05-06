import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { useAuth } from '@/lib/auth';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Bell,
  FileText,
  Link2,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

function NavItem({ icon, label, href, isActive, isCollapsed }: NavItemProps) {
  return (
    <Link to={href}>
      <motion.div
        whileHover={{ x: 4 }}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/10'
        )}
      >
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
          />
        )}
        <span className="shrink-0">{icon}</span>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

export function Sidebar() {
  const { isAdmin, signOut, user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const clientNavItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Campanhas', href: '/campaigns' },
    { icon: <FileText className="w-5 h-5" />, label: 'Relatórios', href: '/reports' },
    { icon: <Settings className="w-5 h-5" />, label: 'Configurações', href: '/settings' },
  ];

  const adminNavItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Visão Geral', href: '/admin' },
    { icon: <Users className="w-5 h-5" />, label: 'Clientes', href: '/admin/clients' },
    { icon: <Link2 className="w-5 h-5" />, label: 'Integrações', href: '/admin/integrations' },
    { icon: <Bell className="w-5 h-5" />, label: 'Alertas', href: '/admin/alerts' },
    { icon: <FileText className="w-5 h-5" />, label: 'Logs', href: '/admin/logs' },
    { icon: <Settings className="w-5 h-5" />, label: 'Configurações', href: '/admin/settings' },
  ];

  const navItems = isAdmin ? adminNavItems : clientNavItems;

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50'
      )}
    >
      {/* Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-sidebar-border">
        <Logo showText={!isCollapsed} size="sm" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0 w-8 h-8 text-muted-foreground"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={location.pathname === item.href}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3 mb-3', isCollapsed && 'justify-center')}>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
            {user?.email?.[0].toUpperCase()}
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? 'Administrador' : 'Cliente'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-muted-foreground hover:text-foreground',
            isCollapsed && 'justify-center px-0'
          )}
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {!isCollapsed && 'Sair'}
        </Button>
      </div>
    </motion.aside>
  );
}
