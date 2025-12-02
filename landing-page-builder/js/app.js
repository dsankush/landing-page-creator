/**
 * ================================================
 * LANDCRAFT - Main Application
 * Landing Page Builder Tool
 * 
 * A comprehensive, production-ready landing page
 * builder with drag-and-drop, multi-step forms,
 * conditional logic, and export capabilities.
 * 
 * @author LandCraft Builder
 * @version 1.0.0
 * ================================================
 */

const App = {
    /**
     * Initialize the application
     */
    init() {
        console.log('🚀 LandCraft - Landing Page Builder v1.0.0');

        // Initialize all components
        this.initComponents();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Initialize theme
        this.initTheme();
        
        // Load saved state
        AppState.init();

        console.log('✅ Application initialized successfully');
    },

    /**
     * Initialize all components
     */
    initComponents() {
        Toast.init();
        Modal.init();
        DragDrop.init();
        Properties.init();
        Preview.init();
        Canvas.init();
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Project name input
        const projectNameInput = document.getElementById('projectName');
        if (projectNameInput) {
            projectNameInput.value = AppState.getState().projectName;
            projectNameInput.addEventListener('input', Helpers.debounce((e) => {
                AppState.setState({ projectName: e.target.value });
            }, 300));
        }

        // View tabs
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchView(tab.dataset.view));
        });

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Undo/Redo buttons
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.handleUndo());
        }
        if (redoBtn) {
            redoBtn.addEventListener('click', () => this.handleRedo());
        }

        // Save button
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }

        // Publish button
        const publishBtn = document.getElementById('publishBtn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.handlePublish());
        }

        // Add step button
        const addStepBtn = document.getElementById('addStepBtn');
        if (addStepBtn) {
            addStepBtn.addEventListener('click', () => {
                AppState.addStep();
                Toast.success('New step added');
            });
        }

        // Step navigation buttons
        const prevStepBtn = document.getElementById('prevStepBtn');
        const nextStepBtn = document.getElementById('nextStepBtn');
        
        if (prevStepBtn) {
            prevStepBtn.addEventListener('click', () => {
                const current = AppState.getState().currentStep;
                if (current > 0) {
                    AppState.setCurrentStep(current - 1);
                }
            });
        }
        
        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => {
                const state = AppState.getState();
                if (state.currentStep < state.steps.length - 1) {
                    AppState.setCurrentStep(state.currentStep + 1);
                }
            });
        }

        // Code panel
        this.setupCodePanel();

        // Update undo/redo button states on state change
        AppState.subscribe(() => {
            if (undoBtn) undoBtn.disabled = !AppState.canUndo();
            if (redoBtn) redoBtn.disabled = !AppState.canRedo();
        });

        // Sidebar toggle (for mobile)
        const toggleSidebar = document.getElementById('toggleSidebar');
        if (toggleSidebar) {
            toggleSidebar.addEventListener('click', () => {
                document.getElementById('elementSidebar')?.classList.toggle('open');
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('elementSidebar');
            const toggleBtn = document.getElementById('toggleSidebar');
            if (sidebar && !sidebar.contains(e.target) && !toggleBtn?.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    },

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Check for modifier keys
            const ctrlOrCmd = e.ctrlKey || e.metaKey;

            // Undo: Ctrl/Cmd + Z
            if (ctrlOrCmd && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.handleUndo();
            }

            // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
            if (ctrlOrCmd && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.handleRedo();
            }

            // Save: Ctrl/Cmd + S
            if (ctrlOrCmd && e.key === 's') {
                e.preventDefault();
                this.handleSave();
            }

            // Delete selected element: Delete or Backspace
            if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.matches('input, textarea, [contenteditable]')) {
                const selected = AppState.getSelectedElement();
                if (selected && selected.id && !['header', 'title', 'description'].includes(selected.id)) {
                    e.preventDefault();
                    Canvas.handleDelete(selected.id);
                }
            }

            // Deselect: Escape
            if (e.key === 'Escape') {
                AppState.selectElement(null);
                Properties.showPageSettings();
                Canvas.render();
            }

            // Preview: Ctrl/Cmd + P
            if (ctrlOrCmd && e.key === 'p') {
                e.preventDefault();
                this.switchView('preview');
            }
        });
    },

    /**
     * Initialize theme
     */
    initTheme() {
        const savedTheme = AppState.getPath('settings.theme', 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
    },

    /**
     * Toggle theme
     */
    toggleTheme() {
        AppState.toggleTheme();
        Toast.info(`Switched to ${AppState.getPath('settings.theme')} mode`);
    },

    /**
     * Switch view (builder, preview, code)
     * @param {string} view - View name
     */
    switchView(view) {
        // Update tab states
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        // Handle view changes
        const previewPanel = document.getElementById('previewPanel');
        const codePanel = document.getElementById('codePanel');
        const builderArea = document.getElementById('builderArea');
        const elementSidebar = document.getElementById('elementSidebar');
        const propertiesPanel = document.getElementById('propertiesPanel');

        switch (view) {
            case 'preview':
                if (previewPanel) previewPanel.style.display = 'flex';
                if (codePanel) codePanel.style.display = 'none';
                Preview.render();
                break;

            case 'code':
                if (previewPanel) previewPanel.style.display = 'none';
                if (codePanel) codePanel.style.display = 'flex';
                this.updateCodePanel('html');
                break;

            case 'builder':
            default:
                if (previewPanel) previewPanel.style.display = 'none';
                if (codePanel) codePanel.style.display = 'none';
                break;
        }

        AppState.setState({ currentView: view }, false);
    },

    /**
     * Setup code panel
     */
    setupCodePanel() {
        // Code tabs
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.updateCodePanel(tab.dataset.code);
            });
        });

        // Copy button
        const copyBtn = document.getElementById('copyCodeBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const codeContent = document.getElementById('codeContent');
                if (codeContent) {
                    await Helpers.copyToClipboard(codeContent.textContent);
                    Toast.success('Code copied to clipboard');
                }
            });
        }

        // Download ZIP button
        const downloadBtn = document.getElementById('downloadZipBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.handleDownloadZip());
        }

        // Close code panel
        const closeBtn = document.getElementById('closeCodePanel');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.switchView('builder'));
        }
    },

    /**
     * Update code panel content
     * @param {string} type - Code type (html, css, js, json)
     */
    updateCodePanel(type) {
        const codeContent = document.getElementById('codeContent');
        if (!codeContent) return;

        const state = AppState.getState();
        let code = '';

        switch (type) {
            case 'html':
                code = ExportUtils.generateHTML(state);
                break;
            case 'css':
                code = ExportUtils.generateCSS(state);
                break;
            case 'js':
                code = ExportUtils.generateJS(state);
                break;
            case 'json':
                code = JSON.stringify(ExportUtils.generateJSONSchema(state), null, 2);
                break;
        }

        codeContent.textContent = code;
    },

    /**
     * Handle undo
     */
    handleUndo() {
        if (AppState.undo()) {
            Canvas.render();
            Toast.info('Undo');
        }
    },

    /**
     * Handle redo
     */
    handleRedo() {
        if (AppState.redo()) {
            Canvas.render();
            Toast.info('Redo');
        }
    },

    /**
     * Handle save
     */
    handleSave() {
        AppState.persistState();
        Toast.success('Project saved', 'Your changes have been saved locally');
    },

    /**
     * Handle publish
     */
    async handlePublish() {
        const action = await Modal.showPublishModal();
        
        if (!action) return;

        const state = AppState.getState();

        switch (action) {
            case 'download':
                this.handleDownloadZip();
                break;

            case 'copy':
                const html = ExportUtils.generateHTML(state);
                await Helpers.copyToClipboard(html);
                Toast.success('HTML copied to clipboard');
                break;

            case 'json':
                const json = JSON.stringify(ExportUtils.generateJSONSchema(state), null, 2);
                Helpers.downloadFile(json, `${Helpers.slugify(state.projectName)}-schema.json`, 'application/json');
                Toast.success('JSON schema downloaded');
                break;

            case 'preview':
                this.switchView('preview');
                break;
        }
    },

    /**
     * Handle download ZIP
     */
    async handleDownloadZip() {
        const state = AppState.getState();
        const projectSlug = Helpers.slugify(state.projectName) || 'landing-page';

        try {
            // For a full ZIP, we'd use JSZip library
            // For now, download as single HTML file
            const html = ExportUtils.generateHTML(state);
            Helpers.downloadFile(html, `${projectSlug}.html`, 'text/html');
            
            // Also download JSON schema
            const json = JSON.stringify(ExportUtils.generateJSONSchema(state), null, 2);
            setTimeout(() => {
                Helpers.downloadFile(json, `${projectSlug}-schema.json`, 'application/json');
            }, 500);

            Toast.success('Files downloaded', 'HTML and JSON files have been downloaded');
        } catch (error) {
            console.error('Download error:', error);
            Toast.error('Failed to download files');
        }
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Export for global access
window.App = App;

/**
 * ================================================
 * ARCHITECTURE DOCUMENTATION
 * ================================================
 * 
 * 1. COMPONENT STRUCTURE
 * ----------------------
 * The application follows a modular component-based architecture:
 * 
 * - App (js/app.js): Main application controller
 *   - Initializes all components
 *   - Manages global event listeners
 *   - Handles keyboard shortcuts
 *   - Manages view switching
 * 
 * - AppState (js/state.js): Centralized state management
 *   - Single source of truth for all app data
 *   - Undo/redo functionality with history stack
 *   - Persistence to localStorage
 *   - Subscriber pattern for reactive updates
 * 
 * - Canvas (js/components/canvas.js): Main builder canvas
 *   - Renders form fields and header elements
 *   - Handles element selection
 *   - Updates based on state changes
 * 
 * - Properties (js/components/properties.js): Properties panel
 *   - Shows settings for selected element
 *   - Field-specific property editors
 *   - Validation rules configuration
 *   - Conditional logic setup
 * 
 * - Preview (js/components/preview.js): Live preview
 *   - Real-time preview in iframe
 *   - Responsive device switching
 *   - Complete form simulation
 * 
 * - DragDrop (js/components/dragdrop.js): Drag and drop
 *   - Element drag from sidebar
 *   - Field reordering within canvas
 *   - Visual drop indicators
 * 
 * - Toast (js/components/toast.js): Notifications
 *   - Success, error, warning, info toasts
 *   - Auto-dismiss with queue management
 * 
 * - Modal (js/components/modal.js): Modal dialogs
 *   - Confirmation dialogs
 *   - Prompt dialogs
 *   - Custom content modals
 * 
 * 2. EVENT LISTENERS
 * ------------------
 * Events are managed at multiple levels:
 * 
 * - Global: Keyboard shortcuts, theme toggle, save/publish
 * - Component: Each component manages its own events
 * - State: Subscriber pattern for reactive updates
 * 
 * 3. STATE MANAGEMENT
 * -------------------
 * AppState provides:
 * 
 * - getState(): Get current state
 * - setState(updates): Update state with history
 * - setPath(path, value): Update nested property
 * - subscribe(fn): Subscribe to state changes
 * - undo()/redo(): History navigation
 * 
 * State structure:
 * {
 *   projectName: string,
 *   currentStep: number,
 *   selectedElement: string|null,
 *   header: { image, title, description },
 *   steps: [{ id, name, fields: [] }],
 *   settings: { webhookUrl, submitButtonText, ... }
 * }
 * 
 * 4. CONDITIONAL LOGIC
 * --------------------
 * Each field can have conditional logic:
 * {
 *   enabled: boolean,
 *   field: string (field ID to check),
 *   operator: 'equals'|'not_equals'|'contains'|...,
 *   value: string (value to compare)
 * }
 * 
 * Evaluation happens in:
 * - Canvas render (builder view)
 * - Preview render (preview mode)
 * - Validation (skip hidden fields)
 * - Export (include in generated JS)
 * 
 * 5. VALIDATION IMPLEMENTATION
 * ----------------------------
 * Validation module provides:
 * 
 * - validateField(value, rules): Single field validation
 * - validateForm(values, fields): Full form validation
 * - validateFile(file, rules): File validation
 * 
 * Validation rules:
 * - required: Boolean
 * - type: 'email', 'mobile', 'url'
 * - minLength/maxLength: Number
 * - pattern: RegExp string
 * - custom error messages
 * 
 * Mobile validation: /^[0-9]{10}$/ (exactly 10 digits)
 * Email validation: Standard email regex
 * 
 * 6. PREVIEW AUTO-UPDATES
 * -----------------------
 * Preview subscribes to AppState changes:
 * 
 * AppState.subscribe(() => {
 *   if (Preview.isVisible()) {
 *     Preview.render();
 *   }
 * });
 * 
 * Each state change triggers re-render of preview iframe
 * with complete HTML/CSS/JS regeneration.
 * 
 * 7. WEBHOOK TRIGGER
 * ------------------
 * On form submission:
 * 
 * 1. Collect all form data
 * 2. Add metadata (timestamp, pageUrl, userAgent)
 * 3. POST to webhook URL as JSON
 * 4. Show success/error message
 * 
 * Payload structure:
 * {
 *   formData: { field_id: value, ... },
 *   metadata: {
 *     timestamp: ISO string,
 *     pageUrl: string,
 *     userAgent: string,
 *     totalSteps: number
 *   }
 * }
 * 
 * ================================================
 */
