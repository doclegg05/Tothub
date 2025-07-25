import { getRatioForAge, parseRatio } from "@shared/stateRatios";

// Convert date of birth to age in months
export function getAgeInMonths(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  const yearsDiff = today.getFullYear() - birthDate.getFullYear();
  const monthsDiff = today.getMonth() - birthDate.getMonth();
  
  return yearsDiff * 12 + monthsDiff;
}

// Map our age groups to age ranges for state ratio calculations
export function getAgeFromAgeGroup(ageGroup: string): number {
  switch (ageGroup) {
    case 'infant': return 6; // 0-16 months, use 6 weeks
    case 'young_toddler': return 18; // 16 months - 2 years
    case 'toddler': return 27; // 2 years (27 months)
    case 'preschool': return 48; // 3-5 years, use 4 years (48 months)
    case 'school_age': return 72; // 5-8 years, use 6 years (72 months)
    case 'older_school_age': return 120; // 9-12 years, use 10+ years (120 months)
    default: return 48; // Default to preschool
  }
}

// Calculate required staff for a group of children based on state ratios
export function calculateRequiredStaff(children: any[], state: string): number {
  if (!children.length) return 0;
  
  // Group children by their most restrictive ratio requirement
  const ratioGroups: { [ratio: string]: number } = {};
  
  children.forEach(child => {
    const ageInMonths = child.dateOfBirth ? getAgeInMonths(new Date(child.dateOfBirth)) : getAgeFromAgeGroup(child.ageGroup);
    const ratioString = getRatioForAge(state, ageInMonths);
    
    if (!ratioGroups[ratioString]) {
      ratioGroups[ratioString] = 0;
    }
    ratioGroups[ratioString]++;
  });
  
  // Calculate total staff needed across all ratio groups
  let totalStaffNeeded = 0;
  
  Object.entries(ratioGroups).forEach(([ratioString, childCount]) => {
    const ratio = parseRatio(ratioString);
    const staffNeeded = Math.ceil(childCount / ratio);
    totalStaffNeeded += staffNeeded;
  });
  
  return totalStaffNeeded;
}

// Calculate current ratio for display
export function calculateCurrentRatio(childCount: number, staffCount: number): string {
  if (staffCount === 0) return childCount > 0 ? '∞:1' : '0:0';
  if (childCount === 0) return '0:1';
  return `${Math.round(childCount / staffCount)}:1`;
}

// Check if current staffing meets state requirements
export function isStaffingCompliant(children: any[], staffCount: number, state: string): boolean {
  const requiredStaff = calculateRequiredStaff(children, state);
  return staffCount >= requiredStaff;
}

// Get the most restrictive ratio for a mixed-age group
export function getMostRestrictiveRatio(children: any[], state: string): string {
  if (!children.length) return "10:1";
  
  let mostRestrictive = Infinity;
  let mostRestrictiveRatio = "10:1";
  
  children.forEach(child => {
    const ageInMonths = child.dateOfBirth ? getAgeInMonths(new Date(child.dateOfBirth)) : getAgeFromAgeGroup(child.ageGroup);
    const ratioString = getRatioForAge(state, ageInMonths);
    const ratio = parseRatio(ratioString);
    
    if (ratio < mostRestrictive) {
      mostRestrictive = ratio;
      mostRestrictiveRatio = ratioString;
    }
  });
  
  return mostRestrictiveRatio;
}