/**
 * Comprehensive U.S. State Compliance Data for Daycare Management
 * Based on 2025 state licensing requirements for child-to-staff ratios
 * Source: State licensing agencies and World Population Review data
 */

export interface StateRatioData {
  "Infants (0-12 months)": string;
  "Toddlers (13-24 months)": string;
  "2-3 years": string;
  "3-4 years": string;
  "4-5 years": string;
  "School-age (6+)": string;
  maxGroupSize?: {
    [ageGroup: string]: number;
  };
  notes?: string;
}

export interface StateComplianceData {
  [state: string]: StateRatioData;
}

// Comprehensive state-by-state child-to-staff ratios for licensed daycare centers
export const STATE_COMPLIANCE_RATIOS: StateComplianceData = {
  "Alabama": {
    "Infants (0-12 months)": "5:1",
    "Toddlers (13-24 months)": "7:1", 
    "2-3 years": "8:1",
    "3-4 years": "8:1",
    "4-5 years": "18:1",
    "School-age (6+)": "22:1",
    maxGroupSize: {
      "Infants (0-12 months)": 10,
      "Toddlers (13-24 months)": 14,
      "2-3 years": 16,
      "3-4 years": 16,
      "4-5 years": 18,
      "School-age (6+)": 22
    },
    notes: "Maximum group sizes apply regardless of staff ratio"
  },
  "Alaska": {
    "Infants (0-12 months)": "5:1",
    "Toddlers (13-24 months)": "7:1",
    "2-3 years": "6:1", 
    "3-4 years": "10:1",
    "4-5 years": "10:1",
    "School-age (6+)": "18:1",
    notes: "Stricter ratios for mixed-age groups apply"
  },
  "Arizona": {
    "Infants (0-12 months)": "5:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "13:1", 
    "4-5 years": "15:1",
    "School-age (6+)": "15:1",
    maxGroupSize: {
      "Infants (0-12 months)": 10,
      "Toddlers (13-24 months)": 12,
      "2-3 years": 16,
      "3-4 years": 26,
      "4-5 years": 30,
      "School-age (6+)": 30
    }
  },
  "Arkansas": {
    "Infants (0-12 months)": "6:1",
    "Toddlers (13-24 months)": "8:1",
    "2-3 years": "10:1",
    "3-4 years": "12:1",
    "4-5 years": "15:1", 
    "School-age (6+)": "20:1"
  },
  "California": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "12:1",
    "4-5 years": "14:1",
    "School-age (6+)": "14:1",
    maxGroupSize: {
      "Infants (0-12 months)": 8,
      "Toddlers (13-24 months)": 12,
      "2-3 years": 16,
      "3-4 years": 24,
      "4-5 years": 28,
      "School-age (6+)": 28
    },
    notes: "One of the strictest ratio requirements in the U.S."
  },
  "Colorado": {
    "Infants (0-12 months)": "5:1",
    "Toddlers (13-24 months)": "7:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "15:1"
  },
  "Connecticut": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "6:1",
    "3-4 years": "10:1",
    "4-5 years": "10:1",
    "School-age (6+)": "13:1",
    notes: "Very strict infant and toddler ratios"
  },
  "Delaware": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "12:1",
    "4-5 years": "15:1",
    "School-age (6+)": "20:1"
  },
  "Florida": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "11:1",
    "3-4 years": "15:1",
    "4-5 years": "20:1",
    "School-age (6+)": "25:1",
    maxGroupSize: {
      "Infants (0-12 months)": 8,
      "Toddlers (13-24 months)": 12,
      "2-3 years": 22,
      "3-4 years": 30,
      "4-5 years": 40,
      "School-age (6+)": 50
    }
  },
  "Georgia": {
    "Infants (0-12 months)": "6:1",
    "Toddlers (13-24 months)": "8:1",
    "2-3 years": "10:1", 
    "3-4 years": "15:1",
    "4-5 years": "18:1",
    "School-age (6+)": "23:1"
  },
  "Hawaii": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "15:1"
  },
  "Idaho": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "7:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "15:1"
  },
  "Illinois": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "20:1",
    "School-age (6+)": "20:1",
    maxGroupSize: {
      "Infants (0-12 months)": 8,
      "Toddlers (13-24 months)": 10,
      "2-3 years": 16,
      "3-4 years": 20,
      "4-5 years": 20,
      "School-age (6+)": 30
    }
  },
  "Indiana": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "10:1",
    "3-4 years": "12:1",
    "4-5 years": "16:1",
    "School-age (6+)": "20:1"
  },
  "Iowa": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "12:1",
    "4-5 years": "15:1",
    "School-age (6+)": "15:1"
  },
  "Kansas": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "10:1",
    "3-4 years": "12:1",
    "4-5 years": "14:1",
    "School-age (6+)": "18:1"
  },
  "Kentucky": {
    "Infants (0-12 months)": "5:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "10:1",
    "3-4 years": "12:1",
    "4-5 years": "14:1",
    "School-age (6+)": "17:1"
  },
  "Louisiana": {
    "Infants (0-12 months)": "6:1",
    "Toddlers (13-24 months)": "8:1",
    "2-3 years": "12:1",
    "3-4 years": "14:1",
    "4-5 years": "16:1",
    "School-age (6+)": "22:1"
  },
  "Maine": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "7:1",
    "3-4 years": "10:1",
    "4-5 years": "13:1",
    "School-age (6+)": "15:1"
  },
  "Maryland": {
    "Infants (0-12 months)": "3:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "15:1",
    "School-age (6+)": "15:1",
    notes: "Strictest infant ratio in the nation"
  },
  "Massachusetts": {
    "Infants (0-12 months)": "3:1",
    "Toddlers (13-24 months)": "4:1",
    "2-3 years": "7:1",
    "3-4 years": "10:1",
    "4-5 years": "13:1",
    "School-age (6+)": "15:1",
    notes: "Very strict ratios, especially for infants and toddlers"
  },
  "Michigan": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "4:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "18:1"
  },
  "Minnesota": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "7:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "10:1",
    "School-age (6+)": "15:1"
  },
  "Mississippi": {
    "Infants (0-12 months)": "5:1",
    "Toddlers (13-24 months)": "8:1",
    "2-3 years": "12:1",
    "3-4 years": "16:1",
    "4-5 years": "20:1",
    "School-age (6+)": "23:1"
  },
  "Missouri": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "14:1",
    "School-age (6+)": "18:1"
  },
  "Montana": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "14:1"
  },
  "Nebraska": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "15:1"
  },
  "Nevada": {
    "Infants (0-12 months)": "6:1",
    "Toddlers (13-24 months)": "8:1",
    "2-3 years": "10:1",
    "3-4 years": "13:1",
    "4-5 years": "13:1",
    "School-age (6+)": "18:1"
  },
  "New Hampshire": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "7:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "15:1"
  },
  "New Jersey": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "7:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "15:1"
  },
  "New Mexico": {
    "Infants (0-12 months)": "6:1",
    "Toddlers (13-24 months)": "8:1",
    "2-3 years": "9:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "20:1"
  },
  "New York": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "7:1",
    "3-4 years": "8:1",
    "4-5 years": "9:1",
    "School-age (6+)": "10:1",
    notes: "Extremely strict ratios across all age groups"
  },
  "North Carolina": {
    "Infants (0-12 months)": "5:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "9:1",
    "3-4 years": "15:1",
    "4-5 years": "20:1",
    "School-age (6+)": "25:1"
  },
  "North Dakota": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "7:1",
    "3-4 years": "10:1",
    "4-5 years": "15:1",
    "School-age (6+)": "20:1"
  },
  "Ohio": {
    "Infants (0-12 months)": "5:1",
    "Toddlers (13-24 months)": "7:1",
    "2-3 years": "12:1",
    "3-4 years": "14:1",
    "4-5 years": "18:1",
    "School-age (6+)": "18:1"
  },
  "Oklahoma": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "12:1",
    "4-5 years": "15:1",
    "School-age (6+)": "15:1"
  },
  "Oregon": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "10:1",
    "School-age (6+)": "15:1"
  },
  "Pennsylvania": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "6:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "15:1"
  },
  "Rhode Island": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "13:1",
    "School-age (6+)": "13:1"
  },
  "South Carolina": {
    "Infants (0-12 months)": "5:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "15:1",
    "School-age (6+)": "23:1"
  },
  "South Dakota": {
    "Infants (0-12 months)": "5:1",
    "Toddlers (13-24 months)": "7:1",
    "2-3 years": "10:1",
    "3-4 years": "12:1",
    "4-5 years": "20:1",
    "School-age (6+)": "20:1"
  },
  "Tennessee": {
    "Infants (0-12 months)": "5:1",
    "Toddlers (13-24 months)": "8:1",
    "2-3 years": "10:1",
    "3-4 years": "12:1",
    "4-5 years": "15:1",
    "School-age (6+)": "20:1"
  },
  "Texas": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "9:1",
    "3-4 years": "13:1",
    "4-5 years": "15:1",
    "School-age (6+)": "26:1",
    maxGroupSize: {
      "Infants (0-12 months)": 8,
      "Toddlers (13-24 months)": 10,
      "2-3 years": 18,
      "3-4 years": 26,
      "4-5 years": 30,
      "School-age (6+)": 26
    }
  },
  "Utah": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "7:1",
    "2-3 years": "8:1",
    "3-4 years": "12:1",
    "4-5 years": "20:1",
    "School-age (6+)": "20:1"
  },
  "Vermont": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "7:1",
    "3-4 years": "10:1",
    "4-5 years": "10:1",
    "School-age (6+)": "13:1"
  },
  "Virginia": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "20:1"
  },
  "Washington": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "7:1",
    "2-3 years": "10:1",
    "3-4 years": "10:1",
    "4-5 years": "20:1",
    "School-age (6+)": "20:1"
  },
  "West Virginia": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "10:1",
    "3-4 years": "12:1",
    "4-5 years": "14:1",
    "School-age (6+)": "16:1",
    notes: "Default state - includes 75 min/week screen time limit for children under 2"
  },
  "Wisconsin": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "17:1"
  },
  "Wyoming": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "5:1",
    "2-3 years": "7:1",
    "3-4 years": "10:1",
    "4-5 years": "12:1",
    "School-age (6+)": "16:1"
  },
  // Territories and Federal District
  "District of Columbia": {
    "Infants (0-12 months)": "3:1",
    "Toddlers (13-24 months)": "4:1",
    "2-3 years": "6:1",
    "3-4 years": "8:1",
    "4-5 years": "10:1",
    "School-age (6+)": "12:1",
    notes: "Strictest ratios in the nation for most age groups"
  },
  "Puerto Rico": {
    "Infants (0-12 months)": "4:1",
    "Toddlers (13-24 months)": "6:1",
    "2-3 years": "8:1",
    "3-4 years": "10:1",
    "4-5 years": "15:1",
    "School-age (6+)": "20:1"
  }
};

