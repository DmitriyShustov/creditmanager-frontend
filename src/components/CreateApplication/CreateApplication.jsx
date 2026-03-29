import { useState } from "react";
import { createApplication } from "../../api/api";
import { validateCreditApplication } from "../../validators/validation";
import "./CreateApplication.css";

export const CreateApplication = () => {
    const [formData, setFormData] = useState({
        clientData: {
            firstName: "",
            lastName: "",
            middleName: "",
            passport: "",
            maritalStatus: "",
            address: "",
            phone: "",
            employmentDate: "",
            employmentPosition: "",
            organizationName: ""
        },
        requestedMoney: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
    const [applicationResponse, setApplicationResponse] = useState(null);

    const maritalStatusOptions = [
        { value: "NEVER_MARRIED", label: "Не был/а женат/замужем" },
        { value: "MARRIED", label: "Женат/Замужем" },
        { value: "CIVIL_MARRIAGE", label: "Официально не замужем" },
        { value: "WIDOWED", label: "Вдовец/Вдова" },
        { value: "DIVORCED", label: "Разведен(а)" },
        { value: "SEPARATED", label: "Не разведен/разведена" },
    ];

    const statusMap = {
        "PENDING": { label: "На рассмотрении", class: "status-pending"},
        "APPROVED": { label: "Одобрена", class: "status-approved"},
        "REJECTED": { label: "Отклонена", class: "status-rejected"}
    };

    const handleInputChange = (section, field, value) => {
        if (section === "clientData") {
            setFormData({
                ...formData,
                clientData: {
                    ...formData.clientData,
                    [field]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [field]: value
            });
        }

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: undefined
            });
        }

        // Clear submit message and response when user starts typing
        if (submitMessage.text) {
            setSubmitMessage({ type: "", text: "" });
            setApplicationResponse(null);
        }
    };

    const validateForm = () => {
        const newErrors = validateCreditApplication(formData);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage({ type: "", text: "" });
        setApplicationResponse(null);

        // Prepare data for backend
        const requestData = {
            clientData: {
                ...formData.clientData,
                employmentDate: formData.clientData.employmentDate ? formData.clientData.employmentDate : null,
                maritalStatus: formData.clientData.maritalStatus
            },
            requestedMoney: parseFloat(formData.requestedMoney)
        };

        const result = await createApplication(requestData);

        if (result.success) {
            setSubmitMessage({
                type: "success",
                text: "Заявка успешно создана!"
            });
            setApplicationResponse(result.data);

            // Reset form
            setFormData({
                clientData: {
                    firstName: "",
                    lastName: "",
                    middleName: "",
                    passport: "",
                    maritalStatus: "",
                    address: "",
                    phone: "",
                    employmentDate: "",
                    employmentPosition: "",
                    organizationName: ""
                },
                requestedMoney: ""
            });
        } else {
            setSubmitMessage({
                type: "error",
                text: result.error || "Ошибка при создании заявки"
            });
        }

        setIsSubmitting(false);
    };

    const handleReset = () => {
        setFormData({
            clientData: {
                firstName: "",
                lastName: "",
                middleName: "",
                passport: "",
                maritalStatus: "",
                address: "",
                phone: "",
                employmentDate: "",
                employmentPosition: "",
                organizationName: ""
            },
            requestedMoney: ""
        });
        setErrors({});
        setSubmitMessage({ type: "", text: "" });
        setApplicationResponse(null);
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

    const renderApplicationResponse = () => {
        if (!applicationResponse) return null;

        const status = statusMap[applicationResponse.status] || { label: applicationResponse.status, class: "status-unknown", icon: "❓" };

        return (
            <div className="application-response">
                <h3>Результат создания заявки</h3>
                <div className="response-card">
                    <div className="response-header">
                        <div className="application-id">
                            <span className="id-label">ID заявки: </span>
                            <span className="id-value">{applicationResponse.applicationId}</span>
                        </div>
                        <div className={`status-badge ${status.class}`}>
                            <span className="status-text">{status.label}</span>
                        </div>
                    </div>

                    <div className="response-content">
                        {applicationResponse.status === "APPROVED" ? (
                            <>
                                <div className="info-section">
                                    <h4>Одобренные условия</h4>
                                    <div className="info-row">
                                        <span className="info-label">Одобренная сумма: </span>
                                        <span className="info-value highlight">{formatMoney(applicationResponse.approvedMoney)}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Срок кредита: </span>
                                        <span className="info-value highlight">{applicationResponse.approvedTerm} дней</span>
                                    </div>
                                </div>
                            </>
                        ) : applicationResponse.status === "REJECTED" ? (
                            <div className="info-section rejection-info">
                                <div className="rejection-message">
                                    <p>К сожалению, заявка была отклонена.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="info-section pending-info">
                                <div className="pending-message">
                                    <p>Заявка принята.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="create-application">
            <h2>Оформление кредитной заявки</h2>

            {submitMessage.text && (
                <div className={`submit-message ${submitMessage.type}`}>
                    {submitMessage.text}
                </div>
            )}

            {renderApplicationResponse()}

            <form onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Личная информация</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="lastName">Фамилия *</label>
                            <input
                                type="text"
                                id="lastName"
                                value={formData.clientData.lastName}
                                onChange={(e) => handleInputChange("clientData", "lastName", e.target.value)}
                                className={errors.lastName ? "error" : ""}
                                disabled={isSubmitting}
                            />
                            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="firstName">Имя *</label>
                            <input
                                type="text"
                                id="firstName"
                                value={formData.clientData.firstName}
                                onChange={(e) => handleInputChange("clientData", "firstName", e.target.value)}
                                className={errors.firstName ? "error" : ""}
                                disabled={isSubmitting}
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
                                value={formData.clientData.middleName}
                                onChange={(e) => handleInputChange("clientData", "middleName", e.target.value)}
                                className={errors.middleName ? "error" : ""}
                                disabled={isSubmitting}
                            />
                            {errors.middleName && <span className="error-message">{errors.middleName}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="passport">Паспорт (10 цифр) *</label>
                            <input
                                type="text"
                                id="passport"
                                value={formData.clientData.passport}
                                onChange={(e) => handleInputChange("clientData", "passport", e.target.value)}
                                placeholder="1234567890"
                                className={errors.passport ? "error" : ""}
                                disabled={isSubmitting}
                            />
                            {errors.passport && <span className="error-message">{errors.passport}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="maritalStatus">Семейное положение *</label>
                            <select
                                id="maritalStatus"
                                value={formData.clientData.maritalStatus}
                                onChange={(e) => handleInputChange("clientData", "maritalStatus", e.target.value)}
                                className={errors.maritalStatus ? "error" : ""}
                                disabled={isSubmitting}
                            >
                                <option value="">Выберите...</option>
                                {maritalStatusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.maritalStatus && <span className="error-message">{errors.maritalStatus}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Телефон (11 цифр) *</label>
                            <input
                                type="tel"
                                id="phone"
                                value={formData.clientData.phone}
                                onChange={(e) => handleInputChange("clientData", "phone", e.target.value)}
                                placeholder="+79123456789"
                                className={errors.phone ? "error" : ""}
                                disabled={isSubmitting}
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Адрес *</label>
                        <input
                            type="text"
                            id="address"
                            value={formData.clientData.address}
                            onChange={(e) => handleInputChange("clientData", "address", e.target.value)}
                            className={errors.address ? "error" : ""}
                            disabled={isSubmitting}
                        />
                        {errors.address && <span className="error-message">{errors.address}</span>}
                    </div>
                </div>

                {/* Employment Information Section */}
                <div className="form-section">
                    <h3>Информация о работе</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="organizationName">Название организации</label>
                            <input
                                type="text"
                                id="organizationName"
                                value={formData.clientData.organizationName}
                                onChange={(e) => handleInputChange("clientData", "organizationName", e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="employmentPosition">Должность</label>
                            <input
                                type="text"
                                id="employmentPosition"
                                value={formData.clientData.employmentPosition}
                                onChange={(e) => handleInputChange("clientData", "employmentPosition", e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="employmentDate">Дата трудоустройства</label>
                        <input
                            type="date"
                            id="employmentDate"
                            value={formData.clientData.employmentDate}
                            onChange={(e) => handleInputChange("clientData", "employmentDate", e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                {/* Credit Information Section */}
                <div className="form-section">
                    <h3>Кредитная информация</h3>

                    <div className="form-group">
                        <label htmlFor="requestedMoney">Запрашиваемая сумма (в рублях) *</label>
                        <input
                            type="number"
                            id="requestedMoney"
                            value={formData.requestedMoney}
                            onChange={(e) => handleInputChange("", "requestedMoney", e.target.value)}
                            step="0.01"
                            min="0.01"
                            placeholder="10000.00"
                            className={errors.requestedMoney ? "error" : ""}
                            disabled={isSubmitting}
                        />
                        {errors.requestedMoney && <span className="error-message">{errors.requestedMoney}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn primary-button" disabled={isSubmitting}>
                        {isSubmitting ? "Отправка..." : "Оформить заявку"}
                    </button>
                    <button type="button" className="btn secondary-button" onClick={handleReset} disabled={isSubmitting}>
                        Очистить форму
                    </button>
                </div>
            </form>
        </div>
    );
};