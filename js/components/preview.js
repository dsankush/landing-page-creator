/**
 * ================================================
 * LANDCRAFT - Preview Component
 * Handles live preview rendering
 * ================================================
 */

const Preview = {
    panel: null,
    iframe: null,
    container: null,
    currentDevice: 'desktop',

    /**
     * Initialize preview component
     */
    init() {
        this.panel = document.getElementById('previewPanel');
        this.iframe = document.getElementById('previewFrame');
        this.container = document.getElementById('previewContainer');

        // Device selector buttons
        const deviceBtns = document.querySelectorAll('.device-btn');
        deviceBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setDevice(btn.dataset.device));
        });

        // Close preview button
        const closeBtn = document.getElementById('closePreview');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Subscribe to state changes for live updates
        AppState.subscribe(() => {
            if (this.isVisible()) {
                this.render();
            }
        });
    },

    /**
     * Show preview panel
     */
    show() {
        if (this.panel) {
            this.panel.style.display = 'flex';
            this.render();
        }
    },

    /**
     * Hide preview panel
     */
    hide() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
        
        // Switch back to builder view
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === 'builder');
        });
    },

    /**
     * Check if preview is visible
     * @returns {boolean}
     */
    isVisible() {
        return this.panel && this.panel.style.display !== 'none';
    },

    /**
     * Set preview device
     * @param {string} device - Device type (desktop, tablet, mobile)
     */
    setDevice(device) {
        this.currentDevice = device;
        
        // Update button states
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.device === device);
        });

        // Update container
        if (this.container) {
            this.container.dataset.device = device;
        }

        // Update iframe width
        if (this.iframe) {
            const widths = {
                desktop: '100%',
                tablet: '768px',
                mobile: '375px'
            };
            this.iframe.style.maxWidth = widths[device] || '100%';
        }
    },

    /**
     * Render preview
     */
    render() {
        if (!this.iframe) return;

        const state = AppState.getState();
        const html = this.generatePreviewHTML(state);

        // Write to iframe
        const doc = this.iframe.contentDocument || this.iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
    },

    /**
     * Generate preview HTML
     * @param {Object} state - Application state
     * @returns {string} HTML string
     */
    generatePreviewHTML(state) {
        const { header, steps, settings } = state;
        const currentStep = state.currentStep;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        ${this.getPreviewStyles(state)}
    </style>
</head>
<body>
    <div class="preview-container">
        ${this.renderHeader(header)}
        
        <div class="form-container">
            ${settings.showProgressBar && steps.length > 1 ? this.renderProgressBar(steps, currentStep) : ''}
            
            <form id="previewForm" class="preview-form" novalidate>
                ${steps.map((step, index) => this.renderStep(step, index, currentStep)).join('')}
                
                ${steps.length > 1 ? this.renderNavigation(currentStep, steps.length) : ''}
            </form>
        </div>
    </div>

    <script>
        ${this.getPreviewScript(state)}
    </script>
</body>
</html>`;
    },

    /**
     * Get preview styles
     * @param {Object} state - Application state
     * @returns {string} CSS string
     */
    getPreviewStyles(state) {
        const { header } = state;
        
        return `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #f8fafc;
    color: #1e293b;
    line-height: 1.6;
    min-height: 100vh;
    padding: 24px 16px;
}

.preview-container {
    max-width: 640px;
    margin: 0 auto;
}

/* Header */
.preview-header {
    text-align: center;
    margin-bottom: 32px;
}

.header-image {
    width: 100%;
    height: ${header.image?.height || 300}px;
    object-fit: cover;
    border-radius: 16px;
    margin-bottom: 24px;
}

.header-title {
    font-family: ${header.title?.fontFamily || 'Plus Jakarta Sans'}, sans-serif;
    font-size: ${header.title?.fontSize || 32}px;
    color: ${header.title?.color || '#1e293b'};
    font-weight: ${header.title?.bold ? '700' : '600'};
    font-style: ${header.title?.italic ? 'italic' : 'normal'};
    text-decoration: ${header.title?.underline ? 'underline' : 'none'};
    text-align: ${header.title?.align || 'center'};
    margin-bottom: 16px;
}

.header-description {
    font-size: ${header.description?.fontSize || 16}px;
    color: ${header.description?.color || '#64748b'};
    line-height: 1.7;
}

.header-description p { margin-bottom: 12px; }
.header-description p:last-child { margin-bottom: 0; }

/* Form Container */
.form-container {
    background: #fff;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

/* Progress */
.progress-container {
    margin-bottom: 32px;
}

.progress-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.progress-step {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #e2e8f0;
    transition: all 0.3s ease;
}

.progress-step.active {
    background: #6366f1;
    transform: scale(1.3);
}

.progress-step.completed {
    background: #22c55e;
}

.progress-connector {
    width: 40px;
    height: 2px;
    background: #e2e8f0;
}

.progress-connector.completed {
    background: #22c55e;
}

.progress-text {
    text-align: center;
    margin-top: 12px;
    font-size: 14px;
    color: #64748b;
}

/* Steps */
.form-step {
    display: none;
    animation: fadeIn 0.3s ease;
}

.form-step.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.step-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;
}

