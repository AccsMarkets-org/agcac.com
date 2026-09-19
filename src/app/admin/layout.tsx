'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, MessageCircle, Phone, AlertTriangle, ClipboardList,
  Building2, UserCheck, Calendar, Briefcase, FileText, Receipt, CreditCard,
  FolderOpen, Settings, BarChart3, Download, Bell, Trash2, ChevronDown,
  ChevronRight, Menu, X, LogOut, Shield, Wrench, Star, Activity,
  TrendingUp, Home, Globe, Award, Calculator, Upload, BookOpen, Package,
  Brain, Bot, Zap, ScanLine, ClipboardCheck, TrendingDown, MessageSquare,
  ScrollText, SlidersHorizontal
} from 'lucide-react';

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Notifications', href: '/admin/notifications', icon: <Bell className="w-4 h-4" />, badge: '3', badgeColor: 'bg-red-500' },
      { label: 'Activity Log', href: '/admin/activity', icon: <Activity className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Lead Management',
    items: [
      { label: 'All Leads', href: '/admin/leads', icon: <Users className="w-4 h-4" />, badge: 'New', badgeColor: 'bg-blue-500' },
      { label: 'Quote Requests', href: '/admin/quote-requests', icon: <FileText className="w-4 h-4" /> },
      { label: 'Emergency Requests', href: '/admin/emergency-requests', icon: <AlertTriangle className="w-4 h-4" />, badge: '!', badgeColor: 'bg-red-600' },
      { label: 'WhatsApp Leads', href: '/admin/whatsapp-leads', icon: <MessageCircle className="w-4 h-4" /> },
      { label: 'Call Leads', href: '/admin/call-leads', icon: <Phone className="w-4 h-4" /> },
      { label: 'Project Inquiries', href: '/admin/project-inquiries', icon: <Building2 className="w-4 h-4" /> },
      { label: 'AMC Requests', href: '/admin/amc-contracts', icon: <ClipboardList className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Customers', href: '/admin/customers', icon: <UserCheck className="w-4 h-4" /> },
      { label: 'Site Visits', href: '/admin/site-visits', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Technician Jobs', href: '/admin/technician-jobs', icon: <Wrench className="w-4 h-4" /> },
      { label: 'Quotations', href: '/admin/quotations', icon: <FileText className="w-4 h-4" /> },
      { label: 'Invoices', href: '/admin/invoices', icon: <Receipt className="w-4 h-4" /> },
      { label: 'Payments', href: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Portfolio & Content',
    items: [
      { label: 'Projects Portfolio', href: '/admin/projects', icon: <FolderOpen className="w-4 h-4" /> },
      { label: 'Services', href: '/admin/services', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Certificates', href: '/admin/certificates', icon: <Award className="w-4 h-4" /> },
      { label: 'Team', href: '/admin/team', icon: <Users className="w-4 h-4" /> },
      { label: 'Website Content', href: '/admin/website-content', icon: <Globe className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Analytics & Reports',
    items: [
      { label: 'Ads Tracking', href: '/admin/ads-tracking', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
      { label: 'Reports', href: '/admin/reports', icon: <Star className="w-4 h-4" /> },
      { label: 'Export Data', href: '/admin/export', icon: <Download className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Tax & Compliance',
    items: [
      { label: 'Tax Overview', href: '/admin/tax', icon: <Calculator className="w-4 h-4" /> },
      { label: 'Upload & OCR', href: '/admin/tax/upload', icon: <Upload className="w-4 h-4" /> },
      { label: 'Purchase Invoices', href: '/admin/tax/purchase-invoices', icon: <Package className="w-4 h-4" /> },
      { label: 'Sales Invoices', href: '/admin/tax/sales-invoices', icon: <Receipt className="w-4 h-4" /> },
      { label: 'VAT Dashboard', href: '/admin/tax/vat', icon: <Calculator className="w-4 h-4" /> },
      { label: 'VAT Returns', href: '/admin/tax/vat-returns', icon: <FileText className="w-4 h-4" /> },
      { label: 'Corporate Tax', href: '/admin/tax/corporate-tax', icon: <BookOpen className="w-4 h-4" /> },
      { label: 'Submission Center', href: '/admin/tax/submission', icon: <Upload className="w-4 h-4" /> },
      { label: 'Tax Reports', href: '/admin/tax/reports', icon: <BarChart3 className="w-4 h-4" /> },
      { label: 'Audit Log', href: '/admin/tax/audit-log', icon: <Activity className="w-4 h-4" /> },
      { label: 'Tax Settings', href: '/admin/tax/settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Legal & Privacy',
    items: [
      { label: 'Legal Pages', href: '/admin/legal-pages', icon: <FileText className="w-4 h-4" /> },
      { label: 'Privacy Requests', href: '/admin/privacy-requests', icon: <Shield className="w-4 h-4" /> },
    ],
  },
  {
    title: 'AI Automation',
    items: [
      { label: 'AI Dashboard', href: '/admin/ai/dashboard', icon: <Brain className="w-4 h-4" />, badge: 'New', badgeColor: 'bg-indigo-600' },
      { label: 'Invoice Upload', href: '/admin/ai/invoice-upload', icon: <ScanLine className="w-4 h-4" /> },
      { label: 'Document Queue', href: '/admin/ai/document-queue', icon: <ScrollText className="w-4 h-4" /> },
      { label: 'Review Center', href: '/admin/ai/review-center', icon: <ClipboardCheck className="w-4 h-4" /> },
      { label: 'Automation Rules', href: '/admin/ai/automation-rules', icon: <Zap className="w-4 h-4" /> },
      { label: 'AI Suggestions', href: '/admin/ai/suggestions', icon: <TrendingDown className="w-4 h-4" /> },
      { label: 'Anomaly Detection', href: '/admin/ai/anomaly-detection', icon: <AlertTriangle className="w-4 h-4" /> },
      { label: 'Tax Assistant', href: '/admin/ai/tax-assistant', icon: <Calculator className="w-4 h-4" /> },
      { label: 'AI Chat', href: '/admin/ai/chat-assistant', icon: <Bot className="w-4 h-4" /> },
      { label: 'AI Audit Logs', href: '/admin/ai/logs', icon: <Activity className="w-4 h-4" /> },
      { label: 'AI Settings', href: '/admin/ai/settings', icon: <SlidersHorizontal className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Careers & HR',
    items: [
      { label: 'Jobs', href: '/admin/careers/jobs', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Applications', href: '/admin/careers/applications', icon: <ClipboardList className="w-4 h-4" />, badge: 'HR', badgeColor: 'bg-emerald-600' },
      { label: 'Candidates', href: '/admin/careers/candidates', icon: <UserCheck className="w-4 h-4" /> },
      { label: 'Interviews', href: '/admin/careers/interviews', icon: <Calendar className="w-4 h-4" /> },
      { label: 'Career Settings', href: '/admin/careers/settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Users & Roles', href: '/admin/users', icon: <Shield className="w-4 h-4" /> },
      { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
      { label: 'Trash', href: '/admin/trash', icon: <Trash2 className="w-4 h-4" /> },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const mainRef = useRef<HTMLDivElement>(null);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Scroll main content to top on navigation
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  // Don't render admin layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
          <span className="text-white font-black text-sm">AG</span>
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-tight">Al Ghawas</div>
            <div className="text-amber-400 text-xs font-medium">Admin CRM</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5">
                {group.title}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group relative ${
                      active
                        ? 'bg-red-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${item.badgeColor || 'bg-gray-600'}`}>
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${item.badgeColor || 'bg-gray-600'}`} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="border-t border-gray-800 p-3 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          title={collapsed ? 'View Website' : undefined}
        >
          <Home className="w-4 h-4 shrink-0" />
          {!collapsed && <span>View Website</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-colors"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col bg-gray-900 transition-all duration-200 shrink-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-gray-900 z-50 flex flex-col overflow-y-auto">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Desktop collapse */}
              <button
                className="hidden lg:block p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setCollapsed(!collapsed)}
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Breadcrumb */}
              <div className="text-sm text-gray-500">
                <span className="text-gray-800 font-semibold">Admin Panel</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/notifications"
                className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AD</span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
