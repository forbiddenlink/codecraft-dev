# CodeCraft: Galactic Developer - Design System and UI/UX Guidelines

## 1. Brand Identity

### Core Brand Values

- **Educational**: Empowering through knowledge
- **Engaging**: Captivating gameplay that motivates learning
- **Accessible**: Welcoming to all skill levels
- **Innovative**: Creative approach to coding education
- **Community-focused**: Supportive environment for growth

### Brand Voice

- Friendly and encouraging
- Clear and straightforward
- Occasionally playful but never condescending
- Technical when necessary, but always explained
- Inspiring and motivational

### Logo and Wordmark

- **Primary Logo**: CodeCraft icon with stylized code brackets and space elements
- **Wordmark**: "CodeCraft: Galactic Developer" in custom space-inspired typography
- **Usage**: Maintain clear space equal to 1/4 of the logo height on all sides
- **Minimum Size**: 40px height for digital applications

## 2. Color Palette

### Primary Colors

| Color Name     | Hex Code | RGB           | Usage               |
|---------------|----------|---------------|---------------------|
| Space Black   | #0A0E17  | 10, 14, 23    | Primary background  |
| Cosmic Blue   | #1E3A8A  | 30, 58, 138   | Primary accent      |
| Stellar White | #F8FAFC  | 248, 250, 252 | Primary text        |
| Energy Yellow | #FBBF24  | 251, 191, 36  | Highlights and energy|

### Secondary Colors

| Color Name     | Hex Code | RGB           | Usage               |
|---------------|----------|---------------|---------------------|
| Success Green | #10B981  | 16, 185, 129  | Success states      |
| Alert Red     | #EF4444  | 239, 68, 68   | Error states        |
| Info Blue     | #3B82F6  | 59, 130, 246  | Information         |
| Warning Amber | #F59E0B  | 245, 158, 11  | Warning states      |

## 3. Typography

### Primary Font

- **Font Family**: Space Grotesk
- **Weights**: 
  - Light (300)
  - Regular (400)
  - Medium (500)
  - Bold (700)

### Secondary Font

- **Font Family**: JetBrains Mono
- **Usage**: Code examples and editor
- **Weights**:
  - Regular (400)
  - Medium (500)

### Type Scale

```css
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;  /* 18px */
--font-size-xl: 1.25rem;   /* 20px */
--font-size-2xl: 1.5rem;   /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
--font-size-4xl: 2.25rem;  /* 36px */
```

## 4. Spacing System

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

## 5. UI Components

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--cosmic-blue);
  color: var(--stellar-white);
  border-radius: 0.5rem;
  padding: var(--space-2) var(--space-4);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  border: 2px solid var(--cosmic-blue);
  color: var(--cosmic-blue);
}
```

### Input Fields

```css
.input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--cosmic-blue);
  border-radius: 0.375rem;
  padding: var(--space-2);
  color: var(--stellar-white);
}
```

### Cards

```css
.card {
  background: rgba(10, 14, 23, 0.8);
  border: 1px solid var(--cosmic-blue);
  border-radius: 0.75rem;
  padding: var(--space-4);
}
```

## 6. Animation Guidelines

### Transitions

- **Duration**: 
  - Fast: 150ms
  - Normal: 300ms
  - Slow: 500ms
- **Easing**: 
  - Default: cubic-bezier(0.4, 0, 0.2, 1)
  - Bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)

### Motion Principles

1. **Responsive**: Quick feedback to user interactions
2. **Natural**: Physics-based animations
3. **Purposeful**: Enhance understanding of space and progression
4. **Smooth**: Maintain 60fps performance

## 7. Icons and Graphics

### Icon System

- **Style**: Line icons with 2px stroke
- **Corner Radius**: 2px
- **Size**: 24x24px (default)
- **Format**: SVG with currentColor

### 3D Elements

- **Style**: Low-poly with emissive highlights
- **Materials**: PBR materials with subtle reflection
- **Lighting**: Ambient space lighting with accent highlights

## 8. Accessibility Guidelines

### Color Contrast

- **Text**: Minimum contrast ratio of 4.5:1
- **Interactive Elements**: Minimum contrast ratio of 3:1
- **Large Text**: Minimum contrast ratio of 3:1

### Interactive States

- **Hover**: Scale 1.02 + brightness increase
- **Focus**: High contrast outline (2px)
- **Active**: Scale 0.98 + brightness decrease
- **Disabled**: 50% opacity + no hover effects

### Screen Readers

- Meaningful alt text for images
- ARIA labels for interactive elements
- Semantic HTML structure
- Keyboard navigation support

## 9. Responsive Design

### Breakpoints

```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;
```

### Grid System

- 12-column grid
- Responsive gutters (16px - 32px)
- Container max-width: 1440px

## 10. Code Editor Theme

### Syntax Highlighting

```css
--editor-background: var(--space-black);
--editor-foreground: var(--stellar-white);
--editor-comment: #6B7280;
--editor-string: #10B981;
--editor-number: #F59E0B;
--editor-keyword: #3B82F6;
--editor-function: #8B5CF6;
```

### Editor UI

- Minimal interface
- Line numbers in muted color
- Current line highlight
- Matching brackets highlight
- Error/warning squiggles 