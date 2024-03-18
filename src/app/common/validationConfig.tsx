export const emailValidationConfig = {
    regex: /^[a-zA-Z0-9._%+-]+@radiant.digital$/,
    message: "Email should end with radiant.digital",
};

export const phoneValidationConfig = {
    regex: /^\d{10}$/,
    message: "Phone number should be 10 digits",
};

export const validateEmail = (email) => {
    return emailValidationConfig.regex.test(email);
};

export const validatePhone = (phone) => {
    return phoneValidationConfig.regex.test(phone);
};