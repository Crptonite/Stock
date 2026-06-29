import { Link, useLocation, Outlet, useNavigate } from "react-router";
import {
  Search, LayoutDashboard, Menu, Shield, Crown,
  Sun, Moon, X, ChevronDown, ChevronRight, Lock,
  MessageSquare, Newspaper, Bell, LogOut, User
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { AuthCheckoutModal } from "./AuthCheckoutModal";
import { useAuth } from "../context/AuthContext";

type NavGroup = {
  label: string;
  locked?: boolean;
  links: { name: string; path: string }[];
};

type NavCoreItem = {
  name: string;
  path?: string;
  icon: any;
  subItems?: { name: string; path: string }[];
};

const NAV_CORE: NavCoreItem[] = [
  {
    name: "Screener",
    icon: LayoutDashboard,
    subItems: [
      { name: "Basic Screener", path: "/dashboard" },
      { name: "Advanced Screener", path: "/screener" }
    ]
  },
  { name: "AI Chat", path: "/ai-chat", icon: MessageSquare },
  { name: "News", path: "/news", icon: Newspaper },
  { name: "Alerts", path: "/alerts", icon: Bell },
];

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Research & Analysis",
    links: [
      { name: "AI Analysis", path: "/analysis" },
      { name: "Stock Analysis", path: "/stock-analysis" },
      { name: "AI Research Memory", path: "/ai-memory" },
    ],
  },
  {
    label: "Portfolio & Tracking",
    links: [
      { name: "Watchlists", path: "/watchlist" },
      { name: "Portfolio", path: "/portfolio" },
    ],
  },
  {
    label: "Pro Tools & Data",
    locked: true,
    links: [
      { name: "Portfolio P&L", path: "/pro-tools" },
      { name: "Sector Heatmaps", path: "/pro-tools" },
      { name: "Level 2 Market Data", path: "/pro-tools" },
      { name: "Institutional Fund Flow", path: "/pro-tools" },
    ],
  },
  {
    label: "Wealth Automation",
    links: [
      { name: "Automated DCA", path: "/wealth-automation" },
      { name: "Fractional Shares", path: "/wealth-automation" },
    ],
  },
  {
    label: "Alternative Assets",
    links: [
      { name: "Wholesale Bonds", path: "/alternative-assets" },
      { name: "Unit Trusts", path: "/alternative-assets" },
    ],
  },
  {
    label: "Admin",
    links: [
      { name: "Admin Panel", path: "/admin" },
    ],
  },
];

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Research & Analysis": true,
    "Portfolio & Tracking": true,
  });
  const [expandedCoreItems, setExpandedCoreItems] = useState<Record<string, boolean>>({
    "Screener": false,
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Derive initials for avatar
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "?");

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
    navigate("/login");
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleCoreItem = (name: string) => {
    setExpandedCoreItems((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground font-sans antialiased overflow-hidden selection:bg-primary/20">

      {/* Top Navigation */}
      <header className="h-16 w-full flex items-center justify-between px-5 md:px-8 shrink-0 z-20 border-b border-border">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-1 text-muted-foreground hover:bg-secondary rounded-lg transition-colors flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center brand */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--trust-blue)" }}>
            <Shield className="w-4 h-4" style={{ color: "#0B1015" }} />
          </div>
          <span className="font-mono font-semibold text-base tracking-widest text-foreground">SIFT</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* User avatar + dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity font-mono"
              style={{ background: "var(--trust-slate)", color: "#fff" }}
              title={profile?.full_name ?? user?.email ?? "User"}
            >
              {initials}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-1.5 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name ?? "Account"}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{user?.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                    style={{ background: "var(--trust-blue)", color: "#0B1015" }}>
                    {profile?.plan === "pro" ? "Pro" : "Free"}
                  </span>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Account Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85%] bg-card border-r border-border h-full shadow-2xl flex flex-col" style={{ animation: "slideInLeft 0.2s ease-out" }}>
            {/* Drawer header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--trust-blue)" }}>
                  <Shield className="w-4 h-4" style={{ color: "#0B1015" }} />
                </div>
                <span className="font-mono font-semibold text-sm tracking-widest text-foreground">SIFT</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User info in drawer */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0"
                style={{ background: "var(--trust-slate)", color: "#fff" }}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{profile?.full_name ?? "Account"}</p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">{user?.email}</p>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-border shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search SIFT..."
                  className="w-full bg-secondary text-foreground text-xs rounded-lg pl-8 pr-4 py-2 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-3 space-y-5 overflow-y-auto custom-scrollbar">
              {/* Core links */}
              <div className="space-y-0.5">
                {NAV_CORE.map((item) => {
                  const Icon = item.icon;

                  if (item.subItems) {
                    const hasActiveSubItem = item.subItems.some(sub => isActive(sub.path));
                    return (
                      <div key={item.name}>
                        <button
                          onClick={() => toggleCoreItem(item.name)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                            hasActiveSubItem ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                          }`}
                          style={hasActiveSubItem ? { background: "var(--trust-blue)", color: "#0B1015" } : {}}
                        >
                          <div className="flex items-center">
                            <Icon className="w-3.5 h-3.5 mr-2.5 shrink-0" />
                            {item.name}
                          </div>
                          {expandedCoreItems[item.name]
                            ? <ChevronDown className="w-3 h-3" />
                            : <ChevronRight className="w-3 h-3" />}
                        </button>
                        {expandedCoreItems[item.name] && (
                          <div className="pl-6 mt-0.5 space-y-0.5">
                            {item.subItems.map((subItem) => {
                              const active = isActive(subItem.path);
                              return (
                                <Link
                                  key={subItem.path}
                                  to={subItem.path}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`flex items-center px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                                    active ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                                  }`}
                                >
                                  {subItem.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const active = item.path ? isActive(item.path) : false;
                  return (
                    <Link
                      key={item.path}
                      to={item.path!}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}
                      style={active ? { background: "var(--trust-blue)", color: "#0B1015" } : {}}
                    >
                      <Icon className="w-3.5 h-3.5 mr-2.5 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="h-px bg-border" />

              {/* Grouped links */}
              <div className="space-y-2">
                {NAV_GROUPS.map((group) => (
                  <div key={group.label}>
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="uppercase tracking-widest">{group.label}</span>
                        {group.locked && <Lock className="w-2.5 h-2.5" />}
                      </div>
                      {expandedGroups[group.label]
                        ? <ChevronDown className="w-3 h-3" />
                        : <ChevronRight className="w-3 h-3" />}
                    </button>
                    {expandedGroups[group.label] && (
                      <div className="pl-3 mt-0.5 space-y-0.5">
                        {group.links.map((link) => {
                          const active = isActive(link.path);
                          return (
                            <Link
                              key={link.name}
                              to={link.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center px-3 py-2 rounded-lg text-xs font-mono transition-all ${active ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"}`}
                            >
                              {link.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            {/* Bottom: upgrade + sign out */}
            <div className="p-4 border-t border-border mt-auto space-y-2">
              <button
                onClick={() => { setIsAuthModalOpen(true); setMobileMenuOpen(false); }}
                className="w-full h-10 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5"
                style={{ background: "var(--trust-blue)", color: "#0B1015" }}
              >
                <Crown className="w-3.5 h-3.5" />
                Upgrade to Pro
              </button>
              <button
                onClick={handleSignOut}
                className="w-full h-9 rounded-lg text-xs font-mono font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background custom-scrollbar relative">
        <div className="h-full">
          {children ? children : <Outlet />}
        </div>
      </main>

      <AuthCheckoutModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
