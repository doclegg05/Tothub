export interface AccessibilityCompliance {
  wcagLevel: 'A' | 'AA' | 'AAA';
  compliant: boolean;
  violations: AccessibilityViolation[];
  recommendations: AccessibilityRecommendation[];
}

export interface AccessibilityViolation {
  type: 'color_contrast' | 'keyboard_navigation' | 'alt_text' | 'focus_management' | 'screen_reader' | 'motor_accessibility';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  element?: string;
  wcagCriterion: string;
}

export interface AccessibilityRecommendation {
  category: string;
  suggestion: string;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
}

export class AccessibilityService {
  // WCAG 2.1 Level AA Requirements for Daycare Management Systems
  private static readonly WCAG_REQUIREMENTS = {
    colorContrast: {
      normalText: 4.5, // 4.5:1 minimum
      largeText: 3.0,  // 3.0:1 minimum for 18pt+ or 14pt+ bold
      nonText: 3.0,    // 3.0:1 for UI components and graphics
    },
    keyboardNavigation: {
      required: true,
      focusIndicators: true,
      skipLinks: true,
      logicalTabOrder: true,
    },
    screenReader: {
      altText: true,
      headingStructure: true,
      landmarks: true,
      formLabels: true,
    },
    motorAccessibility: {
      minTouchTarget: 44, // 44x44 pixels minimum
      clickableAreaSpacing: 8, // 8px minimum between targets
      timeBasedContent: false, // No auto-advancing content
    },
  };

  // Check color contrast compliance
  static checkColorContrast(foreground: string, background: string, fontSize: number, isBold: boolean): {
    ratio: number;
    compliant: boolean;
    level: 'AA' | 'AAA' | 'fail';
  } {
    const ratio = this.calculateContrastRatio(foreground, background);
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
    
    const aaThreshold = isLargeText ? 3.0 : 4.5;
    const aaaThreshold = isLargeText ? 4.5 : 7.0;

    let level: 'AA' | 'AAA' | 'fail';
    if (ratio >= aaaThreshold) {
      level = 'AAA';
    } else if (ratio >= aaThreshold) {
      level = 'AA';
    } else {
      level = 'fail';
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      compliant: ratio >= aaThreshold,
      level,
    };
  }

  // Calculate contrast ratio between two colors
  private static calculateContrastRatio(color1: string, color2: string): number {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Get relative luminance of a color
  private static getRelativeLuminance(color: string): number {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Convert to linear RGB
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
    const rLinear = toLinear(r);
    const gLinear = toLinear(g);
    const bLinear = toLinear(b);

    // Calculate luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  // Validate keyboard navigation
  static validateKeyboardNavigation(pageStructure: any): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    // Check for skip links
    if (!pageStructure.hasSkipLinks) {
      violations.push({
        type: 'keyboard_navigation',
        severity: 'major',
        description: 'Skip navigation links missing for keyboard users',
        wcagCriterion: '2.4.1 Bypass Blocks',
      });
    }

    // Check for focus indicators
    if (!pageStructure.hasFocusIndicators) {
      violations.push({
        type: 'keyboard_navigation',
        severity: 'critical',
        description: 'Visible focus indicators missing',
        wcagCriterion: '2.4.7 Focus Visible',
      });
    }

    // Check for logical tab order
    if (!pageStructure.hasLogicalTabOrder) {
      violations.push({
        type: 'keyboard_navigation',
        severity: 'major',
        description: 'Tab order is not logical or meaningful',
        wcagCriterion: '2.4.3 Focus Order',
      });
    }

    return violations;
  }

  // Validate screen reader compatibility
  static validateScreenReader(content: any): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    // Check for alt text on images
    if (content.images) {
      content.images.forEach((img: any, index: number) => {
        if (!img.alt || img.alt.trim() === '') {
          violations.push({
            type: 'alt_text',
            severity: 'critical',
            description: `Image ${index + 1} missing alternative text`,
            element: img.src,
            wcagCriterion: '1.1.1 Non-text Content',
          });
        }
      });
    }

    // Check heading structure
    if (!content.hasProperHeadingStructure) {
      violations.push({
        type: 'screen_reader',
        severity: 'major',
        description: 'Heading structure is not hierarchical or logical',
        wcagCriterion: '1.3.1 Info and Relationships',
      });
    }

    // Check for form labels
    if (content.forms) {
      content.forms.forEach((form: any, formIndex: number) => {
        form.fields?.forEach((field: any, fieldIndex: number) => {
          if (!field.label && !field.ariaLabel) {
            violations.push({
              type: 'screen_reader',
              severity: 'critical',
              description: `Form ${formIndex + 1}, field ${fieldIndex + 1} missing label`,
              element: field.id || field.name,
              wcagCriterion: '3.3.2 Labels or Instructions',
            });
          }
        });
      });
    }

    return violations;
  }

  // Check motor accessibility compliance
  static validateMotorAccessibility(uiElements: any[]): AccessibilityViolation[] {
    const violations: AccessibilityViolation[] = [];

    uiElements.forEach((element, index) => {
      // Check minimum touch target size
      if (element.width < 44 || element.height < 44) {
        violations.push({
          type: 'motor_accessibility',
          severity: 'major',
          description: `Touch target ${index + 1} too small (${element.width}x${element.height}px, minimum 44x44px)`,
          element: element.id || element.class,
          wcagCriterion: '2.5.5 Target Size',
        });
      }

      // Check spacing between clickable elements
      if (element.nearbyElements) {
        element.nearbyElements.forEach((nearby: any) => {
          const distance = Math.sqrt(
            Math.pow(element.x - nearby.x, 2) + Math.pow(element.y - nearby.y, 2)
          );
          if (distance < 8) {
            violations.push({
              type: 'motor_accessibility',
              severity: 'minor',
              description: `Insufficient spacing between clickable elements (${distance}px, minimum 8px)`,
              wcagCriterion: '2.5.5 Target Size',
            });
          }
        });
      }
    });

    return violations;
  }

