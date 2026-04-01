import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AccessLogger from "@/components/auth/AccessLogger.jsx";
import { updateAccessLog } from "@/functions/updateAccessLog";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Calendar,
    CreditCard,
    Settings,
    Menu,
    X,
    FileText,
    ClipboardList,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Empleados", icon: Users, page: "Employees" },
    { name: "Proyectos", icon: FolderKanban, page: "Projects" },
    { name: "Certificaciones", icon: FileText, page: "Certifications" },
    { name: "Vencimientos", icon: CreditCard, page: "PaymentsDue" },
    { name: "Agenda", icon: Calendar, page: "WorkAgenda" },
    { name: "Administración", icon: ClipboardList, page: "Administration" },
    { name: "Gestión", icon: Settings, page: "Management" },
];

export default function Layout({ children, currentPageName }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isBlocked, setIsBlocked] = useState(false);

    const handleLogout = async () => {
        const logId = sessionStorage.getItem('access_log_id');
        if (logId) {
            try {
                await updateAccessLog({ log_id: logId, status: 'closed' });
            } catch (e) {}
            sessionStorage.removeItem('access_log_id');
        }
        base44.auth.logout();
    };
    const urlParams = new URLSearchParams(window.location.search);
    const currentTab = urlParams.get('tab');

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await base44.auth.me();
                setUser(userData);
                if (userData?.status === 'blocked') {
                    setIsBlocked(true);
                }
            } catch (e) {
                console.log("User not logged in");
            }
        };
        loadUser();
    }, []);

    if (isBlocked) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
                    <p className="text-gray-600 mb-6">Tu cuenta ha sido bloqueada por un administrador. Contacta con el administrador del sistema para más información.</p>
                    <button onClick={() => base44.auth.logout()} className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">Cerrar sesión</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AccessLogger />
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-900 to-green-800 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col`}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-5 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">O</span>
                        </div>
                        <span className="text-lg font-bold text-white tracking-wide">OMENAR</span>
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden text-green-200 hover:text-white hover:bg-green-700" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPageName === item.page && (!item.tab || currentTab === item.tab);
                        const url = item.tab ? `${item.page}?tab=${item.tab}` : item.page;
                        return (
                            <Link
                                key={item.page + (item.tab || '')}
                                to={createPageUrl(url)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                        : 'text-green-100 hover:bg-green-700 hover:text-white'
                                }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-green-200 group-hover:text-white'}`} />
                                <span className="text-sm font-medium">{item.name}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-green-700">
                    <p className="text-xs text-slate-500 text-center">Gestión de Ingeniería</p>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 lg:ml-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 lg:px-6">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex-1" />
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-bold">
                                        {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-800 hidden sm:block">{user.full_name || user.email}</span>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-md hover:shadow-lg transition-all font-semibold"
                                title="Cerrar sesión"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Salir</span>
                            </Button>
                        </div>
                    )}
                </header>

                {/* Page content */}
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}