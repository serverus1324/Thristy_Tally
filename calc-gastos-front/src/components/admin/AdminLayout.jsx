import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import './AdminStyles.css';

const IconSearch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const IconBell = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);

const AdminLayout = () => {
    const { user } = useAuth();

    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main-container">
                <header className="admin-topbar">
                    <div className="admin-search">
                        <IconSearch />
                        <input type="text" placeholder="Buscar usuarios, reportes..." />
                    </div>
                    <div className="admin-topbar-actions">
                        <div className="admin-notifications">
                            <IconBell />
                        </div>
                        <div className="admin-profile-pill">
                            <div className="admin-user-avatar">
                                {user?.nombre ? user.nombre[0].toUpperCase() : 'A'}
                            </div>
                            <div className="admin-profile-info">
                                <div className="admin-profile-name">{user?.nombre || 'Administrador'}</div>
                                <div className="admin-profile-status">● En línea</div>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
