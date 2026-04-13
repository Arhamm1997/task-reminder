import { Link, useLocation } from 'wouter';
import { LayoutDashboard, CheckSquare, StickyNote, Moon, Sun, Brain, Menu, X } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/notes', icon: StickyNote, label: 'Notes' },
];

function NavLink({ href, icon: Icon, label, onClick }: { href: string; icon: React.ComponentType<{className?: string}>; label: string; onClick?: () => void }) {
  const [location] = useLocation();
  const isActive = location === href;

  return (
    <Link href={href}>
      <motion.div
        data-testid={`nav-${label.toLowerCase()}`}
        onClick={onClick}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{label}</span>
      </motion.div>
    </Link>
  );
}

export function Sidebar() {
  const { theme, toggleTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-sidebar sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">FocusDesk</span>
        </div>
        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setMobileOpen(v => !v)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="lg:hidden fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col"
          >
            <SidebarContent onNavClick={closeMobile} theme={theme} toggleTheme={toggleTheme} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
        <SidebarContent theme={theme} toggleTheme={toggleTheme} />
      </aside>
    </>
  );
}

function SidebarContent({
  onNavClick,
  theme,
  toggleTheme,
}: {
  onNavClick?: () => void;
  theme: string;
  toggleTheme: () => void;
}) {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2.5 mb-8 px-1">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Brain className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm">FocusDesk</span>
      </div>

      <nav className="space-y-1 flex-1">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.href} {...item} onClick={onNavClick} />
        ))}
      </nav>

      <div className="border-t border-sidebar-border pt-4">
        <button
          data-testid="theme-toggle"
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4" />
              Light mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              Dark mode
            </>
          )}
        </button>
      </div>
    </div>
  );
}
