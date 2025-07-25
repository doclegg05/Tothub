/**
 * State-specific ratio calculations and compliance utilities
 * Integrates with the comprehensive state compliance data
 */

import { 
  STATE_COMPLIANCE_RATIOS, 
  parseRatio, 
  calculateRequiredTeachers, 
  validateStaffing,
  type StateRatioData 
} from "@shared/stateComplianceData";

// Age group mapping for consistent calculations
export const AGE_GROUP_MAPPING = {
  "Infant": "Infants (0-12 months)",
  "Young Toddler": "Toddlers (13-24 months)", 
  "Toddler": "2-3 years",
  "Preschool": "3-4 years",
  "Pre-K": "4-5 years",
  "School Age": "School-age (6+)",
  "Older School Age": "School-age (6+)"
} as const;

/**
 * Calculate staff requirements based on current state settings
 */
export function calculateStateRequirements(
  childrenByRoom: { [room: string]: { [ageGroup: string]: number } },
  currentStaff: { [room: string]: number },
  selectedState: string
): {
  isCompliant: boolean;
  violations: string[];
  recommendations: string[];
  totalRequired: number;
  byRoom: { [room: string]: { required: number; current: number; deficit: number } };
} {
  const violations: string[] = [];
  const recommendations: string[] = [];
  const byRoom: { [room: string]: { required: number; current: number; deficit: number } } = {};
  let totalRequired = 0;

  Object.entries(childrenByRoom).forEach(([room, ageGroups]) => {
    let roomRequired = 0;
    const roomCurrent = currentStaff[room] || 0;

    Object.entries(ageGroups).forEach(([ageGroup, count]) => {
      if (count > 0) {
        // Map age group to state compliance format
        const mappedAgeGroup = AGE_GROUP_MAPPING[ageGroup as keyof typeof AGE_GROUP_MAPPING] || ageGroup;
        const calc = calculateRequiredTeachers(count, mappedAgeGroup as keyof StateRatioData, selectedState);
        roomRequired += calc.required;
      }
    });

    byRoom[room] = {
      required: roomRequired,
      current: roomCurrent,
      deficit: Math.max(0, roomRequired - roomCurrent)
    };

    totalRequired += roomRequired;

    if (roomRequired > roomCurrent) {
      violations.push(
        `${room}: Need ${roomRequired} teachers, currently have ${roomCurrent} (deficit: ${roomRequired - roomCurrent})`
      );
      recommendations.push(
        `Assign ${roomRequired - roomCurrent} more teacher${roomRequired - roomCurrent > 1 ? 's' : ''} to ${room}`
      );
    }
  });

  return {
    isCompliant: violations.length === 0,
    violations,
    recommendations,
    totalRequired,
    byRoom
  };
}

/**
 * Get state-specific ratio display information
 */
export function getStateRatioInfo(state: string): {
  ratios: StateRatioData | null;
  displayName: string;
  notes?: string;
} {
  const ratios = STATE_COMPLIANCE_RATIOS[state];
  return {
    ratios,
    displayName: state,
    notes: ratios?.notes
  };
}

/**
 * Compare ratio requirements between states
 */
export function compareStateRequirements(
  childrenCount: { [ageGroup: string]: number },
  currentState: string,
  newState: string
): {
  changes: string[];
  becameStricter: boolean;
  becameLenient: boolean;
  impactSummary: string;
} {
  const changes: string[] = [];
  let stricterCount = 0;
  let lenientCount = 0;

  Object.entries(childrenCount).forEach(([ageGroup, count]) => {
    if (count > 0) {
      const mappedAgeGroup = AGE_GROUP_MAPPING[ageGroup as keyof typeof AGE_GROUP_MAPPING] || ageGroup;
      const currentCalc = calculateRequiredTeachers(count, mappedAgeGroup as keyof StateRatioData, currentState);
      const newCalc = calculateRequiredTeachers(count, mappedAgeGroup as keyof StateRatioData, newState);

      if (currentCalc.required !== newCalc.required) {
        if (newCalc.required > currentCalc.required) {
          changes.push(
            `${ageGroup}: ${currentCalc.ratio} → ${newCalc.ratio} (need ${newCalc.required - currentCalc.required} more teacher${newCalc.required - currentCalc.required > 1 ? 's' : ''})`
          );
          stricterCount++;
        } else {
          changes.push(
            `${ageGroup}: ${currentCalc.ratio} → ${newCalc.ratio} (${currentCalc.required - newCalc.required} fewer teacher${currentCalc.required - newCalc.required > 1 ? 's' : ''} needed)`
          );
          lenientCount++;
        }
      }
    }
  });

  let impactSummary = "No significant changes in staff requirements.";
  if (stricterCount > 0 && lenientCount === 0) {
    impactSummary = `${newState} has stricter requirements - you may need to hire additional staff.`;
  } else if (lenientCount > 0 && stricterCount === 0) {
    impactSummary = `${newState} has more lenient requirements - no additional staff needed.`;
  } else if (stricterCount > 0 && lenientCount > 0) {
    impactSummary = `${newState} has mixed requirements - some age groups need more staff, others need less.`;
  }

  return {
    changes,
    becameStricter: stricterCount > lenientCount,
    becameLenient: lenientCount > stricterCount,
    impactSummary
  };
}

/**
 * Generate compliance alert message for state-specific violations
 */
export function generateComplianceAlert(
  violations: string[],
  state: string
): {
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  actionItems: string[];
} {
  const severity = violations.length > 2 ? "high" : violations.length > 0 ? "medium" : "low";
  
  return {
    title: `${state} Compliance Alert`,
    message: `Based on ${state} licensing requirements, ${violations.length} staffing violation${violations.length > 1 ? 's' : ''} detected.`,
    severity,
    actionItems: violations.slice(0, 3) // Show top 3 violations
  };
}

/**
 * Calculate mixed-age group requirements (use strictest ratio)
 */
export function calculateMixedAgeRequirements(
  childrenAges: number[], // Ages in months
  state: string
): {
  required: number;
  appliedRatio: string;
  ageGroupUsed: string;
} {
  // Find youngest child to determine strictest ratio requirement
  const youngestAge = Math.min(...childrenAges);
  
  let ageGroup: keyof StateRatioData;
  if (youngestAge <= 12) {
    ageGroup = "Infants (0-12 months)";
  } else if (youngestAge <= 24) {
    ageGroup = "Toddlers (13-24 months)";
  } else if (youngestAge <= 36) {
    ageGroup = "2-3 years";
  } else if (youngestAge <= 48) {
    ageGroup = "3-4 years";
  } else if (youngestAge <= 60) {
    ageGroup = "4-5 years";
  } else {
    ageGroup = "School-age (6+)";
  }

  const calc = calculateRequiredTeachers(childrenAges.length, ageGroup, state);
  
  return {
    required: calc.required,
    appliedRatio: calc.ratio,
    ageGroupUsed: ageGroup
  };
}

export default {
  calculateStateRequirements,
  getStateRatioInfo,
  compareStateRequirements,
  generateComplianceAlert,
  calculateMixedAgeRequirements,
  AGE_GROUP_MAPPING
};