export const handleApiError = (error, defaultMessage) => {
    console.error("API Error:", error);

    if (typeof error === 'string') {
        return error;
    }

    if (error.info && Array.isArray(error.info)) {
        const messages = error.info.map(item => item.message).join('\n');
        if (messages) {
            return messages;
        }
    }

    if (error.info && Array.isArray(error.info.messages)) {
        return error.info.messages.join('\n');
    }

    if (error.info && error.info.message) {
        return error.info.message;
    }

    if (error.detail) {
        return error.detail;
    }

    if (error.message) {
        return error.message;
    }

    return defaultMessage;
};

export const showErrorAlert = (error, defaultMessage) => {
    const errorMessage = handleApiError(error, defaultMessage);
    alert(errorMessage);
};

export const parseErrorResponse = async (response) => {
    try {
        const errorData = await response.json();

        if (errorData.info && Array.isArray(errorData.info)) {
            const messages = errorData.info.map(item => item.message).join('\n');
            return {
                message: messages || errorData.detail || errorData.title || `HTTP error! status: ${response.status}`,
                details: errorData.info.map(item => item.message)
            };
        }

        if (errorData.info && Array.isArray(errorData.info.messages)) {
            return {
                message: errorData.info.messages.join('\n'),
                details: errorData.info.messages
            };
        }

        if (errorData.info && errorData.info.message) {
            return {
                message: errorData.info.message,
                details: [errorData.info.message]
            };
        }

        if (errorData.detail) {
            return {
                message: errorData.detail,
                details: [errorData.detail]
            };
        }

        if (errorData.message) {
            return {
                message: errorData.message,
                details: [errorData.message]
            };
        }

        return {
            message: `HTTP error! status: ${response.status}`,
            details: [`HTTP error! status: ${response.status}`]
        };
    } catch (e) {
        return {
            message: `HTTP error! status: ${response.status}`,
            details: [`HTTP error! status: ${response.status}`]
        };
    }
};