/**
 * Comprehensive U.S. State Compliance Data for Daycare Management
 * Based on 2025 state licensing requirements for child-to-staff ratios
 * Source: State licensing agencies and World Population Review data
 */

export interface StateQualificationRequirements {
  required: string[];
  preferred: string[];
  continuing_education: string;
  background_checks: string[];
  specialized_training: string[];
}

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
  qualifications?: StateQualificationRequirements;
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
    const ratio = parseRatio(String(fallbackData[ageGroup])); 
    return {
      required: Math.ceil(childrenCount / ratio),
      ratio: String(fallbackData[ageGroup]),
      maxAllowed: ratio * 1 // One teacher
    };
  }

  const ratio = parseRatio(String(stateData[ageGroup]));
  const required = Math.ceil(childrenCount / ratio);
  
  return {
    required,
    ratio: String(stateData[ageGroup]),
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

// Comprehensive state-specific qualification requirements for all 50 states
export const STATE_QUALIFICATION_REQUIREMENTS: { [state: string]: StateQualificationRequirements } = {
  "Alabama": {
    required: ["High school diploma", "Background check clearance", "Health examination"],
    preferred: ["CDA credential", "Early childhood education coursework"],
    continuing_education: "15 hours annually",
    background_checks: ["State criminal background", "Child abuse registry", "Reference verification"],
    specialized_training: ["CPR/First Aid", "Child abuse recognition", "Emergency procedures"]
  },
  "Alaska": {
    required: ["High school diploma", "Background check", "Medical clearance"],
    preferred: ["Early childhood education units", "Alaska CDA"],
    continuing_education: "12 hours annually",
    background_checks: ["Alaska criminal history", "National crime check", "Child protection registry"],
    specialized_training: ["CPR certification", "Mandated reporter training", "Safety protocols"]
  },
  "Arizona": {
    required: ["High school diploma", "Fingerprint clearance", "TB test"],
    preferred: ["CDA or equivalent", "6+ ECE semester hours"],
    continuing_education: "15 hours annually",
    background_checks: ["DPS fingerprint clearance", "Child abuse central registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "Emergency preparedness"]
  },
  "Arkansas": {
    required: ["High school diploma", "Background screening", "Medical examination"],
    preferred: ["CDA credential", "Child development coursework"],
    continuing_education: "15 hours annually",
    background_checks: ["State and federal background check", "Child maltreatment registry"],
    specialized_training: ["CPR/First Aid", "Shaken baby syndrome", "SIDS awareness"]
  },
  "California": {
    required: ["High school diploma", "Personal rights training", "Community care licensing orientation"],
    preferred: ["AA in ECE or related field", "Child Development Associate"],
    continuing_education: "15 hours annually",
    background_checks: ["DOJ fingerprint clearance", "FBI background check", "Child Abuse Central Index"],
    specialized_training: ["CPR/First Aid", "Preventive health practices", "Nutrition and food handling"]
  },
  "Colorado": {
    required: ["High school diploma", "Background check", "Health screening"],
    preferred: ["CDA or 12+ ECE credit hours", "Colorado Shines professional development"],
    continuing_education: "15 hours annually",
    background_checks: ["Colorado Bureau of Investigation check", "Child abuse and neglect registry"],
    specialized_training: ["CPR/First Aid", "Mandatory reporting", "Universal precautions"]
  },
  "Connecticut": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or 9+ ECE credit hours", "Connecticut registry"],
    continuing_education: "18 hours annually",
    background_checks: ["State criminal history", "Child abuse registry", "Sex offender registry"],
    specialized_training: ["CPR/First Aid", "Safe sleep practices", "Emergency response"]
  },
  "Delaware": {
    required: ["High school diploma", "Background check", "Health clearance"],
    preferred: ["CDA credential", "Early childhood coursework"],
    continuing_education: "15 hours annually",
    background_checks: ["Delaware criminal history", "Child protection registry"],
    specialized_training: ["CPR/First Aid", "Child development", "Health and safety"]
  },
  "Florida": {
    required: ["High school diploma", "Level 2 background screening", "Health screening"],
    preferred: ["CDA or 40-hour child care training", "Staff Credential from DCF"],
    continuing_education: "10 hours annually",
    background_checks: ["FDLE and FBI background check", "Abuse registry check"],
    specialized_training: ["CPR certification", "Child care facility sanitation", "Identifying child abuse"]
  },
  "Georgia": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or technical college ECE certificate"],
    continuing_education: "10 hours annually",
    background_checks: ["Georgia criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "Emergency procedures"]
  },
  "Hawaii": {
    required: ["High school diploma", "Background check", "Medical clearance"],
    preferred: ["CDA or 6+ ECE college credits"],
    continuing_education: "15 hours annually",
    background_checks: ["Hawaii criminal justice data center check", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Cultural sensitivity"]
  },
  "Idaho": {
    required: ["High school diploma", "Background check", "Health screening"],
    preferred: ["CDA or ECE coursework"],
    continuing_education: "12 hours annually",
    background_checks: ["Idaho criminal history", "Child protection registry"],
    specialized_training: ["CPR/First Aid", "Shaken baby syndrome", "SIDS prevention"]
  },
  "Illinois": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or 6+ ECE semester hours", "Gateways credentials"],
    continuing_education: "15 hours annually",
    background_checks: ["Illinois State Police check", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Mandated reporter training", "Safe sleep"]
  },
  "Indiana": {
    required: ["High school diploma", "Background check", "Health screening"],
    preferred: ["CDA or ECE coursework", "Indiana Registry"],
    continuing_education: "15 hours annually",
    background_checks: ["Indiana criminal history", "Child protection registry"],
    specialized_training: ["CPR/First Aid", "Child abuse recognition", "Emergency response"]
  },
  "Iowa": {
    required: ["High school diploma", "Background check", "Medical clearance"],
    preferred: ["CDA or 6+ ECE semester hours"],
    continuing_education: "24 hours biennially",
    background_checks: ["Iowa criminal history", "Child abuse registry", "Sex offender registry"],
    specialized_training: ["CPR/First Aid", "Mandatory reporting", "Health and safety"]
  },
  "Kansas": {
    required: ["High school diploma", "Background check", "Health examination"],
    preferred: ["CDA or child development coursework"],
    continuing_education: "12 hours annually",
    background_checks: ["Kansas criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency procedures"]
  },
  "Kentucky": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or 6+ ECE credit hours", "STARS for KIDS NOW credentials"],
    continuing_education: "15 hours annually",
    background_checks: ["Kentucky State Police check", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "Safe sleep practices"]
  },
  "Louisiana": {
    required: ["High school diploma", "Background check", "Health screening"],
    preferred: ["CDA or early childhood coursework"],
    continuing_education: "12 hours annually",
    background_checks: ["Louisiana criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency response"]
  },
  "Maine": {
    required: ["High school diploma", "Background check", "Medical clearance"],
    preferred: ["CDA or 9+ ECE credit hours", "Maine Roads to Quality"],
    continuing_education: "20 hours annually",
    background_checks: ["Maine State Police check", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Mandated reporting", "Developmental milestones"]
  },
  "Maryland": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or 12+ ECE credit hours", "Maryland Child Care Credential"],
    continuing_education: "18 hours annually",
    background_checks: ["Maryland criminal background", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child abuse recognition", "SIDS training"]
  },
  "Massachusetts": {
    required: ["High school diploma", "Background record check", "Physical examination"],
    preferred: ["CDA or 9+ ECE college credits", "EEC Teacher Qualification"],
    continuing_education: "20 hours annually",
    background_checks: ["CORI and SORI checks", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Mandated reporter", "Medication administration"]
  },
  "Michigan": {
    required: ["High school diploma", "Background check", "Medical clearance"],
    preferred: ["CDA or 12+ ECE semester hours", "Great Start to Quality"],
    continuing_education: "16 hours annually",
    background_checks: ["Michigan State Police check", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "Safe sleep training"]
  },
  "Minnesota": {
    required: ["High school diploma", "Background study", "Medical examination"],
    preferred: ["CDA or child development knowledge area", "Parent Aware"],
    continuing_education: "16 hours annually",
    background_checks: ["Minnesota Bureau of Criminal Apprehension", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Sudden unexpected infant death", "Abusive head trauma"]
  },
  "Mississippi": {
    required: ["High school diploma", "Background check", "Health screening"],
    preferred: ["CDA or early childhood coursework"],
    continuing_education: "15 hours annually",
    background_checks: ["Mississippi criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency procedures"]
  },
  "Missouri": {
    required: ["High school diploma", "Background screening", "Medical examination"],
    preferred: ["CDA or 12+ ECE credit hours", "Missouri Registry"],
    continuing_education: "12 hours annually",
    background_checks: ["Missouri State Highway Patrol check", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "SIDS prevention"]
  },
  "Montana": {
    required: ["High school diploma", "Background check", "Medical clearance"],
    preferred: ["CDA or early childhood education"],
    continuing_education: "16 hours annually",
    background_checks: ["Montana criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency response"]
  },
  "Nebraska": {
    required: ["High school diploma", "Background check", "Health examination"],
    preferred: ["CDA or 6+ ECE credit hours", "Step Up to Quality"],
    continuing_education: "12 hours annually",
    background_checks: ["Nebraska State Patrol check", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Mandatory reporting", "Safe sleep"]
  },
  "Nevada": {
    required: ["High school diploma", "Background check", "Medical screening"],
    preferred: ["CDA or ECE coursework", "Nevada Registry"],
    continuing_education: "15 hours annually",
    background_checks: ["Nevada criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child abuse recognition", "Emergency procedures"]
  },
  "New Hampshire": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or 6+ ECE credit hours", "NH Career Ladder"],
    continuing_education: "18 hours annually",
    background_checks: ["New Hampshire criminal records", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "SIDS awareness"]
  },
  "New Jersey": {
    required: ["High school diploma", "Background check", "Medical clearance"],
    preferred: ["CDA or 15+ ECE credit hours", "Professional Impact NJ"],
    continuing_education: "20 hours annually",
    background_checks: ["New Jersey criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Mandated reporter", "Safe sleep practices"]
  },
  "New Mexico": {
    required: ["High school diploma", "Background screening", "Health screening"],
    preferred: ["CDA or early childhood coursework", "FOCUS Registry"],
    continuing_education: "15 hours annually",
    background_checks: ["New Mexico criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency response"]
  },
  "New York": {
    required: ["High school diploma", "SCR clearance", "Medical examination"],
    preferred: ["CDA or equivalent", "NY State credential"],
    continuing_education: "30 hours annually",
    background_checks: ["NYS criminal background", "Statewide Central Register"],
    specialized_training: ["CPR/First Aid", "Child abuse recognition", "MAT training"]
  },
  "North Carolina": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or birth-kindergarten license", "NC Registry"],
    continuing_education: "15 hours annually",
    background_checks: ["North Carolina criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "ITS-SIDS training", "Medication administration"]
  },
  "North Dakota": {
    required: ["High school diploma", "Background check", "Medical clearance"],
    preferred: ["CDA or ECE coursework", "ND Registry"],
    continuing_education: "12 hours annually",
    background_checks: ["North Dakota criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency procedures"]
  },
  "Ohio": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or 12+ ECE credit hours", "Ohio Registry"],
    continuing_education: "6 hours annually",
    background_checks: ["Ohio criminal records", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "Communicable disease"]
  },
  "Oklahoma": {
    required: ["High school diploma", "Background check", "Health screening"],
    preferred: ["CDA or child development associate", "Reaching for the Stars"],
    continuing_education: "15 hours annually",
    background_checks: ["Oklahoma criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency response"]
  },
  "Oregon": {
    required: ["High school diploma", "Background check", "Medical clearance"],
    preferred: ["CDA or 12+ ECE quarter hours", "Oregon Registry"],
    continuing_education: "15 hours annually",
    background_checks: ["Oregon State Police check", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "Safe sleep training"]
  },
  "Pennsylvania": {
    required: ["High school diploma", "Background clearances", "Medical examination"],
    preferred: ["CDA or 6+ ECE credit hours", "PA Keys"],
    continuing_education: "24 hours annually",
    background_checks: ["PA criminal history", "Child abuse clearance", "FBI fingerprint"],
    specialized_training: ["CPR/First Aid", "Mandated reporter", "Safe sleep practices"]
  },
  "Rhode Island": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or 6+ ECE credit hours", "RI Registry"],
    continuing_education: "20 hours annually",
    background_checks: ["Rhode Island criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child abuse recognition", "Emergency procedures"]
  },
  "South Carolina": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or early childhood coursework", "SC Registry"],
    continuing_education: "15 hours annually",
    background_checks: ["South Carolina criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "SIDS training"]
  },
  "South Dakota": {
    required: ["High school diploma", "Background check", "Health screening"],
    preferred: ["CDA or ECE coursework"],
    continuing_education: "20 hours annually",
    background_checks: ["South Dakota criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency response"]
  },
  "Tennessee": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or 12+ ECE credit hours", "TN-STARS"],
    continuing_education: "15 hours annually",
    background_checks: ["Tennessee criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child abuse recognition", "Safe sleep practices"]
  },
  "Texas": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or 6+ ECE semester hours", "Texas Rising Star"],
    continuing_education: "24 hours annually",
    background_checks: ["Texas criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "SIDS prevention"]
  },
  "Utah": {
    required: ["High school diploma", "Background screening", "Medical clearance"],
    preferred: ["CDA or early childhood coursework", "Utah Registry"],
    continuing_education: "12 hours annually",
    background_checks: ["Utah criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency procedures"]
  },
  "Vermont": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or 6+ ECE credit hours", "STARS Registry"],
    continuing_education: "18 hours annually",
    background_checks: ["Vermont criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "SIDS awareness"]
  },
  "Virginia": {
    required: ["High school diploma", "Background investigation", "Medical examination"],
    preferred: ["CDA or 12+ ECE credit hours", "VA Career Ladder"],
    continuing_education: "16 hours annually",
    background_checks: ["Virginia State Police check", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Medication administration", "Emergency procedures"]
  },
  "Washington": {
    required: ["High school diploma", "Background check", "Medical clearance"],
    preferred: ["CDA or 12+ ECE credit hours", "WA Registry"],
    continuing_education: "10 hours annually",
    background_checks: ["Washington State Patrol check", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "Safe sleep training"]
  },
  "West Virginia": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or early childhood coursework", "WVSTARS"],
    continuing_education: "15 hours annually",
    background_checks: ["West Virginia criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency response"]
  },
  "Wisconsin": {
    required: ["High school diploma", "Background investigation", "Medical examination"],
    preferred: ["CDA or 8+ ECE credit hours", "WI Registry"],
    continuing_education: "25 hours annually",
    background_checks: ["Wisconsin criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Recognizing child abuse", "SIDS prevention"]
  },
  "Wyoming": {
    required: ["High school diploma", "Background check", "Health screening"],
    preferred: ["CDA or ECE coursework", "WY Quality Counts"],
    continuing_education: "12 hours annually",
    background_checks: ["Wyoming criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency procedures"]
  },
  "District of Columbia": {
    required: ["High school diploma", "Background check", "Medical examination"],
    preferred: ["CDA or 15+ ECE credit hours", "DC Capital Quality"],
    continuing_education: "15 hours annually",
    background_checks: ["DC criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Mandated reporter", "Safe sleep practices"]
  },
  "Puerto Rico": {
    required: ["High school diploma", "Background check", "Medical clearance"],
    preferred: ["CDA or early childhood coursework"],
    continuing_education: "12 hours annually",
    background_checks: ["Puerto Rico criminal history", "Child abuse registry"],
    specialized_training: ["CPR/First Aid", "Child protection", "Emergency response"]
  }
};

export default STATE_COMPLIANCE_RATIOS;