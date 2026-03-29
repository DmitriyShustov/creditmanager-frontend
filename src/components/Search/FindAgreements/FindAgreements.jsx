import { useState, useEffect } from "react";
import { findSignedAgreements } from "../../../api/api.js";
import "./FindAgreements.css";

export const FindAgreements = () => {
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        loadAgreements(1);
    }, []);

    const loadAgreements = async (page = 1) => {
        setLoading(true);
        setSubmitMessage({ type: "", text: "" });

        const result = await findSignedAgreements(page);

        if (result.success) {
            const responseData = result.data;
            const agreementsData = responseData.data || [];
            const total = responseData.total || 0;
            const serverPageSize = responseData.pageSize || 10;

            setAgreements(agreementsData);
            setTotalItems(total);
            setPageSize(serverPageSize);
            setCurrentPage(page);

            const totalPagesCount = Math.ceil(total / serverPageSize);
            setTotalPages(totalPagesCount);

            setSearchPerformed(true);

            if (agreementsData.length === 0) {
                setSubmitMessage({
                    type: "info",
                    text: "Подписанные договоры не найдены."
                });
            }
        } else {
            setSubmitMessage({
                type: "error",
                text: result.error
            });
            setAgreements([]);
            setTotalItems(0);
            setTotalPages(0);
        }

        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadAgreements(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            loadAgreements(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const formatDate = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return "—";
        const [year, month, day] = dateArray;
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
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
                    className="pagination-button"
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
                    className="pagination-button"
                >
                    Вперед &raquo;
                </button>
            </div>
        );
    };

    const renderAgreementCard = (agreement, index) => {
        return (
            <div key={agreement.id || index} className="agreement-card">
                <div className="card-header">
                    <div className="agreement-id">
                        <span className="id-label">Договор №</span>
                        <span className="id-value">{agreement.id}</span>
                    </div>
                    <div className="status-badge status-signed">
                        <span className="status-text">Подписан</span>
                    </div>
                </div>

                <div className="card-content">
                    <div className="info-section">
                        <div className="info-row">
                            <span className="info-label">ID заявки: </span>
                            <span className="info-value">{agreement.applicationId}</span>
                        </div>
                        <div>
                            <span>Дата подписания: </span>
                            <span>{formatDate(agreement.signDate)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="find-agreements">
            <h2>Подписанные договоры</h2>

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
                    <p>Загрузка договоров...</p>
                </div>
            )}

            {!loading && searchPerformed && agreements.length > 0 && (
                <>
                    <div className="results-info">
                        <div className="stats">
                            <div className="stat-item">
                                <span className="stat-label">Всего договоров: </span>
                                <span className="stat-value">{totalItems}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Страница: </span>
                                <span className="stat-value">{currentPage} из {totalPages}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">На странице: </span>
                                <span className="stat-value">{agreements.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="agreements-grid">
                        {agreements.map((agreement, index) => renderAgreementCard(agreement, index))}
                    </div>

                    {renderPagination()}
                </>
            )}
        </div>
    );
};