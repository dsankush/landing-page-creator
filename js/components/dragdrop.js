/**
 * ================================================
 * LANDCRAFT - Drag and Drop Component
 * Handles all drag and drop functionality
 * ================================================
 */

const DragDrop = {
    draggingElement: null,
    draggedType: null,
    draggedIndex: null,
    dropZones: [],
    ghostElement: null,

    /**
     * Initialize drag and drop
     */
    init() {
        this.setupElementDrag();
        this.setupCanvasDrop();
        this.setupFieldReorder();
    },

    /**
     * Setup dragging from element sidebar
     */
    setupElementDrag() {
        const elementBtns = document.querySelectorAll('.element-btn[draggable="true"]');
        
        elementBtns.forEach(btn => {
            btn.addEventListener('dragstart', (e) => this.handleElementDragStart(e));
            btn.addEventListener('dragend', (e) => this.handleElementDragEnd(e));
            
            // Also support click to add
            btn.addEventListener('click', (e) => this.handleElementClick(e));
        });
    },

    /**
     * Handle element drag start
     * @param {DragEvent} e 
     */
    handleElementDragStart(e) {
        const elementType = e.target.closest('.element-btn').dataset.element;
        
        this.draggingElement = e.target;
        this.draggedType = elementType;
        
        e.target.classList.add('dragging');
        
        // Set drag data
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', elementType);
        e.dataTransfer.setData('application/x-landcraft-element', elementType);
        
        // Create ghost element
        this.createGhost(e.target);
        
        // Highlight drop zones
        this.showDropZones();
    },

    /**
     * Handle element drag end
     * @param {DragEvent} e 
     */
    handleElementDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggingElement = null;
        this.draggedType = null;
        
        this.removeGhost();
        this.hideDropZones();
    },

    /**
     * Handle element click (alternative to drag)
     * @param {Event} e 
     */
    handleElementClick(e) {
        const elementType = e.target.closest('.element-btn').dataset.element;
        
        if (elementType === 'header') {
            AppState.selectElement('header');
        } else if (elementType === 'title') {
            AppState.selectElement('title');
        } else if (elementType === 'description') {
            AppState.selectElement('description');
        } else if (elementType === 'step') {
            AppState.addStep();
            Toast.success('New step added');
        } else {
            AppState.addField(elementType);
            Toast.success(`${Helpers.capitalize(elementType)} field added`);
        }
        
        Canvas.render();
        Properties.updatePanel();
    },

    /**
     * Setup canvas as drop zone
     */
    setupCanvasDrop() {
        const canvas = document.getElementById('canvas');
        if (!canvas) return;

        canvas.addEventListener('dragover', (e) => this.handleCanvasDragOver(e));
        canvas.addEventListener('dragleave', (e) => this.handleCanvasDragLeave(e));
        canvas.addEventListener('drop', (e) => this.handleCanvasDrop(e));
    },

    /**
     * Handle drag over canvas
     * @param {DragEvent} e 
     */
    handleCanvasDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        
        const canvas = document.getElementById('canvas');
        canvas.classList.add('drag-over');
        
        // Find insertion point
        const afterElement = this.getDragAfterElement(canvas, e.clientY);
        this.updateDropIndicator(canvas, afterElement);
    },

    /**
     * Handle drag leave canvas
     * @param {DragEvent} e 
     */
    handleCanvasDragLeave(e) {
        const canvas = document.getElementById('canvas');
        
        // Check if we're leaving to a child element
        if (e.relatedTarget && canvas.contains(e.relatedTarget)) {
            return;
        }
        
        canvas.classList.remove('drag-over');
        this.removeDropIndicator();
    },

    /**
     * Handle drop on canvas
     * @param {DragEvent} e 
     */
    handleCanvasDrop(e) {
        e.preventDefault();
        
        const canvas = document.getElementById('canvas');
        canvas.classList.remove('drag-over');
        
        const elementType = e.dataTransfer.getData('application/x-landcraft-element') || 
                           e.dataTransfer.getData('text/plain');
        
        if (!elementType) return;
        
        // Find insertion index
        const afterElement = this.getDragAfterElement(canvas, e.clientY);
        let insertIndex = -1;
        
        if (afterElement) {
            const fields = AppState.getCurrentStep().fields;
            insertIndex = fields.findIndex(f => f.id === afterElement.dataset.fieldId);
        }
        
        this.removeDropIndicator();
        
        // Handle different element types
        if (elementType === 'header') {
            AppState.selectElement('header');
        } else if (elementType === 'title') {
            AppState.selectElement('title');
        } else if (elementType === 'description') {
            AppState.selectElement('description');
        } else if (elementType === 'step') {
            AppState.addStep();
            Toast.success('New step added');
        } else {
            if (insertIndex >= 0) {
                AppState.addFieldAt(elementType, insertIndex);
            } else {
                AppState.addField(elementType);
            }
            Toast.success(`${Helpers.capitalize(elementType)} field added`);
        }
        
        Canvas.render();
        Properties.updatePanel();
    },

    /**
     * Setup field reordering within canvas
     */
    setupFieldReorder() {
        // This will be called when canvas is rendered
        // to attach drag handlers to field elements
    },

    /**
     * Make a field element draggable for reordering
     * @param {HTMLElement} element 
     * @param {number} index 
     */
    makeFieldDraggable(element, index) {
        const handle = element.querySelector('.drag-handle');
        if (!handle) return;

        handle.addEventListener('mousedown', () => {
            element.setAttribute('draggable', 'true');
        });

        element.addEventListener('dragstart', (e) => {
            this.draggedIndex = index;
            element.classList.add('is-dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', index.toString());
            e.dataTransfer.setData('application/x-landcraft-reorder', index.toString());
        });

        element.addEventListener('dragend', () => {
            element.classList.remove('is-dragging');
            element.removeAttribute('draggable');
            this.draggedIndex = null;
            this.removeDropIndicator();
        });

        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            const isReorder = e.dataTransfer.types.includes('application/x-landcraft-reorder');
            if (!isReorder) return;

            e.dataTransfer.dropEffect = 'move';
            
            const rect = element.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            const insertBefore = e.clientY < midY;
            
            this.showFieldDropIndicator(element, insertBefore);
        });

        element.addEventListener('dragleave', () => {
            element.classList.remove('drag-over-top', 'drag-over-bottom');
        });

        element.addEventListener('drop', (e) => {
            e.preventDefault();
            
            const fromIndex = parseInt(e.dataTransfer.getData('application/x-landcraft-reorder'));
            if (isNaN(fromIndex)) return;
            
            const rect = element.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            let toIndex = index;
            
            if (e.clientY >= midY) {
                toIndex = index + 1;
            }
            
            // Adjust if moving down
            if (fromIndex < toIndex) {
                toIndex--;
            }
            
            if (fromIndex !== toIndex) {
                AppState.reorderFields(fromIndex, toIndex);
                Canvas.render();
                Toast.info('Field reordered');
            }
            
            element.classList.remove('drag-over-top', 'drag-over-bottom');
        });
    },

    /**
     * Show drop indicator for field reordering
     * @param {HTMLElement} element 
     * @param {boolean} insertBefore 
     */
    showFieldDropIndicator(element, insertBefore) {
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('drag-over-top', 'drag-over-bottom');
        });
        
        if (insertBefore) {
            element.classList.add('drag-over-top');
        } else {
            element.classList.add('drag-over-bottom');
        }
    },

    /**
     * Get the element after which to insert
     * @param {HTMLElement} container 
     * @param {number} y 
     * @returns {HTMLElement|null}
     */
    getDragAfterElement(container, y) {
        const elements = [...container.querySelectorAll('.canvas-element:not(.is-dragging)')];
        
        return elements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },

    /**
     * Update drop indicator position
     * @param {HTMLElement} canvas 
     * @param {HTMLElement} afterElement 
     */
    updateDropIndicator(canvas, afterElement) {
        let indicator = canvas.querySelector('.drop-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'drop-indicator';
            indicator.innerHTML = '<span>Drop here</span>';
        }
        
        if (afterElement) {
            afterElement.before(indicator);
        } else {
            canvas.appendChild(indicator);
        }
    },

    /**
     * Remove drop indicator
     */
    removeDropIndicator() {
        const indicators = document.querySelectorAll('.drop-indicator');
        indicators.forEach(i => i.remove());
        
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('drag-over-top', 'drag-over-bottom');
        });
    },

    /**
     * Create ghost element for drag preview
     * @param {HTMLElement} element 
     */
    createGhost(element) {
        this.ghostElement = element.cloneNode(true);
        this.ghostElement.className = 'drag-ghost';
        document.body.appendChild(this.ghostElement);
        
        document.addEventListener('dragover', this.updateGhostPosition);
    },

    /**
     * Update ghost position
     * @param {DragEvent} e 
     */
    updateGhostPosition(e) {
        if (DragDrop.ghostElement) {
            DragDrop.ghostElement.style.left = e.clientX + 10 + 'px';
            DragDrop.ghostElement.style.top = e.clientY + 10 + 'px';
        }
    },

    /**
     * Remove ghost element
     */
    removeGhost() {
        if (this.ghostElement) {
            this.ghostElement.remove();
            this.ghostElement = null;
        }
        document.removeEventListener('dragover', this.updateGhostPosition);
    },

    /**
     * Show drop zones
     */
    showDropZones() {
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.classList.add('drop-zone-active');
        }
    },

    /**
     * Hide drop zones
     */
    hideDropZones() {
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.classList.remove('drop-zone-active');
        }
    }
};

// Add CSS for drop indicator dynamically
const dropIndicatorStyles = document.createElement('style');
dropIndicatorStyles.textContent = `
    .drop-indicator {
        height: 48px;
        margin: 8px 0;
        background: var(--accent-bg);
        border: 2px dashed var(--accent-primary);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--accent-primary);
        font-size: 0.8rem;
        font-weight: 500;
        animation: pulse 1s ease infinite;
    }
    
    .canvas-element.drag-over-top {
        border-top: 3px solid var(--accent-primary);
        margin-top: -1px;
    }
    
    .canvas-element.drag-over-bottom {
        border-bottom: 3px solid var(--accent-primary);
        margin-bottom: -1px;
    }
    
    .drop-zone-active {
        min-height: 200px;
    }
    
    .canvas-element.is-dragging {
        opacity: 0.4;
        transform: scale(0.98);
    }
`;
document.head.appendChild(dropIndicatorStyles);

// Export for use in other modules
window.DragDrop = DragDrop;
