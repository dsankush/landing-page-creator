/**
 * ================================================
 * LANDCRAFT - Validation Utilities
 * Form field validation functions
 * ================================================
 */

const Validation = {
    /**
     * Validation rules and patterns
     */
    patterns: {
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        mobile: /^[0-9]{10}$/,
        phone: /^[0-9]{10,15}$/,
        url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        alphanumeric: /^[a-zA-Z0-9]+$/,
        alpha: /^[a-zA-Z]+$/,
        numeric: /^[0-9]+$/,
        date: /^\d{4}-\d{2}-\d{2}$/,
        time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        pincode: /^[1-9][0-9]{5}$/
    },

    /**
     * Error messages
     */
    messages: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        mobile: 'Please enter a valid 10-digit mobile number',
        phone: 'Please enter a valid phone number',
        url: 'Please enter a valid URL',
        minLength: 'Minimum {min} characters required',
        maxLength: 'Maximum {max} characters allowed',
        min: 'Value must be at least {min}',
        max: 'Value must not exceed {max}',
        pattern: 'Please enter a valid format',
        alphanumeric: 'Only letters and numbers are allowed',
        alpha: 'Only letters are allowed',
        numeric: 'Only numbers are allowed',
        date: 'Please enter a valid date',
        file: 'Please upload a valid file',
        fileSize: 'File size must not exceed {max}',
        fileType: 'Invalid file type. Allowed: {types}',
        gst: 'Please enter a valid GST number',
        pan: 'Please enter a valid PAN number',
        pincode: 'Please enter a valid 6-digit PIN code',
        match: 'Values do not match'
    },

    /**
     * Validate a single field
     * @param {*} value - Field value
     * @param {Object} rules - Validation rules
     * @param {Object} allValues - All form values (for conditional validation)
     * @returns {Object} {valid: boolean, error: string|null}
     */
    validateField(value, rules, allValues = {}) {
        // Check if field is conditionally hidden
        if (rules.conditionalLogic && rules.conditionalLogic.enabled) {
            const isVisible = this.evaluateCondition(rules.conditionalLogic, allValues);
            if (!isVisible) {
                return { valid: true, error: null }; // Skip validation for hidden fields
            }
        }

        // Required validation
        if (rules.required) {
            if (this.isEmpty(value)) {
                return { valid: false, error: rules.errorMessage || this.messages.required };
            }
        }

        // If not required and empty, skip other validations
        if (this.isEmpty(value)) {
            return { valid: true, error: null };
        }

        // Email validation
        if (rules.type === 'email' || rules.email) {
            if (!this.patterns.email.test(value)) {
                return { valid: false, error: this.messages.email };
            }
        }

        // Mobile validation (10 digits only)
        if (rules.type === 'mobile' || rules.mobile) {
            const cleanValue = value.replace(/\D/g, '');
            if (!this.patterns.mobile.test(cleanValue)) {
                return { valid: false, error: this.messages.mobile };
            }
        }

        // URL validation
        if (rules.type === 'url' || rules.url) {
            if (!this.patterns.url.test(value)) {
                return { valid: false, error: this.messages.url };
            }
        }

        // Min length validation
        if (rules.minLength !== undefined && rules.minLength !== null && rules.minLength !== '') {
            if (String(value).length < parseInt(rules.minLength)) {
                return { 
                    valid: false, 
                    error: this.messages.minLength.replace('{min}', rules.minLength) 
                };
            }
        }

        // Max length validation
        if (rules.maxLength !== undefined && rules.maxLength !== null && rules.maxLength !== '') {
            if (String(value).length > parseInt(rules.maxLength)) {
                return { 
                    valid: false, 
                    error: this.messages.maxLength.replace('{max}', rules.maxLength) 
                };
            }
        }

        // Min value validation (for numbers)
        if (rules.min !== undefined && rules.min !== null && rules.min !== '') {
            if (parseFloat(value) < parseFloat(rules.min)) {
                return { 
                    valid: false, 
                    error: this.messages.min.replace('{min}', rules.min) 
                };
            }
        }

        // Max value validation (for numbers)
        if (rules.max !== undefined && rules.max !== null && rules.max !== '') {
            if (parseFloat(value) > parseFloat(rules.max)) {
                return { 
                    valid: false, 
                    error: this.messages.max.replace('{max}', rules.max) 
                };
            }
        }

        // Custom pattern validation
        if (rules.pattern) {
            try {
                const regex = new RegExp(rules.pattern);
                if (!regex.test(value)) {
                    return { valid: false, error: rules.errorMessage || this.messages.pattern };
                }
            } catch (e) {
                console.warn('Invalid regex pattern:', rules.pattern);
            }
        }

        // GST validation
        if (rules.gst) {
            if (!this.patterns.gst.test(value.toUpperCase())) {
                return { valid: false, error: this.messages.gst };
            }
        }

        // PAN validation
        if (rules.pan) {
            if (!this.patterns.pan.test(value.toUpperCase())) {
                return { valid: false, error: this.messages.pan };
            }
        }

        // Pincode validation
        if (rules.pincode) {
            if (!this.patterns.pincode.test(value)) {
                return { valid: false, error: this.messages.pincode };
            }
        }

        // Alphanumeric validation
        if (rules.alphanumeric) {
            if (!this.patterns.alphanumeric.test(value)) {
                return { valid: false, error: this.messages.alphanumeric };
            }
        }

        // Alpha validation
        if (rules.alpha) {
            if (!this.patterns.alpha.test(value)) {
                return { valid: false, error: this.messages.alpha };
            }
        }

        // Numeric validation
        if (rules.numeric) {
            if (!this.patterns.numeric.test(value)) {
                return { valid: false, error: this.messages.numeric };
            }
        }

        return { valid: true, error: null };
    },

    /**
     * Validate file input
     * @param {File|FileList} files - File(s) to validate
     * @param {Object} rules - Validation rules
     * @returns {Object} {valid: boolean, error: string|null}
     */
    validateFile(files, rules = {}) {
        if (!files || (files instanceof FileList && files.length === 0)) {
            if (rules.required) {
                return { valid: false, error: this.messages.required };
            }
            return { valid: true, error: null };
        }

        const fileList = files instanceof FileList ? Array.from(files) : [files];

        for (const file of fileList) {
            // File size validation
            if (rules.maxSize) {
                const maxBytes = this.parseFileSize(rules.maxSize);
                if (file.size > maxBytes) {
                    return { 
                        valid: false, 
                        error: this.messages.fileSize.replace('{max}', rules.maxSize) 
                    };
                }
            }

            // File type validation
            if (rules.accept) {
                const allowedTypes = rules.accept.split(',').map(t => t.trim().toLowerCase());
                const fileType = file.type.toLowerCase();
                const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
                
                const isValid = allowedTypes.some(type => {
                    if (type.startsWith('.')) {
                        return fileExtension === type;
                    }
                    if (type.endsWith('/*')) {
                        return fileType.startsWith(type.replace('/*', '/'));
                    }
                    return fileType === type;
                });

                if (!isValid) {
                    return { 
                        valid: false, 
                        error: this.messages.fileType.replace('{types}', rules.accept) 
                    };
                }
            }
        }

        return { valid: true, error: null };
    },

    /**
     * Validate entire form
     * @param {Object} values - Form values
     * @param {Array} fields - Field configurations
     * @returns {Object} {valid: boolean, errors: Object}
     */
    validateForm(values, fields) {
        const errors = {};
        let valid = true;

        for (const field of fields) {
            const value = values[field.id];
            const result = this.validateField(value, {
                type: field.type,
                required: field.required,
                minLength: field.validation?.minLength,
                maxLength: field.validation?.maxLength,
                min: field.validation?.min,
                max: field.validation?.max,
                pattern: field.validation?.pattern,
                errorMessage: field.validation?.errorMessage,
                conditionalLogic: field.conditionalLogic,
                ...field.validation
            }, values);

            if (!result.valid) {
                errors[field.id] = result.error;
                valid = false;
            }
        }

        return { valid, errors };
    },

    /**
     * Validate a step in multi-step form
     * @param {Object} values - Form values
     * @param {Array} stepFields - Fields in current step
     * @returns {Object} {valid: boolean, errors: Object}
     */
    validateStep(values, stepFields) {
        return this.validateForm(values, stepFields);
    },

    /**
     * Evaluate conditional logic
     * @param {Object} condition - Conditional logic configuration
     * @param {Object} values - All form values
     * @returns {boolean} Whether condition is met
     */
    evaluateCondition(condition, values) {
        if (!condition || !condition.enabled) return true;

        const { field, operator, value } = condition;
        if (!field) return true;

        const fieldValue = values[field];

        switch (operator) {
            case 'equals':
                return fieldValue === value;
            case 'not_equals':
                return fieldValue !== value;
            case 'contains':
                return String(fieldValue || '').includes(value);
            case 'not_contains':
                return !String(fieldValue || '').includes(value);
            case 'not_empty':
                return !this.isEmpty(fieldValue);
            case 'empty':
                return this.isEmpty(fieldValue);
            case 'greater_than':
                return parseFloat(fieldValue) > parseFloat(value);
            case 'less_than':
                return parseFloat(fieldValue) < parseFloat(value);
            case 'starts_with':
                return String(fieldValue || '').startsWith(value);
            case 'ends_with':
                return String(fieldValue || '').endsWith(value);
            default:
                return true;
        }
    },

    /**
     * Check if value is empty
     * @param {*} value - Value to check
     * @returns {boolean} True if empty
     */
    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },

    /**
     * Parse file size string to bytes
     * @param {string} size - Size string (e.g., "5MB", "500KB")
     * @returns {number} Size in bytes
     */
    parseFileSize(size) {
        if (typeof size === 'number') return size;
        
        const units = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024
        };

        const match = String(size).match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/i);
        if (!match) return 0;

        const value = parseFloat(match[1]);
        const unit = (match[2] || 'B').toUpperCase();

        return value * (units[unit] || 1);
    },

    /**
     * Format validation error for display
     * @param {Object} errors - Errors object
     * @returns {Array} Array of error messages
     */
    formatErrors(errors) {
        return Object.entries(errors)
            .filter(([, error]) => error)
            .map(([field, error]) => ({
                field,
                message: error
            }));
    },

    /**
     * Get field-specific validation rules based on type
     * @param {string} fieldType - Field type
     * @returns {Object} Default validation rules
     */
    getDefaultRules(fieldType) {
        const rules = {
            text: {},
            email: { email: true },
            mobile: { mobile: true, maxLength: 10 },
            number: { numeric: true },
            url: { url: true },
            textarea: {},
            dropdown: {},
            radio: {},
            checkbox: {},
            date: { date: true },
            file: {}
        };

        return rules[fieldType] || {};
    },

    /**
     * Sanitize input value based on field type
     * @param {*} value - Input value
     * @param {string} type - Field type
     * @returns {*} Sanitized value
     */
    sanitizeValue(value, type) {
        if (value === null || value === undefined) return '';

        switch (type) {
            case 'mobile':
                return String(value).replace(/\D/g, '').slice(0, 10);
            case 'number':
                return String(value).replace(/[^\d.-]/g, '');
            case 'email':
                return String(value).toLowerCase().trim();
            case 'text':
            case 'textarea':
                return String(value);
            default:
                return value;
        }
    }
};

// Export for use in other modules
window.Validation = Validation;
