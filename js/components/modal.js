/**
 * ================================================
 * LANDCRAFT - Modal Component
 * Reusable modal dialog system
 * ================================================
 */

const Modal = {
    overlay: null,
    modal: null,
    activeModal: null,
    callbacks: {},

    /**
     * Initialize modal system
     */
    init() {
        this.overlay = document.getElementById('modalOverlay');
        this.modal = document.getElementById('modal');
        
        if (!this.overlay || !this.modal) {
            console.error('Modal elements not found');
            return;
        }

        // Close button handler
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Cancel button handler
        const cancelBtn = document.getElementById('modalCancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }

        // Confirm button handler
        const confirmBtn = document.getElementById('modalConfirm');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirm());
        }

        // Click outside to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
    },

    /**
     * Check if modal is open
     * @returns {boolean}
     */
    isOpen() {
        return this.overlay.classList.contains('active');
    },

    /**
     * Show modal
     * @param {Object} options - Modal options
     */
    show(options) {
        const {
            title = 'Modal',
            content = '',
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            confirmClass = 'btn-primary',
            showCancel = true,
            showConfirm = true,
            onConfirm = null,
            onCancel = null,
            onClose = null
        } = options;

        // Set title
        const titleEl = document.getElementById('modalTitle');
        if (titleEl) titleEl.textContent = title;

        // Set content
        const bodyEl = document.getElementById('modalBody');
        if (bodyEl) {
            bodyEl.innerHTML = typeof content === 'string' ? content : '';
            if (content instanceof HTMLElement) {
                bodyEl.innerHTML = '';
                bodyEl.appendChild(content);
            }
        }

        // Configure buttons
        const cancelBtn = document.getElementById('modalCancel');
        const confirmBtn = document.getElementById('modalConfirm');
        const footerEl = document.getElementById('modalFooter');

        if (cancelBtn) {
            cancelBtn.textContent = cancelText;
            cancelBtn.style.display = showCancel ? '' : 'none';
        }

        if (confirmBtn) {
            confirmBtn.textContent = confirmText;
            confirmBtn.className = `btn ${confirmClass}`;
            confirmBtn.style.display = showConfirm ? '' : 'none';
        }

        if (footerEl) {
            footerEl.style.display = (showCancel || showConfirm) ? '' : 'none';
        }

        // Store callbacks
        this.callbacks = { onConfirm, onCancel, onClose };

        // Show modal
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input if exists
        const firstInput = bodyEl.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    },

    /**
     * Close modal
     */
    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';

        if (this.callbacks.onClose) {
            this.callbacks.onClose();
        }
        if (this.callbacks.onCancel) {
            this.callbacks.onCancel();
        }

        this.callbacks = {};
    },

    /**
     * Confirm and close
     */
    confirm() {
        if (this.callbacks.onConfirm) {
            const result = this.callbacks.onConfirm();
            // If onConfirm returns false, don't close
            if (result === false) return;
        }

        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.callbacks = {};
    },

    /**
     * Show confirmation dialog
     * @param {string} title - Title
     * @param {string} message - Message
     * @param {Object} options - Additional options
     * @returns {Promise<boolean>}
     */
    confirm_dialog(title, message, options = {}) {
        return new Promise((resolve) => {
            this.show({
                title,
                content: `<p style="color: var(--text-secondary); line-height: 1.6;">${Helpers.sanitizeHTML(message)}</p>`,
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                confirmClass: options.danger ? 'btn-danger' : 'btn-primary',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
                onClose: () => resolve(false)
            });
        });
    },

    /**
     * Show alert dialog
     * @param {string} title - Title
     * @param {string} message - Message
     * @returns {Promise<void>}
     */
    alert(title, message) {
        return new Promise((resolve) => {
            this.show({
                title,
                content: `<p style="color: var(--text-secondary); line-height: 1.6;">${Helpers.sanitizeHTML(message)}</p>`,
                confirmText: 'OK',
                showCancel: false,
                onConfirm: () => resolve(),
                onClose: () => resolve()
            });
        });
    },

    /**
     * Show prompt dialog
     * @param {string} title - Title
     * @param {Object} options - Options
     * @returns {Promise<string|null>}
     */
    prompt(title, options = {}) {
        const {
            placeholder = '',
            defaultValue = '',
            inputType = 'text',
            required = false
        } = options;

        return new Promise((resolve) => {
            const inputId = Helpers.generateId('input');
            const content = `
                <div class="form-group">
                    <input 
                        type="${inputType}" 
                        id="${inputId}"
                        class="form-input" 
                        placeholder="${Helpers.sanitizeHTML(placeholder)}"
                        value="${Helpers.sanitizeHTML(defaultValue)}"
                        ${required ? 'required' : ''}
                    >
                </div>
            `;

            this.show({
                title,
                content,
                confirmText: 'OK',
                cancelText: 'Cancel',
                onConfirm: () => {
                    const input = document.getElementById(inputId);
                    const value = input ? input.value : '';
                    if (required && !value.trim()) {
                        input.classList.add('error');
                        return false;
                    }
                    resolve(value);
                },
                onCancel: () => resolve(null),
                onClose: () => resolve(null)
            });
        });
    },

    /**
     * Show step name editor
     * @param {string} currentName - Current step name
     * @returns {Promise<string|null>}
     */
    editStepName(currentName) {
        return this.prompt('Edit Step Name', {
            defaultValue: currentName,
            placeholder: 'Enter step name...',
            required: true
        });
    },

    /**
     * Show options editor modal
     * @param {Array} options - Current options
     * @returns {Promise<Array|null>}
     */
    editOptions(options = []) {
        return new Promise((resolve) => {
            let currentOptions = [...options];
            
            const renderOptions = () => {
                const listHtml = currentOptions.map((opt, index) => `
                    <div class="option-item" data-index="${index}">
                        <input 
                            type="text" 
                            class="form-input option-label-input" 
                            value="${Helpers.sanitizeHTML(opt.label)}"
                            placeholder="Option label"
                            data-field="label"
                        >
                        <input 
                            type="text" 
                            class="form-input option-value-input" 
                            value="${Helpers.sanitizeHTML(opt.value)}"
                            placeholder="Value"
                            data-field="value"
                            style="width: 100px;"
                        >
                        <button class="btn btn-icon btn-sm remove-option" title="Remove">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                `).join('');

                return `
                    <div class="options-editor">
                        <div class="options-list" id="optionsList">
                            ${listHtml}
                        </div>
                        <button class="btn btn-secondary btn-sm mt-2" id="addOptionBtn">
                            + Add Option
                        </button>
                    </div>
                `;
            };

            const updateFromInputs = () => {
                const items = document.querySelectorAll('#optionsList .option-item');
                currentOptions = Array.from(items).map(item => ({
                    label: item.querySelector('[data-field="label"]').value,
                    value: item.querySelector('[data-field="value"]').value
                }));
            };

            this.show({
                title: 'Edit Options',
                content: renderOptions(),
                confirmText: 'Save',
                cancelText: 'Cancel',
                onConfirm: () => {
                    updateFromInputs();
                    // Validate - at least one option with label
                    const validOptions = currentOptions.filter(o => o.label.trim());
                    if (validOptions.length === 0) {
                        Toast.error('At least one option with a label is required');
                        return false;
                    }
                    resolve(validOptions.map(o => ({
                        label: o.label.trim(),
                        value: o.value.trim() || Helpers.slugify(o.label)
                    })));
                },
                onCancel: () => resolve(null),
                onClose: () => resolve(null)
            });

            // Setup event listeners after modal is shown
            setTimeout(() => {
                const addBtn = document.getElementById('addOptionBtn');
                if (addBtn) {
                    addBtn.addEventListener('click', () => {
                        updateFromInputs();
                        currentOptions.push({ label: '', value: '' });
                        document.getElementById('modalBody').innerHTML = renderOptions();
                        // Re-attach listeners
                        setupListeners();
                    });
                }

                const setupListeners = () => {
                    document.querySelectorAll('.remove-option').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const index = parseInt(e.target.closest('.option-item').dataset.index);
                            updateFromInputs();
                            currentOptions.splice(index, 1);
                            document.getElementById('modalBody').innerHTML = renderOptions();
                            setupListeners();
                        });
                    });
                };

                setupListeners();
            }, 100);
        });
    },

    /**
     * Show publish modal
     * @returns {Promise<string|null>}
     */
    showPublishModal() {
        return new Promise((resolve) => {
            const content = `
                <div class="publish-options">
                    <div class="publish-option" data-action="download">
                        <div class="publish-option-icon">📥</div>
                        <div class="publish-option-title">Download ZIP</div>
                        <div class="publish-option-desc">Get all files as a ZIP archive</div>
                    </div>
                    <div class="publish-option" data-action="copy">
                        <div class="publish-option-icon">📋</div>
                        <div class="publish-option-title">Copy HTML</div>
                        <div class="publish-option-desc">Copy complete HTML to clipboard</div>
                    </div>
                    <div class="publish-option" data-action="json">
                        <div class="publish-option-icon">📄</div>
                        <div class="publish-option-title">Export JSON</div>
                        <div class="publish-option-desc">Download form schema as JSON</div>
                    </div>
                    <div class="publish-option" data-action="preview">
                        <div class="publish-option-icon">👁️</div>
                        <div class="publish-option-title">Preview</div>
                        <div class="publish-option-desc">Open in preview mode</div>
                    </div>
                </div>
            `;

            this.show({
                title: 'Publish Landing Page',
                content,
                showConfirm: false,
                cancelText: 'Close',
                onCancel: () => resolve(null)
            });

            // Add click handlers
            setTimeout(() => {
                document.querySelectorAll('.publish-option').forEach(option => {
                    option.addEventListener('click', () => {
                        const action = option.dataset.action;
                        this.close();
                        resolve(action);
                    });
                });
            }, 100);
        });
    }
};

// Export for use in other modules
window.Modal = Modal;
