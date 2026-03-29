import { useState } from "react";
import { signAgreement } from "../../api/api";
import "./SignAgreement.css";

export const SignAgreement = () => {
    const [applicationId, setApplicationId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
    const [agreementData, setAgreementData] = useState(null);

    const handleInputChange = (e) => {
        const value = e.target.value;
        // Allow only numbers
        if (value === "" || /^\d+$/.test(value)) {
            setApplicationId(value);
            // Clear messages when user starts typing
            if (submitMessage.text) {
                setSubmitMessage({ type: "", text: "" });
                setAgreementData(null);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!applicationId) {
            setSubmitMessage({
                type: "error",
                text: "Пожалуйста, введите номер кредитной заявки"
            });
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage({ type: "", text: "" });
        setAgreementData(null);

        const result = await signAgreement(applicationId);

        if (result.success) {
            setSubmitMessage({
                type: "success",
                text: "Договор успешно подписан!"
            });
            setAgreementData(result.data);
            setApplicationId("");
        } else {
            setSubmitMessage({
                type: "error",
                text: result.error
            });
        }

        setIsSubmitting(false);
    };

    const handleReset = () => {
        setApplicationId("");
        setSubmitMessage({ type: "", text: "" });
        setAgreementData(null);
    };

    const getStatusText = (status) => {
        switch (status) {
            case "SIGNED":
                return "Подписан";
            case "PENDING":
                return "В ожидании";
            case "NOT_SIGNED":
                return "Не подписан";
            default:
                return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "SIGNED":
                return "status-signed";
            case "PENDING":
                return "status-pending";
            case "NOT_SIGNED":
                return "status-not-signed";
            default:
                return "";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <div className="sign-agreement">
            <h2>Подписание кредитного договора</h2>

            <form onSubmit={handleSubmit} className="sign-form">
                <div className="form-group">
                    <label htmlFor="applicationId">
                        Номер кредитной заявки
                        <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="applicationId"
                        value={applicationId}
                        onChange={handleInputChange}
                        placeholder="Введите номер заявки"
                        disabled={isSubmitting}
                        autoComplete="off"
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn primary-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Подписание..." : "Подписать договор"}
                    </button>
                    <button
                        type="button"
                        className="btn secondary-button"
                        onClick={handleReset}
                        disabled={isSubmitting}
                    >
                        Очистить
                    </button>
                </div>
            </form>

            {submitMessage.text && (
                <div className={`submit-message ${submitMessage.type}`}>
                    {submitMessage.text}
                </div>
            )}

            {agreementData && (
                <div className="agreement-details">
                    <h3>Детали подписанного договора</h3>
                    <div className="details-card">
                        <div className="detail-row">
                            <span className="detail-label">ID договора: </span>
                            <span className="detail-value">{agreementData.id}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">ID заявки: </span>
                            <span className="detail-value">{agreementData.applicationId}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Дата подписания: </span>
                            <span className="detail-value">{formatDate(agreementData.signDate)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Статус: </span>
                            <span className={`detail-value status-badge ${getStatusClass(agreementData.signStatus)}`}>
                                {getStatusText(agreementData.signStatus)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};