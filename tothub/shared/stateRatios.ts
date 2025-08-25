// Comprehensive state-by-state daycare ratio requirements for 2025
// Data sourced from World Population Review and state licensing authorities

export const STATE_RATIOS_DATA = [
  { state: "Alabama", sixWeeks: "5:1", nineMonths: "5:1", eighteenMonths: "7:1", twentySevenMonths: "8:1", threeYears: "8:1", fourYears: "18:1", fiveYears: "21:1", sixYears: "21:1", sevenYears: "21:1", eightNineYears: "22:1", tenPlusYears: "22:1" },
  { state: "Alaska", sixWeeks: "5:1", nineMonths: "5:1", eighteenMonths: "7:1", twentySevenMonths: "6:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "14:1", sixYears: "14:1", sevenYears: "18:1", eightNineYears: "18:1", tenPlusYears: "18:1" },
  { state: "Arizona", sixWeeks: "5:1", nineMonths: "5:1", eighteenMonths: "6:1", twentySevenMonths: "8:1", threeYears: "13:1", fourYears: "15:1", fiveYears: "20:1", sixYears: "20:1", sevenYears: "20:1", eightNineYears: "20:1", tenPlusYears: "20:1" },
  { state: "Arkansas", sixWeeks: "6:1", nineMonths: "6:1", eighteenMonths: "9:1", twentySevenMonths: "9:1", threeYears: "12:1", fourYears: "15:1", fiveYears: "18:1", sixYears: "20:1", sevenYears: "20:1", eightNineYears: "20:1", tenPlusYears: "20:1" },
  { state: "California", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "6:1", twentySevenMonths: "6:1", threeYears: "12:1", fourYears: "12:1", fiveYears: "14:1", sixYears: "14:1", sevenYears: "14:1", eightNineYears: "14:1", tenPlusYears: "14:1" },
  { state: "Colorado", sixWeeks: "5:1", nineMonths: "5:1", eighteenMonths: "5:1", twentySevenMonths: "7:1", threeYears: "10:1", fourYears: "12:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "Connecticut", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "4:1", twentySevenMonths: "4:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "10:1", sixYears: "10:1", sevenYears: "10:1", eightNineYears: "10:1", tenPlusYears: "10:1" },
  { state: "Delaware", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "6:1", twentySevenMonths: "8:1", threeYears: "10:1", fourYears: "12:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "District of Columbia", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "4:1", twentySevenMonths: "4:1", threeYears: "8:1", fourYears: "10:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "Florida", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "6:1", twentySevenMonths: "11:1", threeYears: "15:1", fourYears: "20:1", fiveYears: "25:1", sixYears: "25:1", sevenYears: "25:1", eightNineYears: "25:1", tenPlusYears: "25:1" },
  { state: "Georgia", sixWeeks: "6:1", nineMonths: "6:1", eighteenMonths: "8:1", twentySevenMonths: "10:1", threeYears: "15:1", fourYears: "18:1", fiveYears: "20:1", sixYears: "25:1", sevenYears: "25:1", eightNineYears: "25:1", tenPlusYears: "25:1" },
  { state: "Hawaii", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "6:1", twentySevenMonths: "8:1", threeYears: "12:1", fourYears: "16:1", fiveYears: "20:1", sixYears: "20:1", sevenYears: "20:1", eightNineYears: "20:1", tenPlusYears: "20:1" },
  { state: "Illinois", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "5:1", twentySevenMonths: "8:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "20:1", sixYears: "20:1", sevenYears: "20:1", eightNineYears: "20:1", tenPlusYears: "20:1" },
  { state: "Indiana", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "5:1", twentySevenMonths: "5:1", threeYears: "8:1", fourYears: "10:1", fiveYears: "12:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "Iowa", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "4:1", twentySevenMonths: "6:1", threeYears: "8:1", fourYears: "12:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "20:1" },
  { state: "Kansas", sixWeeks: "3:1", nineMonths: "3:1", eighteenMonths: "5:1", twentySevenMonths: "7:1", threeYears: "12:1", fourYears: "12:1", fiveYears: "14:1", sixYears: "16:1", sevenYears: "16:1", eightNineYears: "16:1", tenPlusYears: "16:1" },
  { state: "Kentucky", sixWeeks: "5:1", nineMonths: "5:1", eighteenMonths: "6:1", twentySevenMonths: "10:1", threeYears: "12:1", fourYears: "14:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "20:1", eightNineYears: "20:1", tenPlusYears: "20:1" },
  { state: "Louisiana", sixWeeks: "6:1", nineMonths: "6:1", eighteenMonths: "8:1", twentySevenMonths: "12:1", threeYears: "14:1", fourYears: "16:1", fiveYears: "20:1", sixYears: "25:1", sevenYears: "25:1", eightNineYears: "25:1", tenPlusYears: "25:1" },
  { state: "Maine", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "5:1", twentySevenMonths: "5:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "13:1", sixYears: "13:1", sevenYears: "13:1", eightNineYears: "13:1", tenPlusYears: "13:1" },
  { state: "Maryland", sixWeeks: "3:1", nineMonths: "3:1", eighteenMonths: "3:1", twentySevenMonths: "6:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "Massachusetts", sixWeeks: "7:1", nineMonths: "7:1", eighteenMonths: "9:1", twentySevenMonths: "9:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "Michigan", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "4:1", twentySevenMonths: "4:1", threeYears: "10:1", fourYears: "12:1", fiveYears: "12:1", sixYears: "18:1", sevenYears: "18:1", eightNineYears: "18:1", tenPlusYears: "18:1" },
  { state: "Minnesota", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "7:1", twentySevenMonths: "7:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "10:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "Mississippi", sixWeeks: "5:1", nineMonths: "5:1", eighteenMonths: "9:1", twentySevenMonths: "12:1", threeYears: "8:1", fourYears: "14:1", fiveYears: "16:1", sixYears: "20:1", sevenYears: "20:1", eightNineYears: "20:1", tenPlusYears: "25:1" },
  { state: "Missouri", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "4:1", twentySevenMonths: "8:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "16:1", sixYears: "16:1", sevenYears: "16:1", eightNineYears: "16:1", tenPlusYears: "16:1" },
  { state: "Montana", sixWeeks: "5:1", nineMonths: "5:1", eighteenMonths: "7:1", twentySevenMonths: "8:1", threeYears: "8:1", fourYears: "18:1", fiveYears: "21:1", sixYears: "21:1", sevenYears: "21:1", eightNineYears: "22:1", tenPlusYears: "22:1" },
  { state: "Nebraska", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "6:1", twentySevenMonths: "6:1", threeYears: "10:1", fourYears: "12:1", fiveYears: "12:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "Nevada", sixWeeks: "4:1", nineMonths: "6:1", eighteenMonths: "8:1", twentySevenMonths: "10:1", threeYears: "13:1", fourYears: "13:1", fiveYears: "13:1", sixYears: "13:1", sevenYears: "13:1", eightNineYears: "13:1", tenPlusYears: "13:1" },
  { state: "New Hampshire", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "5:1", twentySevenMonths: "6:1", threeYears: "8:1", fourYears: "12:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "New Jersey", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "6:1", twentySevenMonths: "10:1", threeYears: "10:1", fourYears: "12:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "New Mexico", sixWeeks: "6:1", nineMonths: "6:1", eighteenMonths: "6:1", twentySevenMonths: "10:1", threeYears: "12:1", fourYears: "12:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "New York", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "5:1", twentySevenMonths: "5:1", threeYears: "7:1", fourYears: "8:1", fiveYears: "9:1", sixYears: "10:1", sevenYears: "10:1", eightNineYears: "10:1", tenPlusYears: "15:1" },
  { state: "North Carolina", sixWeeks: "5:1", nineMonths: "5:1", eighteenMonths: "6:1", twentySevenMonths: "10:1", threeYears: "15:1", fourYears: "15:1", fiveYears: "25:1", sixYears: "25:1", sevenYears: "25:1", eightNineYears: "25:1", tenPlusYears: "25:1" },
  { state: "North Dakota", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "4:1", twentySevenMonths: "5:1", threeYears: "7:1", fourYears: "10:1", fiveYears: "12:1", sixYears: "18:1", sevenYears: "18:1", eightNineYears: "18:1", tenPlusYears: "18:1" },
  { state: "Ohio", sixWeeks: "5:1", nineMonths: "5:1", eighteenMonths: "7:1", twentySevenMonths: "7:1", threeYears: "12:1", fourYears: "14:1", fiveYears: "14:1", sixYears: "18:1", sevenYears: "18:1", eightNineYears: "18:1", tenPlusYears: "18:1" },
  { state: "Oklahoma", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "6:1", twentySevenMonths: "8:1", threeYears: "12:1", fourYears: "15:1", fiveYears: "15:1", sixYears: "20:1", sevenYears: "20:1", eightNineYears: "20:1", tenPlusYears: "20:1" },
  { state: "Oregon", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "4:1", twentySevenMonths: "5:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "Pennsylvania", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "5:1", twentySevenMonths: "6:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "10:1", sixYears: "12:1", sevenYears: "12:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "Rhode Island", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "6:1", twentySevenMonths: "6:1", threeYears: "9:1", fourYears: "10:1", fiveYears: "12:1", sixYears: "13:1", sevenYears: "13:1", eightNineYears: "13:1", tenPlusYears: "13:1" },
  { state: "South Carolina", sixWeeks: "5:1", nineMonths: "5:1", eighteenMonths: "6:1", twentySevenMonths: "9:1", threeYears: "13:1", fourYears: "18:1", fiveYears: "21:1", sixYears: "23:1", sevenYears: "23:1", eightNineYears: "23:1", tenPlusYears: "23:1" },
  { state: "South Dakota", sixWeeks: "5:1", nineMonths: "5:1", eighteenMonths: "5:1", twentySevenMonths: "5:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "10:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "Tennessee", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "6:1", twentySevenMonths: "7:1", threeYears: "9:1", fourYears: "13:1", fiveYears: "16:1", sixYears: "20:1", sevenYears: "20:1", eightNineYears: "20:1", tenPlusYears: "20:1" },
  { state: "Texas", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "9:1", twentySevenMonths: "11:1", threeYears: "15:1", fourYears: "18:1", fiveYears: "22:1", sixYears: "26:1", sevenYears: "26:1", eightNineYears: "26:1", tenPlusYears: "26:1" },
  { state: "Utah", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "4:1", twentySevenMonths: "7:1", threeYears: "12:1", fourYears: "15:1", fiveYears: "20:1", sixYears: "20:1", sevenYears: "20:1", eightNineYears: "20:1", tenPlusYears: "20:1" },
  { state: "Vermont", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "4:1", twentySevenMonths: "5:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "10:1", sixYears: "13:1", sevenYears: "13:1", eightNineYears: "13:1", tenPlusYears: "13:1" },
  { state: "Virginia", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "5:1", twentySevenMonths: "8:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "18:1", sixYears: "18:1", sevenYears: "18:1", eightNineYears: "18:1", tenPlusYears: "20:1" },
  { state: "Washington", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "7:1", twentySevenMonths: "7:1", threeYears: "10:1", fourYears: "10:1", fiveYears: "15:1", sixYears: "15:1", sevenYears: "15:1", eightNineYears: "15:1", tenPlusYears: "15:1" },
  { state: "West Virginia", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "4:1", twentySevenMonths: "8:1", threeYears: "10:1", fourYears: "12:1", fiveYears: "12:1", sixYears: "16:1", sevenYears: "16:1", eightNineYears: "16:1", tenPlusYears: "16:1" },
  { state: "Wisconsin", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "4:1", twentySevenMonths: "6:1", threeYears: "10:1", fourYears: "13:1", fiveYears: "17:1", sixYears: "18:1", sevenYears: "18:1", eightNineYears: "18:1", tenPlusYears: "18:1" },
  { state: "Wyoming", sixWeeks: "4:1", nineMonths: "4:1", eighteenMonths: "5:1", twentySevenMonths: "8:1", threeYears: "10:1", fourYears: "12:1", fiveYears: "12:1", sixYears: "18:1", sevenYears: "18:1", eightNineYears: "18:1", tenPlusYears: "18:1" }
];

// Helper function to convert ratio string to number
export function parseRatio(ratioString: string): number {
  const [children, staff] = ratioString.split(':').map(Number);
  return children / staff;
}

// Helper function to get ratio for specific age group by state
export function getRatioForAge(state: string, ageInMonths: number): string {
  const stateData = STATE_RATIOS_DATA.find(s => s.state === state);
  if (!stateData) return "10:1"; // Default fallback
  
  if (ageInMonths <= 6) return stateData.sixWeeks;
  if (ageInMonths <= 9) return stateData.nineMonths;
  if (ageInMonths <= 18) return stateData.eighteenMonths;
  if (ageInMonths <= 27) return stateData.twentySevenMonths;
  if (ageInMonths <= 36) return stateData.threeYears;
  if (ageInMonths <= 48) return stateData.fourYears;
  if (ageInMonths <= 60) return stateData.fiveYears;
  if (ageInMonths <= 72) return stateData.sixYears;
  if (ageInMonths <= 84) return stateData.sevenYears;
  if (ageInMonths <= 108) return stateData.eightNineYears;
  return stateData.tenPlusYears;
}

// Get all states list for dropdown
export const US_STATES = STATE_RATIOS_DATA.map(state => state.state).sort();