  // Generate daycare-specific accessibility recommendations
  static getDaycareAccessibilityRecommendations(): AccessibilityRecommendation[] {
    return [
      {
        category: 'Check-in Interface',
        suggestion: 'Large, high-contrast buttons for check-in/out',
        implementation: 'Use minimum 48px height buttons with 4.5:1 contrast ratio',
        priority: 'high',
      },
      {
        category: 'Emergency Procedures',
        suggestion: 'Audio alerts for emergency procedures',
        implementation: 'Implement audio cues with visual indicators for all emergency actions',
        priority: 'high',
      },
      {
        category: 'Parent Communication',
        suggestion: 'Screen reader friendly message interface',
        implementation: 'Use proper ARIA labels and semantic HTML for messaging system',
        priority: 'high',
      },
      {
        category: 'Child Profiles',
        suggestion: 'Alternative text for all child photos',
        implementation: 'Require descriptive alt text for profile photos and activity images',
        priority: 'medium',
      },
      {
        category: 'Staff Dashboard',
        suggestion: 'Keyboard navigation for all functions',
        implementation: 'Ensure all dashboard controls accessible via keyboard shortcuts',
        priority: 'high',
      },
      {
        category: 'Reporting Interface',
        suggestion: 'Table headers and data cell associations',
        implementation: 'Use proper table markup with th and scope attributes',
        priority: 'medium',
      },
      {
        category: 'Biometric Systems',
        suggestion: 'Alternative authentication methods',
        implementation: 'Provide PIN/password backup for users unable to use biometrics',
        priority: 'high',
      },
      {
        category: 'Mobile Responsiveness',
        suggestion: 'Touch-friendly interface for tablets',
        implementation: 'Optimize for one-handed operation with large touch targets',
        priority: 'medium',
      },
      {
        category: 'Color Coding',
        suggestion: 'Pattern or text alternatives to color-only information',
        implementation: 'Use icons, patterns, or text labels alongside color coding',
        priority: 'high',
      },
      {
        category: 'Time-sensitive Actions',
        suggestion: 'Extended timeouts for elderly staff',
        implementation: 'Allow customizable session timeouts with warnings',
        priority: 'low',
      },
    ];
  }

  // Perform comprehensive accessibility audit
  static performAccessibilityAudit(applicationData: any): AccessibilityCompliance {
    const violations: AccessibilityViolation[] = [];

    // Check keyboard navigation
    violations.push(...this.validateKeyboardNavigation(applicationData.pageStructure || {}));

    // Check screen reader compatibility
    violations.push(...this.validateScreenReader(applicationData.content || {}));

    // Check motor accessibility
    violations.push(...this.validateMotorAccessibility(applicationData.uiElements || []));

    // Check color contrast for common UI elements
    const commonColors = [
      { fg: '#000000', bg: '#ffffff', element: 'body text' },
      { fg: '#ffffff', bg: '#007bff', element: 'primary buttons' },
      { fg: '#ffffff', bg: '#28a745', element: 'success buttons' },
      { fg: '#ffffff', bg: '#dc3545', element: 'error messages' },
    ];

    commonColors.forEach(color => {
      const contrast = this.checkColorContrast(color.fg, color.bg, 16, false);
      if (!contrast.compliant) {
        violations.push({
          type: 'color_contrast',
          severity: 'major',
          description: `Poor contrast ratio for ${color.element}: ${contrast.ratio}:1`,
          wcagCriterion: '1.4.3 Contrast (Minimum)',
        });
      }
    });

    // Determine compliance level
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const majorViolations = violations.filter(v => v.severity === 'major');

    let wcagLevel: 'A' | 'AA' | 'AAA';
    let compliant: boolean;

    if (criticalViolations.length === 0 && majorViolations.length === 0) {
      wcagLevel = 'AAA';
      compliant = true;
    } else if (criticalViolations.length === 0) {
      wcagLevel = 'AA';
      compliant = true;
    } else {
      wcagLevel = 'A';
      compliant = false;
    }

    return {
      wcagLevel,
      compliant,
      violations,
      recommendations: this.getDaycareAccessibilityRecommendations(),
    };
  }

  // Generate accessibility testing checklist
  static generateTestingChecklist(): {
    keyboardTesting: string[];
    screenReaderTesting: string[];
    colorBlindnessTesting: string[];
    motorImpairmentTesting: string[];
  } {
    return {
      keyboardTesting: [
        'Navigate entire application using only Tab and arrow keys',
        'Verify all interactive elements are reachable',
        'Test Escape key functionality for modals and dropdowns',
        'Verify Enter and Space key activation for buttons',
        'Test skip links functionality',
        'Verify logical tab order throughout pages',
      ],
      screenReaderTesting: [
        'Test with NVDA (free screen reader)',
        'Verify all images have appropriate alt text',
        'Check heading structure is logical (h1, h2, h3, etc.)',
        'Test form labels and error messages',
        'Verify table headers and data associations',
        'Test dynamic content announcements',
      ],
      colorBlindnessTesting: [
        'Test interface with color blindness simulator',
        'Verify information is not conveyed by color alone',
        'Check sufficient contrast ratios',
        'Test error states without relying on red color',
        'Verify status indicators use text or icons',
      ],
      motorImpairmentTesting: [
        'Test with assistive technologies (switch navigation)',
        'Verify touch targets are minimum 44x44 pixels',
        'Test with one-handed operation',
        'Verify no essential features require fine motor control',
        'Test extended session timeouts',
        'Verify alternative input methods work',
      ],
    };
  }
}