/* Fields */
.form-field {
    margin-bottom: 20px;
}

.form-field.hidden {
    display: none;
}

.field-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
}

.required-mark {
    color: #ef4444;
    margin-left: 2px;
}

.field-input,
.field-select,
.field-textarea {
    width: 100%;
    padding: 12px 16px;
    font-size: 15px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: #fff;
    transition: all 0.2s ease;
}

.field-input:focus,
.field-select:focus,
.field-textarea:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.field-textarea {
    min-height: 100px;
    resize: vertical;
}

.field-error {
    font-size: 13px;
    color: #ef4444;
    margin-top: 6px;
    display: none;
}

/* Radio & Checkbox */
.options-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.option-label {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.option-label:hover {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.05);
}

.option-label input {
    width: 18px;
    height: 18px;
    accent-color: #6366f1;
}

/* File Upload */
.file-upload {
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.file-upload:hover {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.05);
}

.file-upload input {
    display: none;
}

.file-upload-icon {
    font-size: 32px;
    margin-bottom: 8px;
}

.file-upload-text {
    font-size: 14px;
    color: #64748b;
}

/* Navigation */
.form-navigation {
    display: flex;
    justify-content: space-between;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
}

.btn {
    padding: 12px 32px;
    font-size: 15px;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
    background: #e2e8f0;
    color: #1e293b;
}

.btn-secondary:hover {
    background: #d1d5db;
}

/* Empty State */
.empty-fields {
    text-align: center;
    padding: 48px;
    color: #94a3b8;
}

.empty-fields-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

