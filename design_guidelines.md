# Design Guidelines: Influencer Content SwaG - AI Content Studio

## Design Approach
**System**: Linear + Notion Hybrid Productivity Design
**Rationale**: Content creation IDE requires clean, distraction-free workspace with clear information hierarchy and efficient workflow progression. Linear's precision combined with Notion's content organization creates optimal creative productivity environment.

## Typography System

**Primary Font**: Inter (Google Fonts)
- Headings: 700 weight, tight tracking (-0.02em)
- Body: 400 weight, relaxed line-height (1.6)
- UI Elements: 500 weight, normal tracking

**Hierarchy**:
- Page Titles: text-4xl (36px)
- Section Headers: text-2xl (24px)
- Card Titles: text-lg (18px)
- Body Text: text-base (16px)
- UI Labels: text-sm (14px)
- Meta Info: text-xs (12px)

## Layout System

**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6, p-8
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Page margins: px-6 md:px-8

**Grid Structure**:
- Main workspace: max-w-7xl mx-auto
- Two-column layouts: grid grid-cols-1 lg:grid-cols-2 gap-8
- Content cards: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header with app branding (left), main navigation links (center), user profile + credits display (right)
- Height: h-16
- Padding: px-6
- Border: border-b

### Workflow Steps Component
**Multi-step Form Interface**:
- Vertical step indicator (left sidebar on desktop, top on mobile)
- Active step highlighted, completed steps with checkmarks
- Step numbers in circles, connecting vertical lines
- Main content area with generous padding (p-8)

### Input Components

**Form Fields**:
- Text inputs: rounded-lg, p-4, border, focus:ring-2
- Textareas: min-h-32, same styling as inputs
- Select dropdowns: Custom styled with chevron icons
- Radio cards: Large clickable cards with border, p-6, hover states

**Product Definition Section**:
- Two-column grid: Product details (left) + Campaign objectives (right)
- Input groups with clear labels above fields (mb-2)

**Style Archetype Selector**:
- Grid of 6-8 archetype cards (grid-cols-2 md:grid-cols-3 lg:grid-cols-4)
- Each card: Icon/emoji at top, bold title, description text
- Selected state: border-2, scale-102 transform

### Content Display Components

**Generated Ideas Grid**:
- Masonry-style card layout for varied content heights
- Each card contains: Category tag (top-left badge), idea title, hook preview, funnel stage indicator, action buttons (bottom)
- Card padding: p-6
- Hover: Subtle lift effect (shadow-lg)

**Script Display Card**:
- Timeline-based layout with time codes (left margin)
- Scene descriptions with visual/audio/text annotations
- Collapsible sections for each script segment
- Copy button (top-right)

**Hashtag Strategy Component**:
- Four columns: Branded | Broad Reach | Niche Specific | Context
- Pills/badges for each hashtag with copy functionality
- Grouped by category with counts

### Sidebar Components

**Left Panel - Navigation/Context**:
- Width: w-64 (desktop), hidden on mobile (toggle drawer)
- Navigation items with icons (left) + labels (right)
- Active state indication
- Project switcher at top

**Right Panel - AI Assistant/Help**:
- Width: w-80 (collapsible)
- Chat-style interface for AI suggestions
- Contextual tips based on current step
- Trend insights panel

### Action Components

**Primary CTA Buttons**:
- Rounded-lg, px-6, py-3
- Text: font-semibold, text-base
- Full width on mobile, auto width on desktop

**Secondary Buttons**:
- Border variant, same size as primary
- Used for "Save Draft", "Export", "Preview"

**Icon Buttons**:
- Square (h-10 w-10), rounded-lg
- Used for copy, edit, delete, expand actions

### Data Visualization

**Performance Prediction Cards**:
- Metric cards in row: grid grid-cols-2 md:grid-cols-4 gap-4
- Large number (text-3xl, font-bold) + label + trend indicator
- Mini sparkline or progress bar where applicable

**Content Calendar View**:
- Week/month grid layout
- Content cards draggable within calendar cells
- Status indicators (Draft, Scheduled, Published)

### Modal/Overlay Components

**Content Package Export**:
- Full-screen overlay with structured sections
- Download options: PDF, JSON, Markdown
- Preview pane (left) + export options (right)

**Trend Analysis Modal**:
- Two-column: Trending formats (left) + Recommendations (right)
- Updated timestamp, refresh button

## Page Layouts

### Dashboard/Home
- Stats overview cards (top row, 4 columns)
- Recent projects grid (middle)
- Quick start actions (bottom)

### Content Studio Workspace
- Three-panel layout: Sidebar (left) | Main workspace (center) | Context panel (right, collapsible)
- Main area contains step-by-step workflow
- Bottom bar: Save draft, Continue to next step

### Content Package View
- Single column, max-w-4xl
- Sections stack vertically: Strategy → Ideas → Scripts → Hashtags → Performance
- Each section collapsible with expand/collapse controls
- Sticky header with export/share actions

## Animations
**Minimal, Purposeful Only**:
- Page transitions: Simple fade (150ms)
- Card interactions: Hover lift (100ms)
- Form validation: Shake animation for errors
- Step progression: Slide transition between workflow steps
- NO complex scroll animations or decorative effects

## Icons
**Library**: Heroicons (CDN)
- Outline style for navigation and secondary actions
- Solid style for active states and primary actions
- Size: h-5 w-5 for inline, h-6 w-6 for standalone

## Images
**No Hero Image Required** - This is a productivity tool, not a marketing page

**Placeholder Images Needed**:
- Empty state illustrations for "No projects yet" (centered, max-w-md)
- Content preview thumbnails in generated scripts (16:9 ratio, rounded-lg)
- Small avatar placeholders for user profiles (h-10 w-10, rounded-full)

All images should be crisp, modern illustrations or product screenshots, not stock photography.