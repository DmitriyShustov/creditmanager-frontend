import { useState } from "react";
import { findClients } from "../../../api/api";
import { validateName, validatePassport, validatePhone } from "../../../validators/validation";
import "./FindClients.css";

export const FindClients = () => {
    const [filters, setFilters] = useState({
        firstName: "",
        lastName: "",
        middleName: "",
        passport: "",
        phone: ""
    });

    const [errors, setErrors] = useState({});
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

    const maritalStatusMap = [
        { value: "NEVER_MARRIED", label: "Не был/а женат/замужем" },
        { value: "MARRIED", label: "Женат/Замужем" },
        { value: "CIVIL_MARRIAGE", label: "Официально не замужем" },
        { value: "WIDOWED", label: "Вдовец/Вдова" },
        { value: "DIVORCED", label: "Разведен(а)" },
        { value: "SEPARATED", label: "Не разведен/разведена" },
    ];

    const handleInputChange = (field, value) => {
        setFilters({
            ...filters,
            [field]: value
        });

        // Clear error for this field
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: undefined
            });
        }

        // Clear submit message
        if (submitMessage.text) {
            setSubmitMessage({ type: "", text: "" });
        }
    };

    const validateFilters = () => {
        const newErrors = {};

        // Validate firstName (optional)
        const firstNameError = validateName(filters.firstName, "Имя", false);
        if (firstNameError) newErrors.firstName = firstNameError;

        // Validate lastName (optional)
        const lastNameError = validateName(filters.lastName, "Фамилия", false);
        if (lastNameError) newErrors.lastName = lastNameError;

        // Validate middleName (optional)
        const middleNameError = validateName(filters.middleName, "Отчество", false);
        if (middleNameError) newErrors.middleName = middleNameError;

        // Validate passport (optional)
        if (filters.passport && !/^\d{10}$/.test(filters.passport)) {
            newErrors.passport = "Неверный формат паспорта (10 цифр)";
        }

        // Validate phone (optional)
        if (filters.phone && !/^\+?\d{11}$/.test(filters.phone)) {
            newErrors.phone = "Неверный формат телефона (11 цифр, может начинаться с +)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const loadClients = async (page = 1) => {
        if (!validateFilters()) {
            return;
        }

        setLoading(true);
        setSubmitMessage({ type: "", text: "" });

        const result = await findClients(filters, page);

        if (result.success) {
            const responseData = result.data;
            const clientsData = responseData.data || [];
            const total = responseData.total || 0;
            const serverPageSize = responseData.pageSize || 10;

            setClients(clientsData);
            setTotalItems(total);
            setPageSize(serverPageSize);
            setCurrentPage(page);

            // Рассчитываем общее количество страниц на основе total и pageSize с сервера
            const totalPagesCount = Math.ceil(total / serverPageSize);
            setTotalPages(totalPagesCount);

            setSearchPerformed(true);

            if (clientsData.length === 0) {
                setSubmitMessage({
                    type: "info",
                    text: "Клиенты не найдены. Попробуйте изменить параметры поиска."
                });
            }
        } else {
            setSubmitMessage({
                type: "error",
                text: result.error
            });
            setClients([]);
            setTotalItems(0);
            setTotalPages(0);
        }

        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadClients(1);
    };

    const handleReset = () => {
        setFilters({
            firstName: "",
            lastName: "",
            middleName: "",
            passport: "",
            phone: ""
        });
        setErrors({});
        setClients([]);
        setSearchPerformed(false);
        setSubmitMessage({ type: "", text: "" });
        setCurrentPage(1);
        setTotalItems(0);
        setTotalPages(0);
        setPageSize(10);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            loadClients(newPage);
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

    const renderClientCard = (client, index) => {
        return (
            <div key={index} className="client-card">
                <div className="card-header">
                    <h3>{client.lastName} {client.firstName} {client.middleName || ""}</h3>
                </div>

                <div className="card-content">
                    <div className="info-section">
                        <h4>Паспортные данные</h4>
                        <div className="info-row">
                            <span className="info-label">Паспорт: </span>
                            <span className="info-value">{client.passport}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Телефон: </span>
                            <span className="info-value">{client.phone}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Адрес: </span>
                            <span className="info-value">{client.address}</span>
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>Семейное положение</h4>
                        <div className="info-row">
                            <span className="info-label">Статус: </span>
                            <span className="info-value">{maritalStatusMap[client.maritalStatus] || client.maritalStatus}</span>
                        </div>
                    </div>

                    {(client.organizationName || client.employmentPosition || client.employmentDate) && (
                        <div className="info-section">
                            <h4>Информация о работе</h4>
                            {client.organizationName && (
                                <div className="info-row">
                                    <span className="info-label">Организация: </span>
                                    <span className="info-value">{client.organizationName}</span>
                                </div>
                            )}
                            {client.employmentPosition && (
                                <div className="info-row">
                                    <span className="info-label">Должность: </span>
                                    <span className="info-value">{client.employmentPosition}</span>
                                </div>
                            )}
                            {client.employmentDate && (
                                <div className="info-row">
                                    <span className="info-label">Дата трудоустройства: </span>
                                    <span className="info-value">{formatDate(client.employmentDate)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="find-clients">
            <h2>Поиск клиентов</h2>

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="lastName">Фамилия</label>
                        <input
                            type="text"
                            id="lastName"
                            value={filters.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className={errors.lastName ? "error" : ""}
                            placeholder="Введите фамилию"
                        />
                        {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="firstName">Имя</label>
                        <input
                            type="text"
                            id="firstName"
                            value={filters.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                            className={errors.firstName ? "error" : ""}
                            placeholder="Введите имя"
                        />
                        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="middleName">Отчество</label>
                        <input
                            type="text"
                            id="middleName"
                            value={filters.middleName}
                            onChange={(e) => handleInputChange("middleName", e.target.value)}
                            className={errors.middleName ? "error" : ""}
                            placeholder="Введите отчество"
                        />
                        {errors.middleName && <span className="error-message">{errors.middleName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="passport">Паспорт</label>
                        <input
                            type="text"
                            id="passport"
                            value={filters.passport}
                            onChange={(e) => handleInputChange("passport", e.target.value)}
                            className={errors.passport ? "error" : ""}
                            placeholder="10 цифр"
                            maxLength="10"
                        />
                        {errors.passport && <span className="error-message">{errors.passport}</span>}
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="phone">Телефон</label>
                        <input
                            type="tel"
                            id="phone"
                            value={filters.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className={errors.phone ? "error" : ""}
                            placeholder="+79123456789"
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn primary-button" disabled={loading}>
                        {loading ? "Поиск..." : "Найти клиентов"}
                    </button>
                    <button type="button" className="btn secondary-button" onClick={handleReset} disabled={loading}>
                        Очистить фильтры
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
                    <p>Загрузка...</p>
                </div>
            )}

            {!loading && searchPerformed && clients.length > 0 && (
                <>
                    <div className="results-info">
                        <p>Найдено клиентов: <strong>{totalItems}</strong></p>
                        <p>Страница {currentPage} из {totalPages}</p>
                        <p>Показывается по: <strong>{pageSize}</strong> на странице</p>
                    </div>

                    <div className="clients-grid">
                        {clients.map((client, index) => renderClientCard(client, index))}
                    </div>

                    {renderPagination()}
                </>
            )}
        </div>
    );
};