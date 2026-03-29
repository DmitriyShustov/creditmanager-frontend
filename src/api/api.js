import { parseErrorResponse, showErrorAlert } from '../utils/errorHandler';

const APPLICATION_URL = "http://localhost:8080/api/application";
const CLIENT_URL = "http://localhost:8080/api/client";
const AGREEMENT_URL = "http://localhost:8080/api/agreement";

export async function createApplication(requestData) {
    try {
        const response = await fetch(`${APPLICATION_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            throw new Error(errorData.message);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("API Error in createApplication:", error);
        const errorMessage = error.message || "Не удалось создать заявку. Пожалуйста, попробуйте позже.";
        showErrorAlert(error, "Не удалось создать заявку. Пожалуйста, попробуйте позже.");
        return {
            success: false,
            error: errorMessage
        };
    }
}

export async function signAgreement(applicationId) {
    try {
        const response = await fetch(`${APPLICATION_URL}/${applicationId}/sign`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await parseErrorResponse(response);
            throw new Error(errorData.message);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("API Error in signAgreement:", error);
        const errorMessage = error.message || "Не удалось подписать договор. Пожалуйста, проверьте номер заявки и попробуйте снова.";
        showErrorAlert(error, "Не удалось подписать договор. Пожалуйста, проверьте номер заявки и попробуйте снова.");
        return {
            success: false,
            error: errorMessage
        };
    }
}