// US States and Territories list for dropdown selection
export const US_STATES_LIST = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
  "Wisconsin", "Wyoming", "District of Columbia", "Puerto Rico"
].sort();

/**
 * Parse ratio string (e.g., "5:1") to return children per teacher ratio
 */
export function parseRatio(ratioString: string): number {
  const [children] = ratioString.split(":").map(n => parseInt(n.trim()));
  return children || 1;
}

/**
 * Get state-specific ratios for calculations
 */
export function getStateRatios(state: string): StateRatioData | null {
  return STATE_COMPLIANCE_RATIOS[state] || null;
}

/**
 * Calculate required teachers for a given number of children and age group
 */
export function calculateRequiredTeachers(
  childrenCount: number, 
  ageGroup: keyof StateRatioData, 
  state: string
): { required: number; ratio: string; maxAllowed: number } {
  const stateData = getStateRatios(state);
  if (!stateData || !stateData[ageGroup]) {
    // Fallback to West Virginia ratios if state not found
    const fallbackData = getStateRatios("West Virginia")!;
    const ratio = parseRatio(fallbackData[ageGroup]);
    return {
      required: Math.ceil(childrenCount / ratio),
      ratio: fallbackData[ageGroup],
      maxAllowed: ratio * 1 // One teacher
    };
  }

  const ratio = parseRatio(stateData[ageGroup]);
  const required = Math.ceil(childrenCount / ratio);
  
  return {
    required,
    ratio: stateData[ageGroup],
    maxAllowed: ratio * required
  };
}

/**
 * Validate if current staffing meets state requirements
 */
export function validateStaffing(
  childrenByAge: { [ageGroup: string]: number },
  staffCount: number,
  state: string
): {
  isCompliant: boolean;
  violations: string[];
  recommendations: string[];
  totalRequired: number;
} {
  const violations: string[] = [];
  const recommendations: string[] = [];
  let totalRequired = 0;

  Object.entries(childrenByAge).forEach(([ageGroup, count]) => {
    if (count > 0) {
      const calc = calculateRequiredTeachers(count, ageGroup as keyof StateRatioData, state);
      totalRequired += calc.required;
      
      if (calc.required > staffCount) {
        violations.push(
          `${ageGroup}: Need ${calc.required} teachers for ${count} children (${calc.ratio} ratio), currently have ${staffCount}`
        );
        recommendations.push(
          `Hire ${calc.required - staffCount} more teachers for ${ageGroup} compliance`
        );
      }
    }
  });

  return {
    isCompliant: violations.length === 0 && totalRequired <= staffCount,
    violations,
    recommendations,
    totalRequired
  };
}

export default STATE_COMPLIANCE_RATIOS;