/* Conditional Badge */
.conditional-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: #fef3c7;
    color: #b45309;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    margin-left: 8px;
}
`;
    },

    /**
     * Render header
     * @param {Object} header - Header configuration
     * @returns {string} HTML string
     */
    renderHeader(header) {
        let html = '<header class="preview-header">';

        if (header.image?.url) {
            html += `<img src="${header.image.url}" alt="Header" class="header-image">`;
        }

        if (header.title?.text) {
            html += `<h1 class="header-title">${Helpers.sanitizeHTML(header.title.text)}</h1>`;
        }

        if (header.description?.html) {
            html += `<div class="header-description">${header.description.html}</div>`;
        }

        html += '</header>';
        return html;
    },

    /**
     * Render progress bar
     * @param {Array} steps - Steps array
     * @param {number} currentStep - Current step index
     * @returns {string} HTML string
     */
    renderProgressBar(steps, currentStep) {
        let html = '<div class="progress-container"><div class="progress-steps">';

        steps.forEach((_, index) => {
            if (index > 0) {
                const connectorClass = index <= currentStep ? 'completed' : '';
                html += `<div class="progress-connector ${connectorClass}"></div>`;
            }
            
            let stepClass = '';
            if (index === currentStep) stepClass = 'active';
            else if (index < currentStep) stepClass = 'completed';
            
            html += `<div class="progress-step ${stepClass}"></div>`;
        });

        html += `</div><div class="progress-text">Step ${currentStep + 1} of ${steps.length}</div></div>`;
        return html;
    },

    /**
     * Render step
     * @param {Object} step - Step configuration
     * @param {number} index - Step index
     * @param {number} currentStep - Current step index
     * @returns {string} HTML string
     */
    renderStep(step, index, currentStep) {
        const isActive = index === currentStep;
        let html = `<div class="form-step ${isActive ? 'active' : ''}" data-step="${index}">`;

        if (step.name) {
            html += `<h2 class="step-title">${Helpers.sanitizeHTML(step.name)}</h2>`;
        }

        if (step.fields.length === 0) {
            html += `
                <div class="empty-fields">
                    <div class="empty-fields-icon">📋</div>
                    <p>No fields added to this step yet</p>
                </div>
            `;
        } else {
            step.fields.forEach(field => {
                html += this.renderField(field);
            });
        }

        html += '</div>';
        return html;
    },

    /**
     * Render field
     * @param {Object} field - Field configuration
     * @returns {string} HTML string
     */
    renderField(field) {
        const { id, type, label, placeholder, required, options, conditionalLogic } = field;
        const requiredMark = required ? '<span class="required-mark">*</span>' : '';
        const conditionalClass = conditionalLogic?.enabled ? 'conditional' : '';
        const conditionalIndicator = conditionalLogic?.enabled ? 
            '<span class="conditional-indicator">⚡ Conditional</span>' : '';

        let html = `<div class="form-field ${conditionalClass}" data-field="${id}">`;
        html += `<label class="field-label">${Helpers.sanitizeHTML(label)}${requiredMark}${conditionalIndicator}</label>`;

        switch (type) {
            case 'text':
            case 'email':
            case 'number':
                html += `<input type="${type}" name="${id}" class="field-input" placeholder="${Helpers.sanitizeHTML(placeholder || '')}">`;
                break;

            case 'mobile':
                html += `<input type="tel" name="${id}" class="field-input" placeholder="${Helpers.sanitizeHTML(placeholder || 'Enter 10-digit mobile number')}" maxlength="10">`;
                break;

            case 'date':
                html += `<input type="date" name="${id}" class="field-input">`;
                break;

            case 'textarea':
                html += `<textarea name="${id}" class="field-textarea" placeholder="${Helpers.sanitizeHTML(placeholder || '')}"></textarea>`;
                break;

            case 'dropdown':
                html += `<select name="${id}" class="field-select">
                    <option value="">${Helpers.sanitizeHTML(placeholder || 'Select an option')}</option>
                    ${(options || []).map(opt => 
                        `<option value="${Helpers.sanitizeHTML(opt.value)}">${Helpers.sanitizeHTML(opt.label)}</option>`
                    ).join('')}
                </select>`;
                break;

            case 'radio':
                html += '<div class="options-group">';
                (options || []).forEach(opt => {
                    html += `<label class="option-label">
                        <input type="radio" name="${id}" value="${Helpers.sanitizeHTML(opt.value)}">
                        <span>${Helpers.sanitizeHTML(opt.label)}</span>
                    </label>`;
                });
                html += '</div>';
                break;

            case 'checkbox':
                html += '<div class="options-group">';
                (options || []).forEach(opt => {
                    html += `<label class="option-label">
                        <input type="checkbox" name="${id}" value="${Helpers.sanitizeHTML(opt.value)}">
                        <span>${Helpers.sanitizeHTML(opt.label)}</span>
                    </label>`;
                });
                html += '</div>';
                break;

            case 'file':
                html += `<div class="file-upload" onclick="this.querySelector('input').click()">
                    <input type="file" name="${id}">
                    <div class="file-upload-icon">📎</div>
                    <div class="file-upload-text">Click to upload file</div>
                </div>`;
                break;

            default:
                html += `<input type="text" name="${id}" class="field-input" placeholder="${Helpers.sanitizeHTML(placeholder || '')}">`;
        }

        html += '<div class="field-error"></div></div>';
        return html;
    },

    /**
     * Render navigation
     * @param {number} currentStep - Current step
     * @param {number} totalSteps - Total steps
     * @returns {string} HTML string
     */
    renderNavigation(currentStep, totalSteps) {
        const showPrev = currentStep > 0;
        const isLast = currentStep === totalSteps - 1;

        return `
            <div class="form-navigation">
                <button type="button" class="btn btn-secondary" id="prevBtn" ${showPrev ? '' : 'style="visibility: hidden;"'}>
                    ← Previous
                </button>
                <button type="button" class="btn btn-primary" id="nextBtn">
                    ${isLast ? 'Submit' : 'Next →'}
                </button>
            </div>
        `;
    },

    /**
     * Get preview script
     * @param {Object} state - Application state
     * @returns {string} JavaScript string
     */
    getPreviewScript(state) {
        return `
(function() {
    let currentStep = ${state.currentStep};
    const totalSteps = ${state.steps.length};
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateStep();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps - 1) {
                currentStep++;
                updateStep();
            } else {
                alert('Form submitted! (Preview mode)');
            }
        });
    }
    
    function updateStep() {
        document.querySelectorAll('.form-step').forEach((step, i) => {
            step.classList.toggle('active', i === currentStep);
        });
        
        document.querySelectorAll('.progress-step').forEach((dot, i) => {
            dot.classList.remove('active', 'completed');
            if (i === currentStep) dot.classList.add('active');
            else if (i < currentStep) dot.classList.add('completed');
        });
        
        document.querySelectorAll('.progress-connector').forEach((conn, i) => {
            conn.classList.toggle('completed', i < currentStep);
        });
        
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = 'Step ' + (currentStep + 1) + ' of ' + totalSteps;
        }
        
        if (prevBtn) prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
        if (nextBtn) nextBtn.textContent = currentStep === totalSteps - 1 ? 'Submit' : 'Next →';
    }
    
    // Handle file uploads
    document.querySelectorAll('.file-upload input').forEach(input => {
        input.addEventListener('change', function() {
            const text = this.closest('.file-upload').querySelector('.file-upload-text');
            if (this.files.length > 0) {
                text.textContent = this.files[0].name;
            }
        });
    });
})();
`;
    }
};

// Export for use in other modules
window.Preview = Preview;
