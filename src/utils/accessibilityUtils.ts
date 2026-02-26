/**
 * Accessibility Utilities
 * Provides WCAG 2.1 AAA compliant accessibility features
 */

// Keyboard Navigation Manager
export class KeyboardNavigationManager {
  private focusableElements: HTMLElement[] = [];
  private currentFocusIndex = -1;
  private containerRef: HTMLElement | null = null;

  constructor(container?: HTMLElement) {
    if (container) {
      this.setContainer(container);
    }
  }

  setContainer(container: HTMLElement): void {
    this.containerRef = container;
    this.updateFocusableElements();
  }

  private updateFocusableElements(): void {
    if (!this.containerRef) return;

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    this.focusableElements = Array.from(
      this.containerRef.querySelectorAll(selector)
    ) as HTMLElement[];
  }

  focusNext(): void {
    this.updateFocusableElements();
    if (this.focusableElements.length === 0) return;

    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusableElements[this.currentFocusIndex]?.focus();
  }

  focusPrevious(): void {
    this.updateFocusableElements();
    if (this.focusableElements.length === 0) return;

    this.currentFocusIndex =
      this.currentFocusIndex <= 0
        ? this.focusableElements.length - 1
        : this.currentFocusIndex - 1;

    this.focusableElements[this.currentFocusIndex]?.focus();
  }

  focusFirst(): void {
    this.updateFocusableElements();
    if (this.focusableElements.length === 0) return;

    this.currentFocusIndex = 0;
    this.focusableElements[0]?.focus();
  }

  focusLast(): void {
    this.updateFocusableElements();
    if (this.focusableElements.length === 0) return;

    this.currentFocusIndex = this.focusableElements.length - 1;
    this.focusableElements[this.currentFocusIndex]?.focus();
  }

  trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    this.updateFocusableElements();
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcer = document.getElementById('sr-announcer');

  if (announcer) {
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;

    // Clear after announcing
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
}

// Create screen reader announcer element
export function createScreenReaderAnnouncer(): HTMLDivElement {
  let announcer = document.getElementById('sr-announcer') as HTMLDivElement;

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(announcer);
  }

  return announcer;
}

// High Contrast Mode Detection
export function isHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Windows High Contrast mode
  const test = document.createElement('div');
  test.style.cssText = `
    background-color: rgb(0, 255, 0);
    position: absolute;
    top: -9999px;
  `;
  document.body.appendChild(test);

  const computedColor = window.getComputedStyle(test).backgroundColor;
  document.body.removeChild(test);

  return computedColor !== 'rgb(0, 255, 0)';
}

// Color Contrast Checker (WCAG AAA = 7:1, AA = 4.5:1)
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map((val) => {
      const channel = parseInt(val) / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAGAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

// Skip Links Navigation
export function createSkipLinks(): HTMLDivElement {
  const skipLinks = document.createElement('div');
  skipLinks.className = 'skip-links';

  // Create skip links using DOM methods instead of innerHTML for security best practices
  const links = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#code-editor', text: 'Skip to code editor' },
    { href: '#navigation', text: 'Skip to navigation' },
  ];

  links.forEach(({ href, text }) => {
    const link = document.createElement('a');
    link.href = href;
    link.className = 'skip-link';
    link.textContent = text;
    skipLinks.appendChild(link);
  });

  // Styling for skip links (visible on focus)
  const style = document.createElement('style');
  style.textContent = `
    .skip-links {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 9999;
    }

    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: #fff;
      padding: 8px 16px;
      text-decoration: none;
      font-weight: bold;
      transition: top 0.2s;
    }

    .skip-link:focus {
      top: 0;
    }
  `;

  document.head.appendChild(style);
  return skipLinks;
}

// Reduced Motion Detection
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Focus Management
export function saveFocus(): HTMLElement | null {
  return document.activeElement as HTMLElement;
}

export function restoreFocus(element: HTMLElement | null): void {
  if (element && typeof element.focus === 'function') {
    element.focus();
  }
}

// ARIA Live Region Helpers
export function createLiveRegion(
  id: string,
  ariaLive: 'polite' | 'assertive' = 'polite',
  ariaAtomic: boolean = true
): HTMLDivElement {
  let region = document.getElementById(id) as HTMLDivElement;

  if (!region) {
    region = document.createElement('div');
    region.id = id;
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', ariaLive);
    region.setAttribute('aria-atomic', ariaAtomic.toString());
    region.className = 'sr-only';
    region.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(region);
  }

  return region;
}

// Accessible Modal Manager
export class AccessibleModal {
  private previousFocus: HTMLElement | null = null;
  private modalElement: HTMLElement | null = null;
  private keyboardNav: KeyboardNavigationManager;

  constructor(modalElement: HTMLElement) {
    this.modalElement = modalElement;
    this.keyboardNav = new KeyboardNavigationManager(modalElement);
  }

  open(): void {
    if (!this.modalElement) return;

    // Save current focus
    this.previousFocus = document.activeElement as HTMLElement;

    // Set ARIA attributes
    this.modalElement.setAttribute('role', 'dialog');
    this.modalElement.setAttribute('aria-modal', 'true');

    // Focus first element in modal
    this.keyboardNav.focusFirst();

    // Add keyboard event listener
    this.modalElement.addEventListener('keydown', this.handleKeyDown);

    // Announce modal opened
    announceToScreenReader('Modal opened', 'assertive');
  }

  close(): void {
    if (!this.modalElement) return;

    // Remove event listener
    this.modalElement.removeEventListener('keydown', this.handleKeyDown);

    // Restore focus
    if (this.previousFocus) {
      this.previousFocus.focus();
    }

    // Announce modal closed
    announceToScreenReader('Modal closed', 'assertive');
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Tab') {
      this.keyboardNav.trapFocus(event);
    }
  };
}

// Text Alternatives for Images
export function ensureImageAlts(): void {
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    if (!img.alt && !img.getAttribute('role')) {
      console.warn('Image missing alt text:', img.src);
      img.setAttribute('alt', 'Decorative image');
    }
  });
}

// Heading Hierarchy Checker
export function validateHeadingHierarchy(): { valid: boolean; issues: string[] } {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const issues: string[] = [];
  let previousLevel = 0;

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));

    if (index === 0 && level !== 1) {
      issues.push('Page should start with an h1 heading');
    }

    if (level - previousLevel > 1) {
      issues.push(`Heading level jumped from h${previousLevel} to h${level}`);
    }

    previousLevel = level;
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

// Initialize accessibility features
export function initializeAccessibility(): void {
  if (typeof window === 'undefined') return;

  // Create screen reader announcer
  createScreenReaderAnnouncer();

  // Create skip links
  const skipLinks = createSkipLinks();
  document.body.insertBefore(skipLinks, document.body.firstChild);

  // Check for high contrast mode
  if (isHighContrastMode()) {
    document.body.classList.add('high-contrast');
  }

  // Add reduced motion class if preferred
  if (prefersReducedMotion()) {
    document.body.classList.add('reduce-motion');
  }

  // Validate images
  ensureImageAlts();

  console.log('Accessibility features initialized');
}
