import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import './ContractsPage.css';

const ContractsPage = () => {
    // Mock contracts data - will be replaced with DynamoDB data
    const contracts = [];

    return (
        <div className="contracts-page">
            {/* Header */}
            <div className="contracts-header animate-fadeIn">
                <div className="header-left">
                    <h1>My Contracts</h1>
                    <p>Manage and view your uploaded rental contracts</p>
                </div>
                <div className="header-right">
                    <Link to="/upload">
                        <Button variant="primary">
                            + Upload New
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Contracts List */}
            {contracts.length === 0 ? (
                <Card variant="glass" padding="xl" className="empty-state animate-slideUp">
                    <div className="empty-content">
                        <div className="empty-icon">📁</div>
                        <h2>No Contracts Yet</h2>
                        <p>Upload your first rental contract to get started with AI analysis</p>
                        <Link to="/upload">
                            <Button variant="primary" size="lg">
                                Upload Your First Contract
                            </Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="contracts-grid">
                    {contracts.map((contract, index) => (
                        <Link
                            key={contract.contractId}
                            to={`/contracts/${contract.contractId}`}
                            className="contract-link"
                        >
                            <Card
                                variant="elevated"
                                padding="md"
                                hoverable
                                className="contract-card animate-slideUp"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="contract-header">
                                    <div className="contract-icon">📄</div>
                                    <div className="contract-status" data-status={contract.status}>
                                        {contract.status === 'analyzed' && '✅ Analyzed'}
                                        {contract.status === 'processing' && '⏳ Processing'}
                                        {contract.status === 'uploaded' && '📤 Uploaded'}
                                        {contract.status === 'error' && '❌ Error'}
                                    </div>
                                </div>

                                <div className="contract-info">
                                    <h3>{contract.fileName}</h3>
                                    <p className="contract-date">
                                        Uploaded: {new Date(contract.uploadDate).toLocaleDateString()}
                                    </p>
                                    {contract.metadata?.propertyAddress && (
                                        <p className="contract-property">
                                            📍 {contract.metadata.propertyAddress}
                                        </p>
                                    )}
                                </div>

                                <div className="contract-footer">
                                    <span className="contract-size">
                                        {(contract.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                    <span className="contract-action">View →</span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Features Preview - Coming Soon */}
            <Card variant="glass" padding="lg" className="features-preview animate-fadeIn" style={{ animationDelay: '500ms' }}>
                <h3>Coming in Week 5-6</h3>
                <div className="feature-items">
                    <div className="feature-item">
                        <span className="feature-icon">🤖</span>
                        <span>AI Contract Analysis</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">⚠️</span>
                        <span>Risk Assessment</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">💡</span>
                        <span>Negotiation Suggestions</span>
                    </div>
                    <div className="feature-item">
                        <span className="feature-icon">📊</span>
                        <span>Market Comparison</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ContractsPage;
