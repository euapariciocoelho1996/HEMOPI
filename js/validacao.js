// Sistema de Validação de Formulários
class FormValidator {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.options = {
            validateOnInput: true,
            showSuccessState: true,
            ...options
        };
        
        this.init();
    }

    init() {
        if (!this.form) {
            console.error('Formulário não encontrado!');
            return;
        }

        this.setupValidation();
    }

    setupValidation() {
        this.form.noValidate = true;
        
        if (this.options.validateOnInput) {
            this.form.querySelectorAll('input, select, textarea').forEach(input => {
                input.addEventListener('input', () => this.validateField(input));
                input.addEventListener('blur', () => this.validateField(input));
            });
        }

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validateField(field) {
        const rules = this.getValidationRules(field);
        let isValid = true;
        let errorMessage = '';

        // Limpar estados anteriores
        this.clearFieldState(field);

        // Validar regras
        for (const rule of rules) {
            const validation = this.validateRule(field, rule);
            if (!validation.isValid) {
                isValid = false;
                errorMessage = validation.message;
                break;
            }
        }

        // Atualizar estado do campo
        this.updateFieldState(field, isValid, errorMessage);
        
        return isValid;
    }

    validateRule(field, rule) {
        const value = field.value.trim();
        
        switch (rule) {
            case 'required':
                return {
                    isValid: value !== '',
                    message: 'Este campo é obrigatório'
                };
            
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    isValid: emailRegex.test(value),
                    message: 'Email inválido'
                };
            
            case 'cpf':
                return {
                    isValid: this.validateCPF(value),
                    message: 'CPF inválido'
                };
            
            case 'phone':
                const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
                return {
                    isValid: phoneRegex.test(value),
                    message: 'Telefone inválido'
                };
            
            case 'date':
                return {
                    isValid: this.validateDate(value),
                    message: 'Data inválida'
                };
            
            default:
                return { isValid: true, message: '' };
        }
    }

    validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11) return false;
        
        // Verificar dígitos repetidos
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        // Validar dígitos verificadores
        let sum = 0;
        let remainder;
        
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    }

    validateDate(date) {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(date)) return false;
        
        const [day, month, year] = date.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        
        return dateObj.getDate() === day &&
               dateObj.getMonth() === month - 1 &&
               dateObj.getFullYear() === year;
    }

    getValidationRules(field) {
        const rules = [];
        
        if (field.required) rules.push('required');
        if (field.type === 'email') rules.push('email');
        if (field.dataset.validate === 'cpf') rules.push('cpf');
        if (field.dataset.validate === 'phone') rules.push('phone');
        if (field.dataset.validate === 'date') rules.push('date');
        
        return rules;
    }

    clearFieldState(field) {
        field.classList.remove('is-valid', 'is-invalid');
        
        const container = field.parentElement;
        const existingError = container.querySelector('.invalid-feedback');
        const existingSuccess = container.querySelector('.valid-feedback');
        
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();
    }

    updateFieldState(field, isValid, errorMessage) {
        const container = field.parentElement;
        
        if (isValid) {
            field.classList.add('is-valid');
            if (this.options.showSuccessState) {
                const successDiv = document.createElement('div');
                successDiv.className = 'valid-feedback';
                successDiv.textContent = 'Campo válido';
                container.appendChild(successDiv);
            }
        } else {
            field.classList.add('is-invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = errorMessage;
            container.appendChild(errorDiv);
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        let isFormValid = true;
        const fields = this.form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });
        
        if (isFormValid) {
            if (typeof this.options.onSuccess === 'function') {
                this.options.onSuccess(this.form);
            }
        } else {
            if (typeof this.options.onError === 'function') {
                this.options.onError(this.form);
            }
            
            // Focar no primeiro campo com erro
            const firstInvalidField = this.form.querySelector('.is-invalid');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        }
    }
}

// Adicionar estilos de validação
const style = document.createElement('style');
style.textContent = `
    .is-valid {
        border-color: #28a745 !important;
        padding-right: calc(1.5em + 0.75rem) !important;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e") !important;
        background-repeat: no-repeat !important;
        background-position: right calc(0.375em + 0.1875rem) center !important;
        background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem) !important;
    }

    .is-invalid {
        border-color: #dc3545 !important;
        padding-right: calc(1.5em + 0.75rem) !important;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='%23dc3545' viewBox='-2 -2 7 7'%3e%3cpath stroke='%23dc3545' d='M0 0l3 3m0-3L0 3'/%3e%3ccircle r='.5'/%3e%3ccircle cx='3' r='.5'/%3e%3ccircle cy='3' r='.5'/%3e%3ccircle cx='3' cy='3' r='.5'/%3e%3c/svg%3E") !important;
        background-repeat: no-repeat !important;
        background-position: right calc(0.375em + 0.1875rem) center !important;
        background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem) !important;
    }

    .invalid-feedback {
        display: block;
        width: 100%;
        margin-top: 0.25rem;
        font-size: 80%;
        color: #dc3545;
    }

    .valid-feedback {
        display: block;
        width: 100%;
        margin-top: 0.25rem;
        font-size: 80%;
        color: #28a745;
    }
`;

document.head.appendChild(style); 