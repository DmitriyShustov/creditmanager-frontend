const VALIDATION_PATTERNS = {
    NAME: /^[A-Za-z][a-z]*(?:[\s'-][A-Za-z][a-z]*)*$/,
    PASSPORT: /^\d{10}$/,
    PHONE: /^\+?\d{11}$/,
    MONEY: /^\d+(\.\d{1,2})?$/
};

const VALIDATION_LIMITS = {
    NAME_MAX_LENGTH: 64,
    ADDRESS_MAX_LENGTH: 255,
    MAX_MONEY_AMOUNT: 99999999999.99
};

export const validateRequired = (value, fieldName) => {
    if (!value) {
        return `${fieldName} обязательно`;
    }
    return null;
};

export const validateName = (value, fieldName, required = true) => {
    if (required && !value) {
        return `${fieldName} обязательно`;
    }

    if (value && !VALIDATION_PATTERNS.NAME.test(value)) {
        return `Неверный формат ${fieldName.toLowerCase()} (только буквы, дефис и апостроф)`;
    }

    if (value && value.length > VALIDATION_LIMITS.NAME_MAX_LENGTH) {
        return `${fieldName} не должно превышать ${VALIDATION_LIMITS.NAME_MAX_LENGTH} символов`;
    }

    return null;
};

export const validatePassport = (value) => {
    if (!value) {
        return "Паспорт обязателен";
    }

    if (!VALIDATION_PATTERNS.PASSPORT.test(value)) {
        return "Неверный формат паспорта (10 цифр)";
    }

    return null;
};

export const validatePhone = (value) => {
    if (!value) {
        return "Телефон обязателен";
    }

    if (!VALIDATION_PATTERNS.PHONE.test(value)) {
        return "Неверный формат телефона (11 цифр, может начинаться с +)";
    }

    return null;
};

export const validateAddress = (value) => {
    if (!value) {
        return "Адрес обязателен";
    }

    if (value.length > VALIDATION_LIMITS.ADDRESS_MAX_LENGTH) {
        return `Адрес не должен превышать ${VALIDATION_LIMITS.ADDRESS_MAX_LENGTH} символов`;
    }

    return null;
};

export const validateMoney = (value) => {
    if (!value) {
        return "Сумма кредита обязательна";
    }

    const amount = parseFloat(value);

    if (isNaN(amount) || amount <= 0) {
        return "Сумма должна быть больше 0";
    }

    if (amount > VALIDATION_LIMITS.MAX_MONEY_AMOUNT) {
        return `Сумма превышает максимальный лимит (${VALIDATION_LIMITS.MAX_MONEY_AMOUNT})`;
    }

    if (!VALIDATION_PATTERNS.MONEY.test(value)) {
        return "Неверный формат суммы (до 2 знаков после запятой)";
    }

    return null;
};

export const validateMaritalStatus = (value) => {
    if (!value) {
        return "Семейное положение обязательно";
    }
    return null;
};

export const validateCreditApplication = (formData) => {
    const errors = {};

    // Валидация клиентских данных
    const firstNameError = validateName(formData.clientData.firstName, "Имя");
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateName(formData.clientData.lastName, "Фамилия");
    if (lastNameError) errors.lastName = lastNameError;

    const middleNameError = validateName(formData.clientData.middleName, "Отчество", false);
    if (middleNameError) errors.middleName = middleNameError;

    const passportError = validatePassport(formData.clientData.passport);
    if (passportError) errors.passport = passportError;

    const maritalStatusError = validateMaritalStatus(formData.clientData.maritalStatus);
    if (maritalStatusError) errors.maritalStatus = maritalStatusError;

    const addressError = validateAddress(formData.clientData.address);
    if (addressError) errors.address = addressError;

    const phoneError = validatePhone(formData.clientData.phone);
    if (phoneError) errors.phone = phoneError;

    // Валидация суммы кредита
    const moneyError = validateMoney(formData.requestedMoney);
    if (moneyError) errors.requestedMoney = moneyError;

    return errors;
};

export default {
    validateRequired,
    validateName,
    validatePassport,
    validatePhone,
    validateAddress,
    validateMoney,
    validateMaritalStatus,
    validateCreditApplication
};