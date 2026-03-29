import { useState, useEffect } from "react";
import { findApplications } from "../../../api/api";
import "./FindApplications.css";

export const FindApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

    const statusMap = {
        "PENDING": { label: "На рассмотрении", class: "status-pending"},
        "APPROVED": { label: "Одобрена", class: "status-approved"},
        "REJECTED": { label: "Отклонена", class: "status-rejected"}
    };

    useEffect(() => {
        loadApplications(1);
    }, []);

    const loadApplications = async (page = 1) => {
        setLoading(true);
        setSubmitMessage({ type: "", text: "" });

        const result = await findApplications(page);

        if (result.success) {
            const responseData = result.data;
            const applicationsData = responseData.data || [];
            const total = responseData.total || 0;
            const serverPageSize = responseData.pageSize || 10;

            setApplications(applicationsData);
            setTotalItems(total);
            setPageSize(serverPageSize);
            setCurrentPage(page);

            const totalPagesCount = Math.ceil(total / serverPageSize);
            setTotalPages(totalPagesCount);

            setSearchPerformed(true);

            if (applicationsData.length === 0) {
                setSubmitMessage({
                    type: "info",
                    text: "Заявки не найдены."
                });
            }
        } else {
            setSubmitMessage({
                type: "error",
                text: result.error
            });
            setApplications([]);
            setTotalItems(0);
            setTotalPages(0);
        }

        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadApplications(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            loadApplications(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const formatMoney = (amount) => {
        if (amount === null || amount === undefined) return "—";
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="btn primary-button"
                >
                    &laquo; Назад
                </button>

                {startPage > 1 && (
                    <>
                        <button onClick={() => handlePageChange(1)} className="pagination-button">
                            1
                        </button>
                        {startPage > 2 && <span className="pagination-dots">...</span>}
                    </>
                )}

                {pageNumbers.map(pageNum => (
                    <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`pagination-button ${pageNum === currentPage ? 'active' : ''}`}
                        disabled={loading}
                    >
                        {pageNum}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
                        <button onClick={() => handlePageChange(totalPages)} className="pagination-button">
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="btn primary-button"
                >
                    Вперед &raquo;
                </button>
            </div>
        );
    };

    const renderApplicationCard = (application, index) => {
        const status = statusMap[application.status] || { label: application.status, class: "status-unknown", icon: "❓" };

        return (
            <div key={application.applicationId || index} className="application-card">
                <div className="card-header">
                    <div className="application-id">
                        <span className="id-label">Заявка №</span>
                        <span className="id-value">{application.applicationId}</span>
                    </div>
                    <div className={`status-badge ${status.class}`}>
                        <span className="status-icon">{status.icon}</span>
                        <span className="status-text">{status.label}</span>
                    </div>
                </div>

                <div className="card-content">
                    {application.status === "APPROVED" ? (
                        <>
                            <div className="info-section">
                                <h4>Одобренные условия</h4>
                                <div className="info-row">
                                    <span className="info-label">Сумма: </span>
                                    <span className="info-value highlight">{formatMoney(application.approvedMoney)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Срок: </span>
                                    <span className="info-value highlight">{application.approvedTerm} дней</span>
                                </div>
                            </div>
                        </>
                    ) : application.status === "REJECTED" ? (
                        <p>К сожалению, заявка была отклонена.</p>
                    ) : (
                        <div className="info-section pending-info">
                            <div className="pending-message">
                                <p>Заявка находится на рассмотрении.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="find-applications">
            <h2>Кредитные заявки</h2>

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-actions">
                    <button type="submit" className="btn primary-button" disabled={loading}>
                        {loading ? "Загрузка..." : "Обновить список"}
                    </button>
                </div>
            </form>

            {submitMessage.text && (
                <div className={`submit-message ${submitMessage.type}`}>
                    {submitMessage.text}
                </div>
            )}

            {loading && (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Загрузка заявок...</p>
                </div>
            )}

            {!loading && searchPerformed && applications.length > 0 && (
                <>
                    <div className="results-info">
                        <div className="stats">
                            <div className="stat-item">
                                <span className="stat-label">Всего заявок: </span>
                                <span className="stat-value">{totalItems}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Страница:</span>
                                <span className="stat-value">{currentPage} из {totalPages}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">На странице: </span>
                                <span className="stat-value">{applications.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="applications-grid">
                        {applications.map((application, index) => renderApplicationCard(application, index))}
                    </div>

                    {renderPagination()}
                </>
            )}
        </div>
    );
};