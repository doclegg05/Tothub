export interface RatioRequirement {
  ageGroup: string;
  maxChildrenPerStaff: number;
  displayName: string;
}

export const WV_RATIO_REQUIREMENTS: RatioRequirement[] = [
  { ageGroup: 'infant', maxChildrenPerStaff: 4, displayName: 'Infants (0-16 months)' },
  { ageGroup: 'young_toddler', maxChildrenPerStaff: 5, displayName: 'Young Toddlers (16mo-2yr)' },
  { ageGroup: 'toddler', maxChildrenPerStaff: 8, displayName: '2-year-olds' },
  { ageGroup: 'preschool', maxChildrenPerStaff: 10, displayName: 'Preschool (3-5 years)' },
  { ageGroup: 'school_age', maxChildrenPerStaff: 18, displayName: 'School Age (5-8 years)' },
  { ageGroup: 'older_school_age', maxChildrenPerStaff: 20, displayName: 'Older School Age (9-12 years)' }
];

export interface RoomRatio {
  room: string;
  children: number;
  staff: number;
  requiredStaff: number;
  ratio: string;
  requiredRatio: string;
  isCompliant: boolean;
  ageGroup: string;
}

export function calculateRequiredStaff(childrenCount: number, ageGroup: string): number {
  const requirement = WV_RATIO_REQUIREMENTS.find(req => req.ageGroup === ageGroup);
  if (!requirement) return Math.ceil(childrenCount / 10); // Default to preschool ratio
  
  return Math.ceil(childrenCount / requirement.maxChildrenPerStaff);
}

export function isRoomCompliant(childrenCount: number, staffCount: number, ageGroup: string): boolean {
  if (childrenCount === 0) return true; // No children means always compliant
  
  const requiredStaff = calculateRequiredStaff(childrenCount, ageGroup);
  return staffCount >= requiredStaff;
}

export function formatRatio(children: number, staff: number): string {
  if (staff === 0) return '0:0';
  return `1:${Math.floor(children / staff)}`;
}

export function getRequiredRatioString(ageGroup: string): string {
  const requirement = WV_RATIO_REQUIREMENTS.find(req => req.ageGroup === ageGroup);
  if (!requirement) return '1:10';
  
  return `1:${requirement.maxChildrenPerStaff}`;
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function getAgeGroupFromBirthDate(dateOfBirth: Date): string {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
  
  if (ageInMonths < 16) return 'infant';
  if (ageInMonths < 24) return 'young_toddler';
  if (ageInMonths < 36) return 'toddler';
  if (ageInMonths < 60) return 'preschool';
  if (ageInMonths < 96) return 'school_age';
  return 'older_school_age';
}
