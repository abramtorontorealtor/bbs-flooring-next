export const validatePhone = (phone) => {
  // Accept formats: XXXXXXXXXX, XXX-XXX-XXXX, (XXX) XXX-XXXX
  const phoneRegex = /^(\d{10}|\d{3}-\d{3}-\d{4}|\(\d{3}\) \d{3}-\d{4})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
