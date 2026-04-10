/**
 * ============================================
 *  AnalysisBentoGrid Component
 *  Dashboard-style overview of contract details
 * ============================================
 * 
 * STRUCTURE:
 * - Risk score gauge
 * - Key insights and party info
 * 
 * DEPENDENCIES:
 * - components/domain/ScoreBreakdown
 * ============================================
 */
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateContract } from '@/features/contracts/services/contractsApi';
import { showAppToast } from '@/utils/toast';
import EditContractModal from '@/features/contracts/components/EditContractModal';
import { 
    AlertTriangle, 
    MapPin, 
    UserRound, 
    RefreshCw, 
    FileDown, 
    ChevronDown, 
    FileText,
    Pencil
} from 'lucide-react';
import ActionMenu from '@/components/ui/ActionMenu';
import MapComponent from '@/components/ui/MapComponent';
import './AnalysisBentoGrid.css';

const AnalysisBentoGrid = ({
    activeTab,
    riskScore,
    getHealthTier,
    fetchAnalysis,
    showExportMenu,
    setShowExportMenu,
    handleExportWord,
    handleExportContractWord,
    isExporting,
    issuesCount,
    analysis,
    isRTL,
    t
}) => {    const { user, userAttributes } = useAuth();
    const userId = userAttributes?.sub || user?.userId || user?.sub || user?.username;

    const [editModal, setEditModal] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleEditClick = () => {
        if (!analysis) return;
        setEditModal({
            contractId: analysis.contractId,
            fileName: analysis.fileName || '',
            propertyAddress: analysis.propertyAddress || '',
            landlordName: analysis.landlordName || ''
        });
    };

    const saveEdit = async () => {
        if (!editModal || !userId) return;
        setIsSaving(true);
        try {
            const updates = {
                fileName: editModal.fileName.trim() || t('contracts.defaultFileName'),
                propertyAddress: editModal.propertyAddress.trim(),
                landlordName: editModal.landlordName.trim()
            };
            await updateContract(editModal.contractId, userId, updates);
            setEditModal(null);
            showAppToast(t('contracts.editSuccess'), 'success', isRTL);
            if (fetchAnalysis) {
                fetchAnalysis();
            }
        } catch (error) {
            console.error('Error updating contract metadata:', error);
            showAppToast(t('contracts.editError'), 'error', isRTL);
        } finally {
            setIsSaving(false);
        }
    };
    if (activeTab !== 'issues') return null;

    return (
        <div className="lf-bento-grid no-print">
            
            <div className={`lf-bento-score ${getHealthTier(riskScore)}`}>
                <div className="lf-score-bg-glow"></div>
                <div className="lf-score-header">
                    <span className="lf-score-label">{t('analysis.aggregateIntelligence')}</span>
                    <h2>{t('analysis.overallHealth')}</h2>
                </div>
                <div className="lf-score-body">
                    <svg className="lf-score-ring" viewBox="0 0 120 120">
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth="8"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.9)"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 54}
                            strokeDashoffset={2 * Math.PI * 54 - (riskScore / 100) * (2 * Math.PI * 54)}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                        />
                    </svg>
                    <div className="lf-score-text">
                        <span className="lf-score-big">{riskScore}</span>
                        <span className="lf-score-small">/100</span>
                    </div>
                </div>
            </div>

            <div className="lf-bento-tiles">
                
                <div className="lf-tile lf-tile-glass lf-quick-actions-tile">
                    <h3>{t('analysis.quickActions')}</h3>
                    <div className="lf-quick-actions-grid">
                        <button className="lf-action-btn" onClick={fetchAnalysis}>
                            <RefreshCw size={16} />
                            <span>{t('analysis.refresh')}</span>
                        </button>
                        <ActionMenu
                            isOpen={showExportMenu}
                            onToggle={() => setShowExportMenu(!showExportMenu)}
                            onClose={() => setShowExportMenu(false)}
                            containerClassName="lf-export-dropdown"
                            triggerClassName="lf-action-btn"
                            triggerContent={
                                <>
                                    <FileDown size={16} />
                                    <span>{t('analysis.export')}</span>
                                    <ChevronDown size={14} />
                                </>
                            }
                            panelClassName="lf-export-menu"
                        >
                            <div className="export-menu-group-title">{t('analysis.exportMenuDownload')}</div>
                            <button onClick={handleExportWord} disabled={isExporting}><FileText size={14}/><span>{t('analysis.exportMenuWordTitle')}</span></button>
                            <button onClick={handleExportContractWord} disabled={isExporting}><FileText size={14} /><span>{t('analysis.exportMenuFullContractWordTitle')}</span></button>
                        </ActionMenu>
                    </div>
                </div>

                <div className="lf-tile lf-tile-glass" style={{ textAlign: 'center', justifyContent: 'center' }}>
                    <div className="lf-tile-header" style={{ justifyContent: 'center', gap: '8px' }}>
                        <AlertTriangle size={28} className="lf-tile-icon error" />
                        <span className="lf-tile-badge error">{t('analysis.actionRequired')}</span>
                    </div>
                    <h3 style={{ marginBottom: '1rem' }}>{t('analysis.issues')}</h3>
                    <p className="lf-tile-big-text">{issuesCount}</p>
                </div>

                <div className="lf-tile lf-tile-glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem', position: 'relative' }}>
                    <div className="lf-tile-wide-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>{t('analysis.contractMetadata')}</h3>
                            <button 
                                onClick={handleEditClick}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}
                                title={t('contracts.editTitle')}
                            >
                                <Pencil size={14} />
                            </button>
                        </div>
                        <div className="lf-meta-rows" style={{ margin: 0 }}>
                            {analysis?.propertyAddress && (
                                <div className="lf-meta-row" style={{ marginBottom: '10px' }}>
                                    <MapPin size={16} /> <span>{analysis.propertyAddress}</span>
                                </div>
                            )}
                            {analysis?.landlordName && (
                                <div className="lf-meta-row">
                                    <UserRound size={16} /> <span>{analysis.landlordName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lf-tile-wide-side" style={{ textAlign: 'start', marginTop: '1.5rem', justifyContent: 'flex-start' }}>
                        <p className="lf-side-label">{t('contracts.uploadDate')}</p>
                        <p className="lf-side-value" style={{ margin: 0 }}>
                                {analysis?.uploadDate ? new Date(analysis.uploadDate).toLocaleDateString(isRTL ? 'he-IL' : 'en-US') : '--'}
                        </p>
                    </div>
                </div>

                <div className="lf-tile lf-tile-glass" style={{ padding: 0, overflow: 'hidden', minHeight: '220px' }}>
                    <MapComponent
                        address={analysis?.propertyAddress || ''}
                        popupText={analysis?.propertyAddress || 'הכתובת שסופקה'}
                        height="100%"
                    />
                </div>
            </div>

            <EditContractModal
                editModal={editModal}
                setEditModal={setEditModal}
                saveEdit={saveEdit}
                isSaving={isSaving}
                t={t}
            />
        </div>
    );
};

export default AnalysisBentoGrid;
