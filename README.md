# 🚀 LandCraft - Landing Page Builder

A comprehensive, production-ready Landing Page Builder Tool with drag-and-drop capabilities, multi-step forms, conditional logic, and export functionality.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [User Guide](#-user-guide)
- [Architecture](#-architecture)
- [Component Structure](#-component-structure)
- [State Management](#-state-management)
- [Conditional Logic](#-conditional-logic)
- [Validation System](#-validation-system)
- [Export Options](#-export-options)
- [JSON Schema](#-json-schema)
- [Webhook Integration](#-webhook-integration)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Browser Support](#-browser-support)

## ✨ Features

### Header Section Builder
- 📸 Upload/add header images with custom height
- 📝 Rich text title with:
  - Bold, Italic, Underline formatting
  - Text alignment (left, center, right)
  - Font size and family selection
  - Color picker
- 📄 Description area with rich text editor

### Dynamic Form Field Builder
- **10 Field Types:**
  - Text input
  - Number input
  - Email input (with validation)
  - Mobile number (10-digit validation)
  - Dropdown select
  - Radio buttons
  - Checkbox group
  - Textarea
  - Date selector
  - File upload

### Field Customization
- Custom labels and placeholders
- Required/optional toggle
- Validation rules:
  - Min/max length
  - Pattern matching (regex)
  - Custom error messages
  - Type-specific validation

### Conditional Logic
- Show/hide fields based on other field values
- Operators: equals, not equals, contains, empty, not empty
- Multi-level nested branching support

### Multi-Step Form Builder
- Create unlimited steps
- Drag-and-drop step reordering
- Progress bar indicator
- Previous/Next navigation
- Step naming and management

### Webhook Support
- Configure webhook URL
- POST form data as JSON
- Include metadata (timestamp, page URL, user agent)
- Step-wise data organization

### Live Preview
- Side-by-side real-time preview
- Device responsive views (desktop, tablet, mobile)
- Auto-refresh on any change

### Export Options
- Copy complete HTML code
- Download as HTML file
- Export JSON schema
- View CSS and JavaScript separately

### UI/UX Features
- Drag-and-drop field placement
- Dark/Light mode toggle
- Responsive design
- Keyboard shortcuts
- Undo/Redo support
- Auto-save to localStorage

## 🚀 Quick Start

1. Clone or download the project
2. Open `index.html` in a modern web browser
3. Start building your landing page!

No build tools or server required - it's pure HTML, CSS, and JavaScript.

```bash
# If you have a local server
python -m http.server 8000
# or
npx serve
```

Then open `http://localhost:8000` in your browser.

## 📖 User Guide

### Creating Your First Landing Page

1. **Add Header Image** (optional)
   - Click "Header" in the left sidebar
   - Upload an image or paste a URL
   - Adjust the height as needed

2. **Edit Title**
   - Click "Title" or the title element on canvas
   - Customize text, font, size, and color
   - Apply formatting (bold, italic, underline)

3. **Add Description**
   - Click "Description"
   - Use the rich text editor to format content

4. **Add Form Fields**
   - Drag fields from sidebar to canvas, or click to add
   - Click any field to edit its properties
   - Configure labels, placeholders, and validation

5. **Set Up Conditional Logic**
   - Select a field
   - Enable conditional logic in properties
   - Choose trigger field, operator, and value

6. **Create Multi-Step Forms**
   - Click "+" button in step tabs
   - Drag fields to different steps
   - Rename steps by double-clicking

7. **Configure Webhook**
   - Click anywhere on canvas (deselect fields)
   - Enter webhook URL in settings
   - Customize success message

8. **Preview & Export**
   - Click "Preview" to test your form
   - Click "Code" to view/copy generated code
   - Click "Publish" for export options

## 🏗 Architecture

### Project Structure

```
landing-page-builder/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css          # Main styles
│   ├── themes.css          # Light/Dark theme variables
│   └── components.css      # Component-specific styles
├── js/
│   ├── app.js              # Main application controller
│   ├── state.js            # State management
│   ├── utils/
│   │   ├── helpers.js      # Utility functions
│   │   ├── validation.js   # Validation system
│   │   └── export.js       # Code generation
│   └── components/
│       ├── canvas.js       # Builder canvas
│       ├── properties.js   # Properties panel
│       ├── preview.js      # Live preview
│       ├── dragdrop.js     # Drag and drop
│       ├── toast.js        # Notifications
│       └── modal.js        # Modal dialogs
└── README.md
```

### Design Patterns

- **Modular Architecture**: Each component is self-contained
- **Observer Pattern**: State changes notify all subscribers
- **Command Pattern**: Undo/Redo with history stack
- **Factory Pattern**: Field creation with type-specific defaults

## 🧩 Component Structure

### App (app.js)
Main application controller that:
- Initializes all components
- Sets up global event listeners
- Manages keyboard shortcuts
- Handles view switching (builder/preview/code)

### AppState (state.js)
Centralized state management:
- Single source of truth
- Immutable updates with deep cloning
- History stack for undo/redo
- LocalStorage persistence
- Subscriber notification system

### Canvas (canvas.js)
Main builder canvas:
- Renders header and form fields
- Handles element selection
- Manages field actions (duplicate, delete)
- Updates step navigation

### Properties (properties.js)
Properties panel for editing:
- Header image settings
- Title formatting
- Description editing
- Field properties
- Validation rules
- Conditional logic

### Preview (preview.js)
Live preview system:
- Renders complete page in iframe
- Responsive device views
- Real-time updates
- Form simulation

### DragDrop (dragdrop.js)
Drag and drop functionality:
- Element drag from sidebar
- Field reordering
- Visual drop indicators
- Touch support

## 📦 State Management

### State Structure

```javascript
{
  projectName: "My Landing Page",
  currentStep: 0,
  selectedElement: null,
  currentView: "builder",
  
  header: {
    image: { url: null, height: 300 },
    title: {
      text: "Welcome",
      fontFamily: "Plus Jakarta Sans",
      fontSize: 32,
      color: "#1e293b",
      bold: false,
      italic: false,
      underline: false,
      align: "center"
    },
    description: {
      html: "<p>Description here</p>",
      text: "Description here",
      fontSize: 16,
      color: "#64748b"
    }
  },
  
  steps: [
    {
      id: "step_0",
      name: "Step 1",
      fields: [
        {
          id: "field_123",
          type: "text",
          label: "Your Name",
          placeholder: "Enter name",
          required: true,
          validation: { maxLength: 100 },
          conditionalLogic: { enabled: false }
        }
      ]
    }
  ],
  
  settings: {
    webhookUrl: "",
    submitButtonText: "Submit",
    successMessage: "Thank you!",
    showProgressBar: true,
    theme: "light"
  }
}
```

### State Methods

```javascript
// Get current state
const state = AppState.getState();

// Update state (triggers history save)
AppState.setState({ projectName: "New Name" });

// Update nested property
AppState.setPath("header.title.text", "New Title");

// Subscribe to changes
AppState.subscribe((newState) => {
  console.log("State changed:", newState);
});

// Undo/Redo
AppState.undo();
AppState.redo();
```

## 🔀 Conditional Logic

### Configuration

Each field can have conditional logic:

```javascript
{
  conditionalLogic: {
    enabled: true,
    field: "field_user_type",  // ID of trigger field
    operator: "equals",         // Comparison operator
    value: "farmer"            // Value to compare
  }
}
```

### Operators

| Operator | Description |
|----------|-------------|
| `equals` | Field value equals specified value |
| `not_equals` | Field value does not equal |
| `contains` | Field value contains substring |
| `not_contains` | Field value doesn't contain |
| `not_empty` | Field has any value |
| `empty` | Field is empty |
| `greater_than` | Numeric comparison |
| `less_than` | Numeric comparison |

### Example: Nested Workflows

```javascript
// Step 1: User Type selection
{
  id: "user_type",
  type: "dropdown",
  options: [
    { value: "farmer", label: "Farmer" },
    { value: "retailer", label: "Retailer" }
  ]
}

// If Farmer selected, show:
{
  id: "crop_type",
  type: "text",
  label: "What crop do you grow?",
  conditionalLogic: {
    enabled: true,
    field: "user_type",
    operator: "equals",
    value: "farmer"
  }
}

// If Retailer selected, show:
{
  id: "gst_number",
  type: "text",
  label: "GST Number",
  conditionalLogic: {
    enabled: true,
    field: "user_type",
    operator: "equals",
    value: "retailer"
  }
}
```

## ✅ Validation System

### Built-in Validators

| Type | Validation |
|------|------------|
| Email | RFC-compliant email format |
| Mobile | Exactly 10 digits |
| URL | Valid URL format |
| Required | Non-empty value |
| MinLength | Minimum character count |
| MaxLength | Maximum character count |
| Pattern | Custom regex pattern |

### Validation Rules

```javascript
{
  validation: {
    minLength: 3,
    maxLength: 100,
    pattern: "^[A-Za-z]+$",
    errorMessage: "Only letters allowed"
  }
}
```

### Mobile Validation

Mobile numbers are validated with exactly 10 digits:
```javascript
// Pattern: /^[0-9]{10}$/
// Strips non-numeric characters before validation
```

## 📤 Export Options

### 1. Complete HTML

Single file with embedded CSS and JavaScript:
- Fully functional standalone page
- All styles inline
- Form validation included
- Webhook integration ready

### 2. JSON Schema

```json
{
  "schema_version": "1.0",
  "project_name": "My Landing Page",
  "created_at": "2024-01-01T00:00:00.000Z",
  "header_image": "https://...",
  "title": { ... },
  "description": { ... },
  "steps": [
    {
      "step_index": 0,
      "step_name": "Contact Info",
      "fields": [ ... ]
    }
  ],
  "settings": { ... },
  "webhook_url": "https://..."
}
```

### 3. Separate Files

View/copy CSS and JavaScript separately in the Code panel.

## 🔗 Webhook Integration

### Request Format

```http
POST /your-webhook-endpoint
Content-Type: application/json

{
  "formData": {
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890"
  },
  "metadata": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "pageUrl": "https://your-site.com/landing",
    "userAgent": "Mozilla/5.0...",
    "totalSteps": 3
  }
}
```

### Setting Up Webhooks

1. Select page settings (click empty canvas area)
2. Enter your webhook URL
3. The form will POST data on submission

Popular webhook receivers:
- Zapier
- Make (Integromat)
- n8n
- Custom API endpoints

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + P` | Preview |
| `Delete/Backspace` | Delete selected field |
| `Escape` | Deselect element |

## 🌐 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Opera 67+

## 📝 JSON Schema Example

```json
{
  "schema_version": "1.0",
  "project_name": "Farmer Registration",
  "header_image": "https://example.com/farm.jpg",
  "header_image_height": 300,
  "title": {
    "text": "Register Your Farm",
    "font_family": "Plus Jakarta Sans",
    "font_size": 36,
    "color": "#1a1a2e",
    "bold": true,
    "italic": false,
    "underline": false,
    "align": "center"
  },
  "description": {
    "html": "<p>Join our network of farmers today!</p>",
    "text": "Join our network of farmers today!",
    "font_size": 16,
    "color": "#666666"
  },
  "steps": [
    {
      "step_index": 0,
      "step_name": "Personal Info",
      "fields": [
        {
          "id": "field_name",
          "type": "text",
          "label": "Full Name",
          "placeholder": "Enter your full name",
          "required": true,
          "validation": {
            "min_length": 2,
            "max_length": 100
          },
          "conditional_logic": {
            "enabled": false
          }
        },
        {
          "id": "field_mobile",
          "type": "mobile",
          "label": "Mobile Number",
          "placeholder": "Enter 10-digit mobile",
          "required": true,
          "validation": {
            "mobile_10_digit": true
          },
          "conditional_logic": {
            "enabled": false
          }
        }
      ]
    },
    {
      "step_index": 1,
      "step_name": "Farm Details",
      "fields": [
        {
          "id": "field_crop",
          "type": "dropdown",
          "label": "Primary Crop",
          "required": true,
          "options": [
            { "value": "wheat", "label": "Wheat" },
            { "value": "rice", "label": "Rice" },
            { "value": "corn", "label": "Corn" }
          ]
        },
        {
          "id": "field_acreage",
          "type": "number",
          "label": "Land Acreage",
          "placeholder": "Enter in acres",
          "required": true
        }
      ]
    }
  ],
  "settings": {
    "show_progress_bar": true,
    "submit_button_text": "Register",
    "success_message": "Thank you for registering!"
  },
  "webhook_url": "https://api.example.com/register"
}
```

## 📄 License

MIT License - Feel free to use in personal and commercial projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

Built with ❤️ by LandCraft
