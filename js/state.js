/**
 * ================================================
 * LANDCRAFT - State Management
 * Centralized application state with undo/redo
 * ================================================
 */

const AppState = {
    /**
     * Current application state
     */
    state: {
        projectName: 'Untitled Project',
        currentStep: 0,
        selectedElement: null,
        currentView: 'builder', // 'builder', 'preview', 'code'
        
        // Header configuration
        header: {
            image: {
                url: null,
                height: 300
            },
            title: {
                text: 'Welcome to Our Page',
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 32,
                color: '#1e293b',
                bold: false,
                italic: false,
                underline: false,
                align: 'center'
            },
            description: {
                html: '<p>Fill out the form below to get started.</p>',
                text: 'Fill out the form below to get started.',
                fontSize: 16,
                color: '#64748b'
            }
        },

        // Steps array
        steps: [
            {
                id: 'step_0',
                name: 'Welcome',
                fields: []
            }
        ],

        // Global settings
        settings: {
            webhookUrl: '',
            submitButtonText: 'Submit',
            successMessage: 'Thank you! Your response has been recorded.',
            showProgressBar: true,
            theme: 'light'
        }
    },

    /**
     * History for undo/redo
     */
    history: [],
    historyIndex: -1,
    maxHistorySize: 50,

    /**
     * State change listeners
     */
    listeners: new Set(),

    /**
     * Initialize state from localStorage or defaults
     */
    init() {
        const saved = Helpers.storage.get('landcraft_state');
        if (saved) {
            this.state = { ...this.state, ...saved };
        }
        this.saveToHistory();
        this.notifyListeners();
    },

    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
        return this.state;
    },

    /**
     * Update state with partial updates
     * @param {Object} updates - Partial state updates
     * @param {boolean} saveHistory - Whether to save to history (default: true)
     */
    setState(updates, saveHistory = true) {
        this.state = Helpers.deepClone({ ...this.state, ...updates });
        
        if (saveHistory) {
            this.saveToHistory();
        }
        
        this.notifyListeners();
        this.persistState();
    },

    /**
     * Update nested state path
     * @param {string} path - Dot-separated path (e.g., 'header.title.text')
     * @param {*} value - New value
     */
    setPath(path, value) {
        const keys = path.split('.');
        const newState = Helpers.deepClone(this.state);
        let current = newState;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        this.setState(newState);
    },

    /**
     * Get value at nested path
     * @param {string} path - Dot-separated path
     * @param {*} defaultValue - Default value if path doesn't exist
     * @returns {*} Value at path
     */
    getPath(path, defaultValue = null) {
        const keys = path.split('.');
        let current = this.state;
        
        for (const key of keys) {
            if (current === null || current === undefined || !(key in current)) {
                return defaultValue;
            }
            current = current[key];
        }
        
        return current;
    },

    /**
     * Subscribe to state changes
     * @param {Function} listener - Listener function
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    },

    /**
     * Notify all listeners of state change
     */
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('State listener error:', error);
            }
        });
    },

    /**
     * Save current state to history
     */
    saveToHistory() {
        // Remove any future history if we're not at the end
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Add current state
        this.history.push(Helpers.deepClone(this.state));
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    },

    /**
     * Undo last change
     * @returns {boolean} Whether undo was successful
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.state = Helpers.deepClone(this.history[this.historyIndex]);
            this.notifyListeners();
            this.persistState();
            return true;
        }
        return false;
    },

    /**
     * Redo last undone change
     * @returns {boolean} Whether redo was successful
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.state = Helpers.deepClone(this.history[this.historyIndex]);
            this.notifyListeners();
            this.persistState();
            return true;
        }
        return false;
    },

    /**
     * Check if undo is available
     * @returns {boolean}
     */
    canUndo() {
        return this.historyIndex > 0;
    },

    /**
     * Check if redo is available
     * @returns {boolean}
     */
    canRedo() {
        return this.historyIndex < this.history.length - 1;
    },

    /**
     * Persist state to localStorage
     */
    persistState() {
        Helpers.storage.set('landcraft_state', this.state);
    },

    /**
     * Clear persisted state
     */
    clearPersisted() {
        Helpers.storage.remove('landcraft_state');
    },

    /**
     * Reset state to defaults
     */
    reset() {
        this.clearPersisted();
        this.state = {
            projectName: 'Untitled Project',
            currentStep: 0,
            selectedElement: null,
            currentView: 'builder',
            header: {
                image: { url: null, height: 300 },
                title: {
                    text: 'Welcome to Our Page',
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 32,
                    color: '#1e293b',
                    bold: false,
                    italic: false,
                    underline: false,
                    align: 'center'
                },
                description: {
                    html: '<p>Fill out the form below to get started.</p>',
                    text: 'Fill out the form below to get started.',
                    fontSize: 16,
                    color: '#64748b'
                }
            },
            steps: [{ id: 'step_0', name: 'Welcome', fields: [] }],
            settings: {
                webhookUrl: '',
                submitButtonText: 'Submit',
                successMessage: 'Thank you! Your response has been recorded.',
                showProgressBar: true,
                theme: 'light'
            }
        };
        this.history = [];
        this.historyIndex = -1;
        this.saveToHistory();
        this.notifyListeners();
    },

    // =====================================
    // STEP MANAGEMENT
    // =====================================

    /**
     * Add a new step
     * @param {string} name - Step name
     * @returns {Object} New step
     */
    addStep(name = '') {
        const newStep = {
            id: Helpers.generateId('step'),
            name: name || `Step ${this.state.steps.length + 1}`,
            fields: []
        };
        
        const steps = [...this.state.steps, newStep];
        this.setState({ steps });
        
        return newStep;
    },

    /**
     * Update step properties
     * @param {number} stepIndex - Step index
     * @param {Object} updates - Step updates
     */
    updateStep(stepIndex, updates) {
        const steps = Helpers.deepClone(this.state.steps);
        if (steps[stepIndex]) {
            steps[stepIndex] = { ...steps[stepIndex], ...updates };
            this.setState({ steps });
        }
    },

    /**
     * Delete a step
     * @param {number} stepIndex - Step index to delete
     */
    deleteStep(stepIndex) {
        if (this.state.steps.length <= 1) return; // Keep at least one step
        
        const steps = this.state.steps.filter((_, i) => i !== stepIndex);
        let currentStep = this.state.currentStep;
        
        if (currentStep >= steps.length) {
            currentStep = steps.length - 1;
        }
        
        this.setState({ steps, currentStep });
    },

    /**
     * Reorder steps
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Destination index
     */
    reorderSteps(fromIndex, toIndex) {
        const steps = [...this.state.steps];
        const [removed] = steps.splice(fromIndex, 1);
        steps.splice(toIndex, 0, removed);
        this.setState({ steps });
    },

    /**
     * Set current step
     * @param {number} index - Step index
     */
    setCurrentStep(index) {
        if (index >= 0 && index < this.state.steps.length) {
            this.setState({ currentStep: index });
        }
    },

    /**
     * Get current step
     * @returns {Object} Current step
     */
    getCurrentStep() {
        return this.state.steps[this.state.currentStep];
    },

    // =====================================
    // FIELD MANAGEMENT
    // =====================================

    /**
     * Add field to current step
     * @param {string} type - Field type
     * @param {Object} config - Field configuration
     * @returns {Object} New field
     */
    addField(type, config = {}) {
        const fieldDefaults = this.getFieldDefaults(type);
        const newField = {
            id: Helpers.generateId('field'),
            type,
            ...fieldDefaults,
            ...config
        };
        
        const steps = Helpers.deepClone(this.state.steps);
        steps[this.state.currentStep].fields.push(newField);
        this.setState({ steps, selectedElement: newField.id });
        
        return newField;
    },

    /**
     * Add field at specific index
     * @param {string} type - Field type
     * @param {number} index - Index to insert at
     * @param {Object} config - Field configuration
     * @returns {Object} New field
     */
    addFieldAt(type, index, config = {}) {
        const fieldDefaults = this.getFieldDefaults(type);
        const newField = {
            id: Helpers.generateId('field'),
            type,
            ...fieldDefaults,
            ...config
        };
        
        const steps = Helpers.deepClone(this.state.steps);
        steps[this.state.currentStep].fields.splice(index, 0, newField);
        this.setState({ steps, selectedElement: newField.id });
        
        return newField;
    },

    /**
     * Get default configuration for field type
     * @param {string} type - Field type
     * @returns {Object} Default configuration
     */
    getFieldDefaults(type) {
        const defaults = {
            text: {
                label: 'Text Field',
                placeholder: 'Enter text...',
                required: false,
                validation: {},
                conditionalLogic: { enabled: false }
            },
            number: {
                label: 'Number Field',
                placeholder: 'Enter number...',
                required: false,
                validation: {},
                conditionalLogic: { enabled: false }
            },
            email: {
                label: 'Email Address',
                placeholder: 'Enter your email...',
                required: false,
                validation: { email: true },
                conditionalLogic: { enabled: false }
            },
            mobile: {
                label: 'Mobile Number',
                placeholder: 'Enter 10-digit mobile number...',
                required: false,
                validation: { mobile: true, maxLength: 10 },
                conditionalLogic: { enabled: false }
            },
            textarea: {
                label: 'Long Text',
                placeholder: 'Enter your message...',
                required: false,
                validation: {},
                conditionalLogic: { enabled: false }
            },
            dropdown: {
                label: 'Select Option',
                placeholder: 'Choose an option...',
                required: false,
                options: [
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                    { value: 'option3', label: 'Option 3' }
                ],
                validation: {},
                conditionalLogic: { enabled: false }
            },
            radio: {
                label: 'Choose One',
                required: false,
                options: [
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' }
                ],
                validation: {},
                conditionalLogic: { enabled: false }
            },
            checkbox: {
                label: 'Select Multiple',
                required: false,
                options: [
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' }
                ],
                validation: {},
                conditionalLogic: { enabled: false }
            },
            date: {
                label: 'Date',
                placeholder: 'Select date...',
                required: false,
                validation: {},
                conditionalLogic: { enabled: false }
            },
            file: {
                label: 'Upload File',
                required: false,
                accept: '*/*',
                maxSize: '10MB',
                validation: {},
                conditionalLogic: { enabled: false }
            },
            header: {
                type: 'header'
            },
            title: {
                type: 'title'
            },
            description: {
                type: 'description'
            },
            submit: {
                label: 'Submit',
                type: 'submit'
            }
        };

        return defaults[type] || defaults.text;
    },

    /**
     * Update field properties
     * @param {string} fieldId - Field ID
     * @param {Object} updates - Field updates
     */
    updateField(fieldId, updates) {
        const steps = Helpers.deepClone(this.state.steps);
        
        for (const step of steps) {
            const fieldIndex = step.fields.findIndex(f => f.id === fieldId);
            if (fieldIndex !== -1) {
                step.fields[fieldIndex] = { ...step.fields[fieldIndex], ...updates };
                this.setState({ steps });
                return;
            }
        }
    },

    /**
     * Delete field
     * @param {string} fieldId - Field ID to delete
     */
    deleteField(fieldId) {
        const steps = Helpers.deepClone(this.state.steps);
        
        for (const step of steps) {
            const fieldIndex = step.fields.findIndex(f => f.id === fieldId);
            if (fieldIndex !== -1) {
                step.fields.splice(fieldIndex, 1);
                this.setState({ 
                    steps, 
                    selectedElement: null 
                });
                return;
            }
        }
    },

    /**
     * Reorder fields within current step
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Destination index
     */
    reorderFields(fromIndex, toIndex) {
        const steps = Helpers.deepClone(this.state.steps);
        const currentStepIndex = this.state.currentStep;
        const fields = steps[currentStepIndex].fields;
        
        const [removed] = fields.splice(fromIndex, 1);
        fields.splice(toIndex, 0, removed);
        
        this.setState({ steps });
    },

    /**
     * Get field by ID
     * @param {string} fieldId - Field ID
     * @returns {Object|null} Field object or null
     */
    getField(fieldId) {
        for (const step of this.state.steps) {
            const field = step.fields.find(f => f.id === fieldId);
            if (field) return field;
        }
        return null;
    },

    /**
     * Get all fields across all steps
     * @returns {Array} All fields
     */
    getAllFields() {
        return this.state.steps.flatMap(step => step.fields);
    },

    /**
     * Get all fields that can be used in conditional logic
     * @param {string} excludeFieldId - Field ID to exclude
     * @returns {Array} Fields for conditions
     */
    getFieldsForConditions(excludeFieldId = null) {
        const validTypes = ['dropdown', 'radio', 'checkbox', 'text', 'number', 'email', 'mobile'];
        return this.getAllFields()
            .filter(f => f.id !== excludeFieldId && validTypes.includes(f.type));
    },

    /**
     * Select element
     * @param {string|null} elementId - Element ID or null to deselect
     */
    selectElement(elementId) {
        this.setState({ selectedElement: elementId }, false); // Don't save to history
    },

    /**
     * Get selected element
     * @returns {Object|null} Selected element
     */
    getSelectedElement() {
        if (!this.state.selectedElement) return null;
        
        // Check if it's a special element type
        if (this.state.selectedElement === 'header') {
            return { type: 'header', id: 'header' };
        }
        if (this.state.selectedElement === 'title') {
            return { type: 'title', id: 'title' };
        }
        if (this.state.selectedElement === 'description') {
            return { type: 'description', id: 'description' };
        }
        
        return this.getField(this.state.selectedElement);
    },

    // =====================================
    // HEADER MANAGEMENT
    // =====================================

    /**
     * Update header image
     * @param {Object} imageData - Image data {url, height}
     */
    updateHeaderImage(imageData) {
        const header = Helpers.deepClone(this.state.header);
        header.image = { ...header.image, ...imageData };
        this.setState({ header });
    },

    /**
     * Update header title
     * @param {Object} titleData - Title data
     */
    updateHeaderTitle(titleData) {
        const header = Helpers.deepClone(this.state.header);
        header.title = { ...header.title, ...titleData };
        this.setState({ header });
    },

    /**
     * Update header description
     * @param {Object} descData - Description data
     */
    updateHeaderDescription(descData) {
        const header = Helpers.deepClone(this.state.header);
        header.description = { ...header.description, ...descData };
        this.setState({ header });
    },

    // =====================================
    // SETTINGS MANAGEMENT
    // =====================================

    /**
     * Update settings
     * @param {Object} settings - Settings updates
     */
    updateSettings(settings) {
        this.setState({
            settings: { ...this.state.settings, ...settings }
        });
    },

    /**
     * Toggle theme
     */
    toggleTheme() {
        const theme = this.state.settings.theme === 'light' ? 'dark' : 'light';
        this.updateSettings({ theme });
        document.documentElement.setAttribute('data-theme', theme);
    },

    // =====================================
    // IMPORT/EXPORT
    // =====================================

    /**
     * Export state as JSON
     * @returns {string} JSON string
     */
    exportJSON() {
        return JSON.stringify(ExportUtils.generateJSONSchema(this.state), null, 2);
    },

    /**
     * Import state from JSON
     * @param {string|Object} json - JSON string or object
     */
    importJSON(json) {
        try {
            const data = typeof json === 'string' ? JSON.parse(json) : json;
            
            // Convert imported schema to state format
            const newState = {
                projectName: data.project_name || 'Imported Project',
                header: {
                    image: {
                        url: data.header_image,
                        height: data.header_image_height || 300
                    },
                    title: data.title ? {
                        text: data.title.text || '',
                        fontFamily: data.title.font_family || 'Plus Jakarta Sans',
                        fontSize: data.title.font_size || 32,
                        color: data.title.color || '#1e293b',
                        bold: data.title.bold || false,
                        italic: data.title.italic || false,
                        underline: data.title.underline || false,
                        align: data.title.align || 'center'
                    } : this.state.header.title,
                    description: data.description ? {
                        html: data.description.html || '',
                        text: data.description.text || '',
                        fontSize: data.description.font_size || 16,
                        color: data.description.color || '#64748b'
                    } : this.state.header.description
                },
                steps: (data.steps || []).map((step, index) => ({
                    id: Helpers.generateId('step'),
                    name: step.step_name || `Step ${index + 1}`,
                    fields: (step.fields || []).map(field => ({
                        id: field.id || Helpers.generateId('field'),
                        type: field.type,
                        label: field.label,
                        placeholder: field.placeholder || '',
                        required: field.required || false,
                        options: field.options || [],
                        validation: {
                            minLength: field.validation?.min_length,
                            maxLength: field.validation?.max_length,
                            pattern: field.validation?.pattern,
                            errorMessage: field.validation?.error_message
                        },
                        conditionalLogic: field.conditional_logic || { enabled: false }
                    }))
                })),
                settings: {
                    webhookUrl: data.webhook_url || '',
                    submitButtonText: data.settings?.submit_button_text || 'Submit',
                    successMessage: data.settings?.success_message || 'Thank you!',
                    showProgressBar: data.settings?.show_progress_bar !== false,
                    theme: this.state.settings.theme
                }
            };

            if (newState.steps.length === 0) {
                newState.steps = [{ id: 'step_0', name: 'Step 1', fields: [] }];
            }

            this.setState({ ...this.state, ...newState, currentStep: 0, selectedElement: null });
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
};

// Export for use in other modules
window.AppState = AppState;
