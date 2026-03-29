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

export async function findClients(filters, page = 1) {
    try {
        const params = new URLSearchParams();
        params.append('page', page);

        if (filters.phone) params.append('phone', filters.phone);
        if (filters.passport) params.append('passport', filters.passport);
        if (filters.firstName) params.append('firstName', filters.firstName);
        if (filters.lastName) params.append('lastName', filters.lastName);
        if (filters.middleName) params.append('middleName', filters.middleName);

        const response = await fetch(`${CLIENT_URL}/find?${params.toString()}`, {
            method: "GET",
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
        console.error("API Error in findClients:", error);
        const errorMessage = error.message || "Не удалось найти клиентов. Пожалуйста, попробуйте позже.";
        showErrorAlert(error, "Не удалось найти клиентов. Пожалуйста, попробуйте позже.");
        return {
            success: false,
            error: errorMessage
        };
    }
}

export async function findApplications(page = 1) {
    try {
        const params = new URLSearchParams();
        params.append('page', page);

        const response = await fetch(`${APPLICATION_URL}/find?${params.toString()}`, {
            method: "GET",
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
        console.error("API Error in findApplications:", error);
        const errorMessage = error.message || "Не удалось найти заявки. Пожалуйста, попробуйте позже.";
        showErrorAlert(error, "Не удалось найти заявки. Пожалуйста, попробуйте позже.");
        return {
            success: false,
            error: errorMessage
        };
    }
}

export async function findSignedAgreements(page = 1) {
    try {
        const params = new URLSearchParams();
        params.append('page', page);

        const response = await fetch(`${AGREEMENT_URL}/find/signed?${params.toString()}`, {
            method: "GET",
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
        console.error("API Error in findSignedAgreements:", error);
        const errorMessage = error.message || "Не удалось найти подписанные договоры. Пожалуйста, попробуйте позже.";
        showErrorAlert(error, "Не удалось найти подписанные договоры. Пожалуйста, попробуйте позже.");
        return {
            success: false,
            error: errorMessage
        };
    }
}
