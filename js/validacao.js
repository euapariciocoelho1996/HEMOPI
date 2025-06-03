// Sistema de Validação de Formulários
class FormValidator {
    constructor(formElement) {
        this.form = formElement;
        this.errors = new Map();
        this.setupValidation();
    }

    setupValidation() {
        this.form.noValidate = true; // Desativa validação HTML5 nativa
        this.form.addEventListener('submit', (e) => this.validateOnSubmit(e));
        
        // Validação em tempo real
        this.form.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.validateField(input));
        });
    }

    validateOnSubmit(e) {
        e.preventDefault();
        this.errors.clear();

        // Validar todos os campos
        const fields = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (isValid) {
            // Remover mensagens de erro
            this.clearErrors();
            // Enviar formulário
            this.submitForm();
        } else {
            // Mostrar primeiro erro
            const firstError = this.form.querySelector('.error-message');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Validações específicas por tipo de campo
        switch(field.type) {
            case 'email':
                isValid = this.validateEmail(value);
                errorMessage = 'Email inválido';
                break;
            case 'tel':
                isValid = this.validatePhone(value);
                errorMessage = 'Telefone inválido';
                break;
            case 'date':
                isValid = this.validateDate(value);
                errorMessage = 'Data inválida';
                break;
            case 'number':
                isValid = this.validateNumber(value);
                errorMessage = 'Número inválido';
                break;
            default:
                if (field.required && !value) {
                    isValid = false;
                    errorMessage = 'Campo obrigatório';
                }
        }

        // Validações customizadas por atributos data-*
        if (field.dataset.minLength && value.length < parseInt(field.dataset.minLength)) {
            isValid = false;
            errorMessage = `Mínimo de ${field.dataset.minLength} caracteres`;
        }

        if (field.dataset.maxLength && value.length > parseInt(field.dataset.maxLength)) {
            isValid = false;
            errorMessage = `Máximo de ${field.dataset.maxLength} caracteres`;
        }

        if (field.dataset.pattern) {
            const pattern = new RegExp(field.dataset.pattern);
            if (!pattern.test(value)) {
                isValid = false;
                errorMessage = field.dataset.patternMessage || 'Formato inválido';
            }
        }

        // Atualizar UI
        this.updateFieldStatus(field, isValid, errorMessage);
        return isValid;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^\(\d{2}\) \d{5}-\d{4}$/;
        return re.test(phone);
    }

    validateDate(date) {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    }

    validateNumber(num) {
        return !isNaN(parseFloat(num)) && isFinite(num);
    }

    updateFieldStatus(field, isValid, errorMessage) {
        // Remover mensagens de erro anteriores
        const container = field.parentElement;
        const existingError = container.querySelector('.error-message');
        if (existingError) {
            container.removeChild(existingError);
        }

        // Atualizar classes CSS
        field.classList.toggle('is-invalid', !isValid);
        field.classList.toggle('is-valid', isValid);

        if (!isValid) {
            // Adicionar nova mensagem de erro
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = errorMessage;
            container.appendChild(errorElement);

            // Armazenar erro
            this.errors.set(field.name, errorMessage);
        } else {
            this.errors.delete(field.name);
        }
    }

    clearErrors() {
        this.form.querySelectorAll('.error-message').forEach(error => error.remove());
        this.form.querySelectorAll('.is-invalid').forEach(field => {
            field.classList.remove('is-invalid');
        });
        this.errors.clear();
    }

    async submitForm() {
        try {
            const formData = new FormData(this.form);
            const response = await fetch(this.form.action, {
                method: this.form.method,
                body: formData
            });

            if (!response.ok) throw new Error('Erro ao enviar formulário');

            // Limpar formulário e mostrar mensagem de sucesso
            this.form.reset();
            notifications.success('Formulário enviado com sucesso!');
        } catch (error) {
            notifications.error('Erro ao enviar formulário. Tente novamente.');
            console.error('Erro no envio:', error);
        }
    }
}

// Exportar para uso em outros módulos
export default FormValidator;

// Exemplo de uso:
/*
const form = document.querySelector('#meuFormulario');
const validator = new FormValidator(form);
*/ 