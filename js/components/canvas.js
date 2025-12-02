/**
 * ================================================
 * LANDCRAFT - Canvas Component
 * Handles the main builder canvas rendering
 * ================================================
 */

const Canvas = {
    element: null,
    emptyState: null,

    /**
     * Initialize canvas
     */
    init() {
        this.element = document.getElementById('canvas');
        this.emptyState = document.getElementById('emptyState');
        
        // Subscribe to state changes
        AppState.subscribe(() => this.render());

        // Initial render
        this.render();
    },

    /**
     * Render canvas based on current state
     */
    render() {
        if (!this.element) return;

        const state = AppState.getState();
        const currentStep = state.steps[state.currentStep];
        
        if (!currentStep) return;

        // Clear canvas
        this.element.innerHTML = '';

        // Check if there are any elements
        const hasHeader = state.header.image?.url || state.header.title?.text || state.header.description?.html;
        const hasFields = currentStep.fields.length > 0;

        if (!hasHeader && !hasFields) {
            this.renderEmptyState();
            return;
        }

        // Render header section
        if (state.currentStep === 0) {
            this.renderHeaderSection(state.header, state.selectedElement);
        }

        // Render fields
        currentStep.fields.forEach((field, index) => {
            const fieldEl = this.renderField(field, index, state.selectedElement);
            this.element.appendChild(fieldEl);
            DragDrop.makeFieldDraggable(fieldEl, index);
        });

        // Update step navigation
        this.updateStepNavigation();
    },

    /**
     * Render empty state
     */
    renderEmptyState() {
        this.element.innerHTML = `
            <div class="canvas-empty-state">
                <div class="empty-icon">🎨</div>
                <h3>Start Building Your Landing Page</h3>
                <p>Drag and drop elements from the left sidebar, or click on them to add to your page.</p>
            </div>
        `;
    },

    /**
     * Render header section
     * @param {Object} header - Header configuration
     * @param {string} selectedElement - Selected element ID
     */
    renderHeaderSection(header, selectedElement) {
        // Header image
        if (header.image?.url) {
            const headerEl = this.createElement('header', {
                className: `canvas-element header-element ${selectedElement === 'header' ? 'selected' : ''}`,
                dataset: { elementType: 'header' }
            });

            headerEl.innerHTML = `
                <div class="element-actions">
                    <button class="element-action-btn" data-action="settings" title="Settings">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>
                </div>
                <div class="header-image-container">
                    <img src="${header.image.url}" alt="Header Image" style="height: ${header.image.height || 300}px;">
                </div>
            `;

            headerEl.addEventListener('click', (e) => {
                if (!e.target.closest('.element-action-btn')) {
                    AppState.selectElement('header');
                    this.render();
                    Properties.updatePanel();
                }
            });

            this.element.appendChild(headerEl);
        }

        // Title
        if (header.title?.text) {
            const titleEl = this.createElement('div', {
                className: `canvas-element title-element ${selectedElement === 'title' ? 'selected' : ''}`,
                dataset: { elementType: 'title' }
            });

            const titleStyle = `
                font-family: ${header.title.fontFamily || 'Plus Jakarta Sans'}, sans-serif;
                font-size: ${header.title.fontSize || 32}px;
                color: ${header.title.color || '#1a1a2e'};
                font-weight: ${header.title.bold ? '700' : '600'};
                font-style: ${header.title.italic ? 'italic' : 'normal'};
                text-decoration: ${header.title.underline ? 'underline' : 'none'};
                text-align: ${header.title.align || 'center'};
            `;

            titleEl.innerHTML = `
                <div class="element-actions">
                    <button class="element-action-btn" data-action="settings" title="Settings">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>
                </div>
                <h1 style="${titleStyle}">${Helpers.sanitizeHTML(header.title.text)}</h1>
            `;

            titleEl.addEventListener('click', (e) => {
                if (!e.target.closest('.element-action-btn')) {
                    AppState.selectElement('title');
                    this.render();
                    Properties.updatePanel();
                }
            });

            this.element.appendChild(titleEl);
        }

        // Description
        if (header.description?.html) {
            const descEl = this.createElement('div', {
                className: `canvas-element description-element ${selectedElement === 'description' ? 'selected' : ''}`,
                dataset: { elementType: 'description' }
            });

            const descStyle = `
                font-size: ${header.description.fontSize || 16}px;
                color: ${header.description.color || '#666'};
                line-height: 1.7;
            `;

            descEl.innerHTML = `
                <div class="element-actions">
                    <button class="element-action-btn" data-action="settings" title="Settings">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>
                </div>
                <div style="${descStyle}">${header.description.html}</div>
            `;

            descEl.addEventListener('click', (e) => {
                if (!e.target.closest('.element-action-btn')) {
                    AppState.selectElement('description');
                    this.render();
                    Properties.updatePanel();
                }
            });

            this.element.appendChild(descEl);
        }
    },

    /**
     * Render a field
     * @param {Object} field - Field configuration
     * @param {number} index - Field index
     * @param {string} selectedElement - Selected element ID
     * @returns {HTMLElement} Field element
     */
    renderField(field, index, selectedElement) {
        const el = this.createElement('div', {
            className: `canvas-element canvas-field ${selectedElement === field.id ? 'selected' : ''}`,
            dataset: { fieldId: field.id, fieldType: field.type }
        });

        const hasConditional = field.conditionalLogic?.enabled;

        el.innerHTML = `
            <div class="drag-handle" title="Drag to reorder">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
            </div>
            <div class="element-actions">
                <button class="element-action-btn" data-action="duplicate" title="Duplicate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="element-action-btn delete" data-action="delete" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
            <span class="field-type-indicator">${field.type}</span>
            ${hasConditional ? '<span class="conditional-badge"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg> Conditional</span>' : ''}
            <div class="field-wrapper">
                ${this.renderFieldPreview(field)}
            </div>
        `;

        // Click handler for selection
        el.addEventListener('click', (e) => {
            const action = e.target.closest('.element-action-btn')?.dataset.action;
            
            if (action === 'delete') {
                e.stopPropagation();
                this.handleDelete(field.id);
            } else if (action === 'duplicate') {
                e.stopPropagation();
                this.handleDuplicate(field);
            } else if (!e.target.closest('.drag-handle')) {
                AppState.selectElement(field.id);
                this.render();
                Properties.updatePanel();
            }
        });

        return el;
    },

    /**
     * Render field preview
     * @param {Object} field - Field configuration
     * @returns {string} HTML string
     */
    renderFieldPreview(field) {
        const { type, label, placeholder, required, options } = field;
        const requiredMark = required ? '<span class="field-required">*</span>' : '';

        let html = `<label class="field-label">${Helpers.sanitizeHTML(label)}${requiredMark}</label>`;

        switch (type) {
            case 'text':
            case 'email':
            case 'number':
                html += `<input type="${type}" class="field-input" placeholder="${Helpers.sanitizeHTML(placeholder || '')}" disabled>`;
                break;

            case 'mobile':
                html += `<input type="tel" class="field-input" placeholder="${Helpers.sanitizeHTML(placeholder || 'Enter 10-digit mobile number')}" disabled>`;
                break;

            case 'date':
                html += `<input type="date" class="field-input" disabled>`;
                break;

            case 'textarea':
                html += `<textarea class="field-input" placeholder="${Helpers.sanitizeHTML(placeholder || '')}" disabled style="min-height: 80px;"></textarea>`;
                break;

            case 'dropdown':
                html += `<select class="field-input" disabled>
                    <option>${Helpers.sanitizeHTML(placeholder || 'Select an option')}</option>
                    ${(options || []).map(opt => `<option>${Helpers.sanitizeHTML(opt.label)}</option>`).join('')}
                </select>`;
                break;

            case 'radio':
                html += '<div class="option-group">';
                (options || []).forEach(opt => {
                    html += `<label class="option-item-preview">
                        <input type="radio" disabled>
                        <span>${Helpers.sanitizeHTML(opt.label)}</span>
                    </label>`;
                });
                html += '</div>';
                break;

            case 'checkbox':
                html += '<div class="option-group">';
                (options || []).forEach(opt => {
                    html += `<label class="option-item-preview">
                        <input type="checkbox" disabled>
                        <span>${Helpers.sanitizeHTML(opt.label)}</span>
                    </label>`;
                });
                html += '</div>';
                break;

            case 'file':
                html += `<div class="file-upload-area">
                    <div class="file-upload-icon">📎</div>
                    <div class="file-upload-text">Click or drag to upload file</div>
                </div>`;
                break;

            case 'submit':
                html = `<div class="submit-button-wrapper">
                    <button type="button" class="submit-button">${Helpers.sanitizeHTML(label || 'Submit')}</button>
                </div>`;
                break;

            default:
                html += `<input type="text" class="field-input" placeholder="${Helpers.sanitizeHTML(placeholder || '')}" disabled>`;
        }

        return html;
    },

    /**
     * Handle field deletion
     * @param {string} fieldId - Field ID
     */
    async handleDelete(fieldId) {
        const confirmed = await Modal.confirm_dialog(
            'Delete Field',
            'Are you sure you want to delete this field?',
            { danger: true, confirmText: 'Delete' }
        );

        if (confirmed) {
            AppState.deleteField(fieldId);
            Toast.success('Field deleted');
        }
    },

    /**
     * Handle field duplication
     * @param {Object} field - Field to duplicate
     */
    handleDuplicate(field) {
        const newField = Helpers.deepClone(field);
        newField.id = Helpers.generateId('field');
        newField.label = field.label + ' (Copy)';
        
        const state = AppState.getState();
        const currentStep = state.steps[state.currentStep];
        const fieldIndex = currentStep.fields.findIndex(f => f.id === field.id);
        
        AppState.addFieldAt(newField.type, fieldIndex + 1, newField);
        Toast.success('Field duplicated');
    },

    /**
     * Update step navigation
     */
    updateStepNavigation() {
        const state = AppState.getState();
        const { steps, currentStep } = state;

        // Update step tabs
        const container = document.getElementById('stepsContainer');
        if (container) {
            container.innerHTML = steps.map((step, index) => `
                <button class="step-tab ${index === currentStep ? 'active' : ''}" data-step="${index}">
                    <span class="step-number">${index + 1}</span>
                    <span class="step-name">${Helpers.sanitizeHTML(step.name || `Step ${index + 1}`)}</span>
                    ${steps.length > 1 ? '<button class="step-delete" data-delete-step="' + index + '" title="Delete Step">×</button>' : ''}
                </button>
            `).join('');

            // Add event listeners
            container.querySelectorAll('.step-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('step-delete')) {
                        AppState.setCurrentStep(parseInt(tab.dataset.step));
                    }
                });

                // Double click to rename
                tab.addEventListener('dblclick', async () => {
                    const stepIndex = parseInt(tab.dataset.step);
                    const currentName = steps[stepIndex].name;
                    const newName = await Modal.editStepName(currentName);
                    if (newName && newName !== currentName) {
                        AppState.updateStep(stepIndex, { name: newName });
                        Canvas.render();
                    }
                });
            });

            container.querySelectorAll('.step-delete').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const stepIndex = parseInt(btn.dataset.deleteStep);
                    const confirmed = await Modal.confirm_dialog(
                        'Delete Step',
                        `Are you sure you want to delete "${steps[stepIndex].name}"? All fields in this step will be removed.`,
                        { danger: true, confirmText: 'Delete' }
                    );
                    if (confirmed) {
                        AppState.deleteStep(stepIndex);
                        Toast.success('Step deleted');
                    }
                });
            });
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (prevBtn) {
            prevBtn.style.visibility = currentStep > 0 ? 'visible' : 'hidden';
        }

        if (nextBtn) {
            nextBtn.style.visibility = currentStep < steps.length - 1 ? 'visible' : 'hidden';
        }

        if (progressFill) {
            const progress = ((currentStep + 1) / steps.length) * 100;
            progressFill.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = `Step ${currentStep + 1} of ${steps.length}`;
        }
    },

    /**
     * Create element helper
     * @param {string} tag - Tag name
     * @param {Object} options - Element options
     * @returns {HTMLElement}
     */
    createElement(tag, options = {}) {
        const el = document.createElement(tag);
        
        if (options.className) el.className = options.className;
        if (options.id) el.id = options.id;
        if (options.dataset) {
            Object.entries(options.dataset).forEach(([key, value]) => {
                el.dataset[key] = value;
            });
        }
        
        return el;
    }
};

// Export for use in other modules
window.Canvas = Canvas;
