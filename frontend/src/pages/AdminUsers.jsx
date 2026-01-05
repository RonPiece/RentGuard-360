import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getUsers, disableUser, enableUser, deleteUser } from '../services/api';
import Button from '../components/Button';
import {
    Search,
    Ban,
    Check,
    Trash2,
    Users,
    AlertTriangle,
    RefreshCw,
    Mail,
    Calendar,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import './AdminDashboard.css';

const USERS_PER_PAGE = 10;

const AdminUsers = () => {
    const { t, isRTL } = useLanguage();
    const { isDark } = useTheme();
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Modal state
    const [modal, setModal] = useState({
        isOpen: false,
        type: null,
        username: null,
        title: '',
        message: '',
    });

    useEffect(() => {
        fetchAllUsers();
    }, []);

    useEffect(() => {
        if (allUsers.length > 0) {
            filterUsers();
        }
    }, [searchQuery, statusFilter, allUsers]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const fetchAllUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUsers('');
            setAllUsers(data.users || []);
            setUsers(data.users || []);
        } catch (err) {
            setError(err.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...allUsers];
        if (statusFilter === 'enabled') {
            filtered = filtered.filter(user => user.enabled);
        } else if (statusFilter === 'disabled') {
            filtered = filtered.filter(user => !user.enabled);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                (user.email?.toLowerCase().includes(query)) ||
                (user.name?.toLowerCase().includes(query))
            );
        }
        setUsers(filtered);
    };

    // Pagination logic
    const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * USERS_PER_PAGE;
        return users.slice(start, start + USERS_PER_PAGE);
    }, [users, currentPage]);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleDisableUser = async (username) => {
        setModal({
            isOpen: true,
            type: 'disable',
            username,
            title: t('admin.confirmDisableTitle') || 'Disable User',
            message: t('admin.confirmDisable'),
        });
    };

    const handleEnableUser = async (username) => {
        setActionLoading(username);
        try {
            await enableUser(username);
            fetchAllUsers();
        } catch (err) {
            setModal({
                isOpen: true,
                type: 'error',
                username: null,
                title: t('common.error') || 'Error',
                message: err.message,
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (username) => {
        setModal({
            isOpen: true,
            type: 'delete',
            username,
            title: t('admin.confirmDeleteTitle') || 'Delete User',
            message: t('admin.confirmDelete'),
        });
    };

    const handleModalConfirm = async () => {
        const { type, username } = modal;
        setModal({ ...modal, isOpen: false });

        if (type === 'disable') {
            setActionLoading(username);
            try {
                await disableUser(username, 'Admin action');
                fetchAllUsers();
            } catch (err) {
                setModal({
                    isOpen: true,
                    type: 'error',
                    username: null,
                    title: t('common.error') || 'Error',
                    message: err.message,
                });
            } finally {
                setActionLoading(null);
            }
        } else if (type === 'delete') {
            setModal({
                isOpen: true,
                type: 'deleteConfirm',
                username,
                title: t('admin.confirmDeleteFinalTitle') || 'Final Confirmation',
                message: t('admin.confirmDeleteFinal'),
            });
        } else if (type === 'deleteConfirm') {
            setActionLoading(username);
            try {
                await deleteUser(username);
                fetchAllUsers();
            } catch (err) {
                setModal({
                    isOpen: true,
                    type: 'error',
                    username: null,
                    title: t('common.error') || 'Error',
                    message: err.message,
                });
            } finally {
                setActionLoading(null);
            }
        }
    };

    const closeModal = () => setModal({ ...modal, isOpen: false });

    // Render a single user card for mobile view
    const renderUserCard = (user) => (
        <div
            key={user.username}
            className={`user-card ${!user.enabled ? 'disabled-user' : ''}`}
        >
            <div className="user-card-header">
                <div className="user-card-avatar">
                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="user-card-identity">
                    <span className="user-card-name">{user.name || '—'}</span>
                    <span className={`status-badge ${user.enabled ? 'active' : 'disabled'}`}>
                        <span className="status-dot"></span>
                        {user.enabled ? t('admin.active') : t('admin.suspended')}
                    </span>
                </div>
            </div>

            <div className="user-card-details">
                <div className="user-card-row">
                    <Mail size={14} />
                    <span className="user-card-email">{user.email || '—'}</span>
                </div>
                <div className="user-card-row">
                    <Calendar size={14} />
                    <span>
                        {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')
                            : '—'}
                    </span>
                </div>
            </div>

            <div className="user-card-actions">
                {user.enabled ? (
                    <button
                        className="action-btn danger"
                        onClick={() => handleDisableUser(user.username)}
                        disabled={actionLoading === user.username}
                    >
                        {actionLoading === user.username ? '...' : <Ban size={16} />}
                        <span>{t('admin.disable') || 'Disable'}</span>
                    </button>
                ) : (
                    <button
                        className="action-btn success"
                        onClick={() => handleEnableUser(user.username)}
                        disabled={actionLoading === user.username}
                    >
                        {actionLoading === user.username ? '...' : <Check size={16} />}
                        <span>{t('admin.enable') || 'Enable'}</span>
                    </button>
                )}
                <button
                    className="action-btn danger"
                    onClick={() => handleDeleteUser(user.username)}
                    disabled={actionLoading === user.username}
                >
                    {actionLoading === user.username ? '...' : <Trash2 size={16} />}
                    <span>{t('admin.delete') || 'Delete'}</span>
                </button>
            </div>
        </div>
    );

    // Pagination controls component
    const PaginationControls = () => (
        <div className="pagination-controls">
            <button
                className="pagination-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={18} />
            </button>
            <span className="pagination-info">
                {currentPage} / {totalPages || 1}
            </span>
            <button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );

    return (
        <div className={`admin-dashboard page-container ${isDark ? 'dark' : 'light'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <header className="admin-header">
                <h1>
                    <Users size={28} style={{ marginInlineEnd: '12px' }} />
                    {t('admin.usersTab') || 'User Management'}
                </h1>
            </header>

            <div className="admin-content">
                {error && (
                    <div className="error-banner">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                        <Button variant="secondary" size="small" onClick={fetchAllUsers}>
                            <RefreshCw size={14} />
                            {t('admin.tryAgain')}
                        </Button>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>{t('common.loading')}</p>
                    </div>
                ) : (
                    <div className="users-tab">
                        {/* Search and Filters */}
                        <div className="users-controls">
                            <div className="search-container">
                                <Search className="search-icon" size={16} />
                                <input
                                    type="text"
                                    placeholder={t('admin.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>

                            <div className="status-filter-buttons">
                                <button
                                    className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    {t('admin.allUsers')}
                                </button>
                                <button
                                    className={`filter-btn ${statusFilter === 'enabled' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('enabled')}
                                >
                                    <span className="status-indicator active"></span>
                                    {t('admin.activeOnly')}
                                </button>
                                <button
                                    className={`filter-btn ${statusFilter === 'disabled' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('disabled')}
                                >
                                    <span className="status-indicator disabled"></span>
                                    {t('admin.disabledOnly')}
                                </button>
                            </div>
                        </div>

                        {/* DESKTOP: Users Table */}
                        <div className="users-table-wrapper desktop-only">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>{t('admin.email')}</th>
                                        <th>{t('admin.name')}</th>
                                        <th>{t('admin.status')}</th>
                                        <th>{t('admin.joined')}</th>
                                        <th>{t('admin.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="no-data">{t('admin.noUsers')}</td>
                                        </tr>
                                    ) : (
                                        paginatedUsers.map(user => (
                                            <tr key={user.username} className={`user-row ${!user.enabled ? 'disabled-user' : ''}`}>
                                                <td>{user.email || '—'}</td>
                                                <td>{user.name || '—'}</td>
                                                <td>
                                                    <span className={`status-badge ${user.enabled ? 'active' : 'disabled'}`}>
                                                        <span className="status-dot"></span>
                                                        {user.enabled ? t('admin.active') : t('admin.suspended')}
                                                    </span>
                                                </td>
                                                <td>
                                                    {user.createdAt
                                                        ? new Date(user.createdAt).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')
                                                        : '—'
                                                    }
                                                </td>
                                                <td className="actions-cell">
                                                    <div className="action-buttons">
                                                        {user.enabled ? (
                                                            <button
                                                                className="action-icon-btn danger"
                                                                onClick={() => handleDisableUser(user.username)}
                                                                disabled={actionLoading === user.username}
                                                                title={t('admin.disable')}
                                                            >
                                                                {actionLoading === user.username ? '...' : <Ban size={16} />}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="action-icon-btn success"
                                                                onClick={() => handleEnableUser(user.username)}
                                                                disabled={actionLoading === user.username}
                                                                title={t('admin.enable')}
                                                            >
                                                                {actionLoading === user.username ? '...' : <Check size={16} />}
                                                            </button>
                                                        )}
                                                        <button
                                                            className="action-icon-btn danger"
                                                            onClick={() => handleDeleteUser(user.username)}
                                                            disabled={actionLoading === user.username}
                                                            title={t('admin.delete')}
                                                        >
                                                            {actionLoading === user.username ? '...' : <Trash2 size={16} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* MOBILE: User Cards */}
                        <div className="users-cards-list mobile-only">
                            {paginatedUsers.length === 0 ? (
                                <div className="no-data-card">{t('admin.noUsers')}</div>
                            ) : (
                                paginatedUsers.map(user => renderUserCard(user))
                            )}
                        </div>

                        {/* Pagination + Count */}
                        <div className="users-footer">
                            <p className="users-count">
                                {t('admin.showingUsers')?.replace('{count}', users.length) || `Total: ${users.length} users`}
                            </p>
                            {totalPages > 1 && <PaginationControls />}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modal.isOpen && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className={`admin-modal ${modal.type === 'error' ? 'modal-error' : 'modal-warning'}`} onClick={e => e.stopPropagation()}>
                        <h3>{modal.title}</h3>
                        <p>{modal.message}</p>
                        <div className="modal-actions">
                            {modal.type === 'error' ? (
                                <Button variant="primary" onClick={closeModal}>
                                    {t('common.ok') || 'OK'}
                                </Button>
                            ) : (
                                <>
                                    <Button variant="secondary" onClick={closeModal}>
                                        {t('common.cancel') || 'Cancel'}
                                    </Button>
                                    <Button
                                        variant={modal.type === 'deleteConfirm' ? 'danger' : 'primary'}
                                        onClick={handleModalConfirm}
                                    >
                                        {t('common.confirm') || 'Confirm'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
