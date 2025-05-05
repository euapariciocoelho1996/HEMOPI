/**
 * Common Utility Functions
 * Provides shared functionality across the application
 */

/**
 * Displays a notification to the user using SweetAlert if available
 * Falls back to regular alert if SweetAlert is not loaded
 * 
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {string} type - The notification type (info, success, error, warning)
 */
export function showNotification(title, message, type = 'info') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: title,
            text: message,
            icon: type,
            confirmButtonColor: '#ce483c'
        });
    } else {
        alert(`${title}: ${message}`);
    }
}

/**
 * Validates if a string is a valid email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Formats a date to a readable string format
 * 
 * @param {Date|string} date - Date to format (Date object or ISO string)
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
export function formatDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
        return 'Data inválida';
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
}

/**
 * Calculates next donation date based on gender
 * 
 * @param {Date} lastDonation - Date of the last donation
 * @param {string} gender - User's gender ('Masculino' or 'Feminino')
 * @returns {Date} Date when user can donate again
 */
export function calculateNextDonation(lastDonation, gender) {
    const nextDonation = new Date(lastDonation);
    
    // Males can donate every 2 months, females every 3 months
    const monthsToAdd = gender === 'Masculino' ? 2 : 3;
    nextDonation.setMonth(nextDonation.getMonth() + monthsToAdd);
    
    return nextDonation;
} 