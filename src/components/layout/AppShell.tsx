import * as React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Building2,
  Flag,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Trophy,
  Users,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <Trophy className="h-5 w-5 text-primary" />
            BowlTrack
          </Link>
          <nav className="flex-1 flex items-center gap-1">
            <NavItem to="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
              Events
            </NavItem>
            <NavItem to="/admin/leagues" icon={<Flag className="h-4 w-4" />}>
              Leagues
            </NavItem>
            <NavItem to="/admin/associations" icon={<Building2 className="h-4 w-4" />}>
              Associations
            </NavItem>
            <NavItem to="/admin/players" icon={<Users className="h-4 w-4" />}>
              Players
            </NavItem>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    navigate('/login');
                  }}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="h-4 w-4 hidden dark:block" />
    </Button>
  );
}

export function PublicShell() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Trophy className="h-5 w-5 text-primary" />
            BowlTrack
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}
