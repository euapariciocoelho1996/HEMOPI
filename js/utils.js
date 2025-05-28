/**
 * Utility functions for the HEMOPI blood donation system
 * Centralizes common functionality to avoid code duplication
 */

/**
 * Shows a notification using SweetAlert2 or fallback to alert
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, warning, info)
 */
export function showNotification(title, message, type = "info") {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: title,
      text: message,
      icon: type,
      confirmButtonColor: "#ce483c",
    });
  } else {
    alert(`${title}: ${message}`);
  }
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formats a date to Brazilian format (DD/MM/YYYY)
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDateToBR(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Calculates next donation date based on gender
 * @param {string} gender - User gender (Masculino/Feminino)
 * @param {Date} lastDonation - Last donation date
 * @returns {Date} - Next possible donation date
 */
export function calculateNextDonation(gender, lastDonation = new Date()) {
  const nextDonation = new Date(lastDonation);
  const monthsToAdd = gender === "Masculino" ? 2 : 3;
  nextDonation.setMonth(nextDonation.getMonth() + monthsToAdd);
  return nextDonation;
}

/**
 * Shows a confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} text - Dialog text
 * @param {string} confirmText - Confirm button text
 * @returns {Promise<boolean>} - True if confirmed
 */
export async function showConfirmDialog(title, text, confirmText = "Confirmar") {
  if (typeof Swal !== "undefined") {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ce483c',
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
  } else {
    return confirm(`${title}\n${text}`);
  }
}

/**
 * Validates CNPJ format (14 digits)
 * @param {string} cnpj - CNPJ to validate
 * @returns {boolean} - True if CNPJ format is valid
 */
export function validateCNPJ(cnpj) {
  return /^\d{14}$/.test(cnpj);
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and message
 */
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: "A senha deve ter pelo menos 6 caracteres."
    };
  }
  return {
    isValid: true,
    message: "Senha válida."
  };
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Formats phone number to Brazilian format
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

/**
 * Gets current timestamp in ISO format
 * @returns {string} - Current timestamp
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
} 