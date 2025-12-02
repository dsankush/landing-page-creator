/**
 * ================================================
 * LANDCRAFT - Properties Panel Component
 * Handles field and element property editing
 * ================================================
 */

const Properties = {
    panel: null,
    contentEl: null,
    currentElement: null,

    /**
     * Initialize properties panel
     */
    init() {
        this.panel = document.getElementById('propertiesPanel');
        this.contentEl = document.getElementById('propertiesContent');
        
        // Close button
        const closeBtn = document.getElementById('closeProperties');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                AppState.selectElement(null);
                this.showPageSettings();
            });
        }

        // Subscribe to state changes
        AppState.subscribe((state) => {
            if (state.selectedElement !== this.currentElement) {
                this.currentElement = state.selectedElement;
                this.updatePanel();
            }
        });

        this.setupPageSettings();
    },

    /**
     * Setup page settings event listeners
     */
    setupPageSettings() {
        // Webhook URL
        const webhookInput = document.getElementById('webhookUrl');
        if (webhookInput) {
            webhookInput.addEventListener('input', Helpers.debounce((e) => {
                AppState.updateSettings({ webhookUrl: e.target.value });
            }, 300));
        }

        // Submit button text
        const submitTextInput = document.getElementById('submitButtonText');
        if (submitTextInput) {
            submitTextInput.addEventListener('input', Helpers.debounce((e) => {
                AppState.updateSettings({ submitButtonText: e.target.value });
            }, 300));
        }

        // Success message
        const successMsgInput = document.getElementById('successMessage');
        if (successMsgInput) {
            successMsgInput.addEventListener('input', Helpers.debounce((e) => {
                AppState.updateSettings({ successMessage: e.target.value });
            }, 300));
        }

        // Show progress bar
        const progressToggle = document.getElementById('showProgressBar');
        if (progressToggle) {
            progressToggle.addEventListener('change', (e) => {
                AppState.updateSettings({ showProgressBar: e.target.checked });
                Canvas.render();
            });
        }
    },

    /**
     * Update properties panel based on selected element
     */
    updatePanel() {
        const element = AppState.getSelectedElement();
        const titleEl = document.getElementById('propertiesTitle');

        if (!element) {
            this.showPageSettings();
            if (titleEl) titleEl.textContent = 'Page Settings';
            return;
        }

        if (titleEl) titleEl.textContent = `${Helpers.capitalize(element.type)} Properties`;

        switch (element.type) {
            case 'header':
                this.showHeaderProperties();
                break;
            case 'title':
                this.showTitleProperties();
                break;
            case 'description':
                this.showDescriptionProperties();
                break;
            default:
                this.showFieldProperties(element);
        }
    },

    /**
     * Show page settings (default view)
     */
    showPageSettings() {
        const pageSettings = document.getElementById('pageSettings');
        if (pageSettings) {
            this.contentEl.innerHTML = '';
            this.contentEl.appendChild(pageSettings.cloneNode(true));
            this.setupPageSettings();
            
            // Populate current values
            const state = AppState.getState();
            const webhookInput = this.contentEl.querySelector('#webhookUrl');
            const submitTextInput = this.contentEl.querySelector('#submitButtonText');
            const successMsgInput = this.contentEl.querySelector('#successMessage');
            const progressToggle = this.contentEl.querySelector('#showProgressBar');
            
            if (webhookInput) webhookInput.value = state.settings.webhookUrl || '';
            if (submitTextInput) submitTextInput.value = state.settings.submitButtonText || 'Submit';
            if (successMsgInput) successMsgInput.value = state.settings.successMessage || '';
            if (progressToggle) progressToggle.checked = state.settings.showProgressBar;
        }
    },

    /**
     * Show header properties panel
     */
    showHeaderProperties() {
        const template = document.getElementById('headerPropertiesTemplate');
        if (!template) return;

        this.contentEl.innerHTML = '';
        const content = template.content.cloneNode(true);
        this.contentEl.appendChild(content);

        const state = AppState.getState();
        const header = state.header;

        // Image upload
        const uploadArea = this.contentEl.querySelector('#headerImageUpload');
        const imageInput = this.contentEl.querySelector('#headerImageInput');
        const imagePreview = this.contentEl.querySelector('#headerImagePreview');
        const removeBtn = this.contentEl.querySelector('#removeHeaderImage');
        const imageUrlInput = this.contentEl.querySelector('#headerImageUrl');
        const heightInput = this.contentEl.querySelector('#headerImageHeight');

        // Show current image
        if (header.image?.url) {
            imagePreview.src = header.image.url;
            imagePreview.style.display = 'block';
            removeBtn.style.display = 'block';
            uploadArea.querySelector('.upload-placeholder').style.display = 'none';
        }

        if (heightInput) {
            heightInput.value = header.image?.height || 300;
        }

        // Upload click
        uploadArea?.addEventListener('click', () => imageInput?.click());

        // File input change
        imageInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const dataUrl = await Helpers.readFileAsDataURL(file);
                AppState.updateHeaderImage({ url: dataUrl });
                imagePreview.src = dataUrl;
                imagePreview.style.display = 'block';
                removeBtn.style.display = 'block';
                uploadArea.querySelector('.upload-placeholder').style.display = 'none';
                Canvas.render();
            }
        });

        // Remove image
        removeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            AppState.updateHeaderImage({ url: null });
            imagePreview.style.display = 'none';
            removeBtn.style.display = 'none';
            uploadArea.querySelector('.upload-placeholder').style.display = 'flex';
            imageUrlInput.value = '';
            Canvas.render();
        });

        // Image URL input
        imageUrlInput?.addEventListener('input', Helpers.debounce((e) => {
            const url = e.target.value.trim();
            if (url) {
                AppState.updateHeaderImage({ url });
                imagePreview.src = url;
                imagePreview.style.display = 'block';
                removeBtn.style.display = 'block';
                uploadArea.querySelector('.upload-placeholder').style.display = 'none';
            }
            Canvas.render();
        }, 500));

        // Height input
        heightInput?.addEventListener('input', Helpers.debounce((e) => {
            AppState.updateHeaderImage({ height: parseInt(e.target.value) || 300 });
            Canvas.render();
        }, 300));

        // Drag and drop for image
        uploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea?.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea?.addEventListener('drop', async (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                const dataUrl = await Helpers.readFileAsDataURL(file);
                AppState.updateHeaderImage({ url: dataUrl });
                imagePreview.src = dataUrl;
                imagePreview.style.display = 'block';
                removeBtn.style.display = 'block';
                uploadArea.querySelector('.upload-placeholder').style.display = 'none';
                Canvas.render();
            }
        });
    },

    /**
     * Show title properties panel
     */
    showTitleProperties() {
        const template = document.getElementById('titlePropertiesTemplate');
        if (!template) return;

        this.contentEl.innerHTML = '';
        const content = template.content.cloneNode(true);
        this.contentEl.appendChild(content);

        const state = AppState.getState();
        const title = state.header.title;

        // Title text
        const textInput = this.contentEl.querySelector('#titleText');
        if (textInput) {
            textInput.value = title.text || '';
            textInput.addEventListener('input', Helpers.debounce((e) => {
                AppState.updateHeaderTitle({ text: e.target.value });
                Canvas.render();
            }, 200));
        }

        // Format buttons
        const formatBtns = this.contentEl.querySelectorAll('.format-btn');
        formatBtns.forEach(btn => {
            const format = btn.dataset.format;
            
            // Set active state
            if (format === 'bold' && title.bold) btn.classList.add('active');
            if (format === 'italic' && title.italic) btn.classList.add('active');
            if (format === 'underline' && title.underline) btn.classList.add('active');
            if (format === `align-${title.align}`) btn.classList.add('active');

            btn.addEventListener('click', () => {
                if (format === 'bold') {
                    btn.classList.toggle('active');
                    AppState.updateHeaderTitle({ bold: btn.classList.contains('active') });
                } else if (format === 'italic') {
                    btn.classList.toggle('active');
                    AppState.updateHeaderTitle({ italic: btn.classList.contains('active') });
                } else if (format === 'underline') {
                    btn.classList.toggle('active');
                    AppState.updateHeaderTitle({ underline: btn.classList.contains('active') });
                } else if (format.startsWith('align-')) {
                    formatBtns.forEach(b => {
                        if (b.dataset.format.startsWith('align-')) {
                            b.classList.remove('active');
                        }
                    });
                    btn.classList.add('active');
                    AppState.updateHeaderTitle({ align: format.replace('align-', '') });
                }
                Canvas.render();
            });
        });

        // Font family
        const fontSelect = this.contentEl.querySelector('#titleFontFamily');
        if (fontSelect) {
            fontSelect.value = title.fontFamily || 'Plus Jakarta Sans';
            fontSelect.addEventListener('change', (e) => {
                AppState.updateHeaderTitle({ fontFamily: e.target.value });
                Canvas.render();
            });
        }

        // Font size
        const sizeInput = this.contentEl.querySelector('#titleFontSize');
        if (sizeInput) {
            sizeInput.value = title.fontSize || 32;
            sizeInput.addEventListener('input', Helpers.debounce((e) => {
                AppState.updateHeaderTitle({ fontSize: parseInt(e.target.value) || 32 });
                Canvas.render();
            }, 200));
        }

        // Color
        const colorInput = this.contentEl.querySelector('#titleColor');
        const colorHexInput = this.contentEl.querySelector('#titleColorHex');
        if (colorInput && colorHexInput) {
            colorInput.value = title.color || '#1a1a2e';
            colorHexInput.value = title.color || '#1a1a2e';
            
            colorInput.addEventListener('input', (e) => {
                colorHexInput.value = e.target.value;
                AppState.updateHeaderTitle({ color: e.target.value });
                Canvas.render();
            });
            
            colorHexInput.addEventListener('input', Helpers.debounce((e) => {
                const color = e.target.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                    colorInput.value = color;
                    AppState.updateHeaderTitle({ color });
                    Canvas.render();
                }
            }, 300));
        }
    },

    /**
     * Show description properties panel
     */
    showDescriptionProperties() {
        const template = document.getElementById('descriptionPropertiesTemplate');
        if (!template) return;

        this.contentEl.innerHTML = '';
        const content = template.content.cloneNode(true);
        this.contentEl.appendChild(content);

        const state = AppState.getState();
        const desc = state.header.description;

        // Rich text editor
        const editor = this.contentEl.querySelector('#descriptionEditor');
        if (editor) {
            editor.innerHTML = desc.html || '<p>Fill out the form below to get started.</p>';
            
            editor.addEventListener('input', Helpers.debounce(() => {
                AppState.updateHeaderDescription({
                    html: editor.innerHTML,
                    text: editor.textContent
                });
                Canvas.render();
            }, 300));
        }

        // Format buttons
        const formatBtns = this.contentEl.querySelectorAll('.rich-text-toolbar .format-btn');
        formatBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.command;
                document.execCommand(command, false, null);
                editor.focus();
            });
        });

        // Font size
        const sizeInput = this.contentEl.querySelector('#descFontSize');
        if (sizeInput) {
            sizeInput.value = desc.fontSize || 16;
            sizeInput.addEventListener('input', Helpers.debounce((e) => {
                AppState.updateHeaderDescription({ fontSize: parseInt(e.target.value) || 16 });
                Canvas.render();
            }, 200));
        }

        // Color
        const colorInput = this.contentEl.querySelector('#descColor');
        const colorHexInput = this.contentEl.querySelector('#descColorHex');
        if (colorInput && colorHexInput) {
            colorInput.value = desc.color || '#666666';
            colorHexInput.value = desc.color || '#666666';
            
            colorInput.addEventListener('input', (e) => {
                colorHexInput.value = e.target.value;
                AppState.updateHeaderDescription({ color: e.target.value });
                Canvas.render();
            });
            
            colorHexInput.addEventListener('input', Helpers.debounce((e) => {
                const color = e.target.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                    colorInput.value = color;
                    AppState.updateHeaderDescription({ color });
                    Canvas.render();
                }
            }, 300));
        }
    },

    /**
     * Show field properties panel
     * @param {Object} field - Field object
     */
    showFieldProperties(field) {
        const template = document.getElementById('fieldPropertiesTemplate');
        if (!template) return;

        this.contentEl.innerHTML = '';
        const content = template.content.cloneNode(true);
        this.contentEl.appendChild(content);

        // Field label
        const labelInput = this.contentEl.querySelector('.field-label-input');
        if (labelInput) {
            labelInput.value = field.label || '';
            labelInput.addEventListener('input', Helpers.debounce((e) => {
                AppState.updateField(field.id, { label: e.target.value });
                Canvas.render();
            }, 200));
        }

        // Placeholder
        const placeholderInput = this.contentEl.querySelector('.field-placeholder-input');
        if (placeholderInput) {
            placeholderInput.value = field.placeholder || '';
            const showPlaceholder = !['radio', 'checkbox', 'file'].includes(field.type);
            placeholderInput.parentElement.style.display = showPlaceholder ? '' : 'none';
            
            placeholderInput.addEventListener('input', Helpers.debounce((e) => {
                AppState.updateField(field.id, { placeholder: e.target.value });
                Canvas.render();
            }, 200));
        }

        // Required toggle
        const requiredToggle = this.contentEl.querySelector('.field-required-toggle');
        if (requiredToggle) {
            requiredToggle.checked = field.required || false;
            requiredToggle.addEventListener('change', (e) => {
                AppState.updateField(field.id, { required: e.target.checked });
                Canvas.render();
            });
        }

        // Options (for dropdown, radio, checkbox)
        const optionsGroup = this.contentEl.querySelector('.options-group');
        if (optionsGroup && ['dropdown', 'radio', 'checkbox'].includes(field.type)) {
            optionsGroup.style.display = '';
            this.renderOptionsEditor(field);
        }

        // Validation section
        this.setupValidationSection(field);

        // Conditional logic section
        this.setupConditionalSection(field);

        // Delete button
        const deleteBtn = this.contentEl.querySelector('.delete-field-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                const confirmed = await Modal.confirm_dialog(
                    'Delete Field',
                    'Are you sure you want to delete this field? This action cannot be undone.',
                    { danger: true, confirmText: 'Delete' }
                );
                if (confirmed) {
                    AppState.deleteField(field.id);
                    Canvas.render();
                    this.showPageSettings();
                    Toast.success('Field deleted');
                }
            });
        }
    },

    /**
     * Render options editor for dropdown/radio/checkbox
     * @param {Object} field - Field object
     */
    renderOptionsEditor(field) {
        const optionsList = this.contentEl.querySelector('.options-list');
        const addBtn = this.contentEl.querySelector('.add-option-btn');
        
        if (!optionsList) return;

        const renderOptions = () => {
            const options = field.options || [];
            optionsList.innerHTML = options.map((opt, index) => `
                <div class="option-item" data-index="${index}">
                    <input 
                        type="text" 
                        class="form-input" 
                        value="${Helpers.sanitizeHTML(opt.label)}"
                        placeholder="Option label"
                    >
                    <button class="btn btn-icon btn-sm remove-option" title="Remove">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `).join('');

            // Add event listeners
            optionsList.querySelectorAll('.option-item').forEach((item, index) => {
                const input = item.querySelector('input');
                const removeBtn = item.querySelector('.remove-option');

                input.addEventListener('input', Helpers.debounce(() => {
                    const newOptions = [...(field.options || [])];
                    newOptions[index] = {
                        label: input.value,
                        value: Helpers.slugify(input.value) || `option_${index}`
                    };
                    AppState.updateField(field.id, { options: newOptions });
                    Canvas.render();
                }, 300));

                removeBtn.addEventListener('click', () => {
                    const newOptions = (field.options || []).filter((_, i) => i !== index);
                    AppState.updateField(field.id, { options: newOptions });
                    field = AppState.getField(field.id);
                    renderOptions();
                    Canvas.render();
                });
            });
        };

        renderOptions();

        // Add option button
        addBtn?.addEventListener('click', () => {
            const newOptions = [...(field.options || [])];
            const newIndex = newOptions.length + 1;
            newOptions.push({
                label: `Option ${newIndex}`,
                value: `option_${newIndex}`
            });
            AppState.updateField(field.id, { options: newOptions });
            field = AppState.getField(field.id);
            renderOptions();
            Canvas.render();
        });
    },

    /**
     * Setup validation section
     * @param {Object} field - Field object
     */
    setupValidationSection(field) {
        const validation = field.validation || {};

        // Max length
        const maxLengthInput = this.contentEl.querySelector('.validation-maxlength');
        if (maxLengthInput) {
            maxLengthInput.value = validation.maxLength || '';
            maxLengthInput.addEventListener('input', Helpers.debounce((e) => {
                const newValidation = { ...(field.validation || {}), maxLength: e.target.value ? parseInt(e.target.value) : null };
                AppState.updateField(field.id, { validation: newValidation });
            }, 300));
        }

        // Min length
        const minLengthInput = this.contentEl.querySelector('.validation-minlength');
        if (minLengthInput) {
            minLengthInput.value = validation.minLength || '';
            minLengthInput.addEventListener('input', Helpers.debounce((e) => {
                const newValidation = { ...(field.validation || {}), minLength: e.target.value ? parseInt(e.target.value) : null };
                AppState.updateField(field.id, { validation: newValidation });
            }, 300));
        }

        // Pattern
        const patternInput = this.contentEl.querySelector('.validation-pattern');
        if (patternInput) {
            patternInput.value = validation.pattern || '';
            patternInput.addEventListener('input', Helpers.debounce((e) => {
                const newValidation = { ...(field.validation || {}), pattern: e.target.value || null };
                AppState.updateField(field.id, { validation: newValidation });
            }, 300));
        }

        // Error message
        const errorMsgInput = this.contentEl.querySelector('.validation-error-msg');
        if (errorMsgInput) {
            errorMsgInput.value = validation.errorMessage || '';
            errorMsgInput.addEventListener('input', Helpers.debounce((e) => {
                const newValidation = { ...(field.validation || {}), errorMessage: e.target.value || null };
                AppState.updateField(field.id, { validation: newValidation });
            }, 300));
        }
    },

    /**
     * Setup conditional logic section
     * @param {Object} field - Field object
     */
    setupConditionalSection(field) {
        const conditional = field.conditionalLogic || { enabled: false };
        
        const enableToggle = this.contentEl.querySelector('.enable-conditional-toggle');
        const rulesContainer = this.contentEl.querySelector('.conditional-rules');
        const fieldSelect = this.contentEl.querySelector('.condition-field-select');
        const operatorSelect = this.contentEl.querySelector('.condition-operator-select');
        const valueInput = this.contentEl.querySelector('.condition-value-input');
        const valueGroup = this.contentEl.querySelector('.condition-value-group');

        if (!enableToggle || !rulesContainer) return;

        // Populate field select with other fields
        const availableFields = AppState.getFieldsForConditions(field.id);
        fieldSelect.innerHTML = '<option value="">Select a field...</option>';
        availableFields.forEach(f => {
            const option = document.createElement('option');
            option.value = f.id;
            option.textContent = f.label;
            if (conditional.field === f.id) option.selected = true;
            fieldSelect.appendChild(option);
        });

        // Set initial state
        enableToggle.checked = conditional.enabled;
        rulesContainer.style.display = conditional.enabled ? '' : 'none';
        
        if (conditional.operator) operatorSelect.value = conditional.operator;
        if (conditional.value) valueInput.value = conditional.value;

        // Show/hide value input based on operator
        const updateValueVisibility = () => {
            const op = operatorSelect.value;
            valueGroup.style.display = ['not_empty', 'empty'].includes(op) ? 'none' : '';
        };
        updateValueVisibility();

        // Enable toggle
        enableToggle.addEventListener('change', (e) => {
            rulesContainer.style.display = e.target.checked ? '' : 'none';
            AppState.updateField(field.id, {
                conditionalLogic: { ...conditional, enabled: e.target.checked }
            });
            Canvas.render();
        });

        // Field select
        fieldSelect.addEventListener('change', (e) => {
            const newConditional = { ...conditional, field: e.target.value };
            AppState.updateField(field.id, { conditionalLogic: newConditional });
            
            // If the selected field has options, show them in value dropdown
            const selectedField = AppState.getField(e.target.value);
            if (selectedField && selectedField.options && selectedField.options.length > 0) {
                // Replace text input with select
                const newSelect = document.createElement('select');
                newSelect.className = 'form-input condition-value-input';
                newSelect.innerHTML = '<option value="">Select value...</option>';
                selectedField.options.forEach(opt => {
                    newSelect.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
                });
                valueInput.replaceWith(newSelect);
                
                newSelect.addEventListener('change', (ev) => {
                    const updated = { ...AppState.getField(field.id).conditionalLogic, value: ev.target.value };
                    AppState.updateField(field.id, { conditionalLogic: updated });
                    Canvas.render();
                });
            }
            
            Canvas.render();
        });

        // Operator select
        operatorSelect.addEventListener('change', (e) => {
            const newConditional = { ...AppState.getField(field.id).conditionalLogic, operator: e.target.value };
            AppState.updateField(field.id, { conditionalLogic: newConditional });
            updateValueVisibility();
            Canvas.render();
        });

        // Value input
        valueInput.addEventListener('input', Helpers.debounce((e) => {
            const newConditional = { ...AppState.getField(field.id).conditionalLogic, value: e.target.value };
            AppState.updateField(field.id, { conditionalLogic: newConditional });
            Canvas.render();
        }, 300));
    }
};

// Export for use in other modules
window.Properties = Properties;
