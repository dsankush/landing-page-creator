/**
 * ================================================
 * LANDCRAFT - Toast Notification Component
 * User-friendly notification system
 * ================================================
 */

const Toast = {
    container: null,
    queue: [],
    activeToasts: new Map(),
    maxToasts: 5,
    defaultDuration: 4000,

    /**
     * Initialize toast container
     */
    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    /**
     * Show a toast notification
     * @param {Object} options - Toast options
     * @returns {string} Toast ID
     */
    show(options) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = this.defaultDuration,
            closable = true,
            icon = null
        } = options;

        const id = Helpers.generateId('toast');
        
        // If too many toasts, queue it
        if (this.activeToasts.size >= this.maxToasts) {
            this.queue.push({ id, options });
            return id;
        }

        this.createToast(id, { type, title, message, duration, closable, icon });
        return id;
    },

    /**
     * Create and display a toast
     * @param {string} id - Toast ID
     * @param {Object} options - Toast options
     */
    createToast(id, options) {
        const { type, title, message, duration, closable, icon } = options;

        const toast = document.createElement('div');
        toast.id = id;
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icon || iconMap[type] || 'ℹ'}</span>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${Helpers.sanitizeHTML(title)}</div>` : ''}
                ${message ? `<div class="toast-message">${Helpers.sanitizeHTML(message)}</div>` : ''}
            </div>
            ${closable ? `
                <button class="toast-close" aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            ` : ''}
        `;

        // Add close handler
        if (closable) {
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.dismiss(id));
        }

        // Add to container
        this.container.appendChild(toast);
        this.activeToasts.set(id, toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => this.dismiss(id), duration);
        }
    },

    /**
     * Dismiss a toast
     * @param {string} id - Toast ID
     */
    dismiss(id) {
        const toast = this.activeToasts.get(id);
        if (!toast) return;

        toast.classList.remove('show');
        
        // Remove after animation
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            this.activeToasts.delete(id);

            // Process queue
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                this.createToast(next.id, next.options);
            }
        }, 300);
    },

    /**
     * Dismiss all toasts
     */
    dismissAll() {
        this.activeToasts.forEach((_, id) => this.dismiss(id));
        this.queue = [];
    },

    /**
     * Show success toast
     * @param {string} message - Message
     * @param {string} title - Title (optional)
     */
    success(message, title = 'Success') {
        return this.show({ type: 'success', title, message });
    },

    /**
     * Show error toast
     * @param {string} message - Message
     * @param {string} title - Title (optional)
     */
    error(message, title = 'Error') {
        return this.show({ type: 'error', title, message, duration: 6000 });
    },

    /**
     * Show warning toast
     * @param {string} message - Message
     * @param {string} title - Title (optional)
     */
    warning(message, title = 'Warning') {
        return this.show({ type: 'warning', title, message });
    },

    /**
     * Show info toast
     * @param {string} message - Message
     * @param {string} title - Title (optional)
     */
    info(message, title = '') {
        return this.show({ type: 'info', title, message });
    }
};

// Export for use in other modules
window.Toast = Toast;
