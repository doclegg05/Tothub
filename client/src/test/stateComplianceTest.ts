/**
 * State Compliance Test Suite
 * Tests dynamic state ratio switching and compliance calculations
 */

import { 
  calculateStateRequirements,
  compareStateRequirements,
  calculateMixedAgeRequirements,
  generateComplianceAlert
} from "@/lib/stateRatioCalculations";

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  actualResult?: any;
  expectedResult?: any;
}

export class StateComplianceTestSuite {
  private results: TestResult[] = [];

  /**
   * Run comprehensive test suite for state compliance system
   */
  async runAllTests(): Promise<{
    totalTests: number;
    passed: number;
    failed: number;
    results: TestResult[];
    summary: string;
  }> {
    console.log("🧪 Starting State Compliance Test Suite...");
    
    // Clear previous results
    this.results = [];

    // Test basic ratio calculations
    await this.testBasicRatioCalculations();
    
    // Test state comparison functionality
    await this.testStateComparisons();
    
    // Test mixed-age group calculations
    await this.testMixedAgeCalculations();
    
    // Test compliance alert generation
    await this.testComplianceAlerts();
    
    // Test extreme cases
    await this.testEdgeCases();

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    
    console.log(`✅ Tests passed: ${passed}`);
    console.log(`❌ Tests failed: ${failed}`);
    
    return {
      totalTests: this.results.length,
      passed,
      failed,
      results: this.results,
      summary: `State Compliance Tests: ${passed}/${this.results.length} passed`
    };
  }

  private addResult(testName: string, passed: boolean, details: string, actualResult?: any, expectedResult?: any) {
    this.results.push({
      testName,
      passed,
      details,
      actualResult,
      expectedResult
    });
    
    const status = passed ? "✅" : "❌";
    console.log(`${status} ${testName}: ${details}`);
  }

  private async testBasicRatioCalculations() {
    console.log("\n📊 Testing Basic Ratio Calculations...");

    // Test California (strict) vs Texas (lenient) for infants
    const childrenByRoom = {
      "Infant Room": {
        "Infant": 8
      }
    };
    const currentStaff = {
      "Infant Room": 2
    };

    // California should require 2 teachers for 8 infants (4:1 ratio)
    const caResults = calculateStateRequirements(childrenByRoom, currentStaff, "California");
    this.addResult(
      "California Infant Ratio",
      caResults.isCompliant && caResults.totalRequired === 2,
      `CA requires ${caResults.totalRequired} teachers for 8 infants, compliant: ${caResults.isCompliant}`,
      caResults,
      { totalRequired: 2, isCompliant: true }
    );

    // Texas should require 2 teachers for 8 infants (4:1 ratio) 
    const txResults = calculateStateRequirements(childrenByRoom, currentStaff, "Texas");
    this.addResult(
      "Texas Infant Ratio",
      txResults.isCompliant && txResults.totalRequired === 2,
      `TX requires ${txResults.totalRequired} teachers for 8 infants, compliant: ${txResults.isCompliant}`,
      txResults,
      { totalRequired: 2, isCompliant: true }
    );

    // Test West Virginia defaults
    const wvResults = calculateStateRequirements(childrenByRoom, currentStaff, "West Virginia");
    this.addResult(
      "West Virginia Default",
      wvResults.totalRequired > 0,
      `WV requires ${wvResults.totalRequired} teachers for 8 infants`,
      wvResults
    );
  }

  private async testStateComparisons() {
    console.log("\n🔄 Testing State Comparisons...");

    const childrenCount = {
      "Infant": 4,
      "Toddler": 6,
      "Preschool": 10
    };

    // Compare Maryland (strict) vs Florida (lenient)
    const comparison = compareStateRequirements(childrenCount, "Maryland", "Florida");
    
    this.addResult(
      "Maryland to Florida Comparison",
      comparison.changes.length > 0,
      `Found ${comparison.changes.length} ratio changes. Became lenient: ${comparison.becameLenient}`,
      comparison
    );

    // Compare identical states (should show no changes)
    const sameStateComparison = compareStateRequirements(childrenCount, "California", "California");
    this.addResult(
      "Same State Comparison",
      sameStateComparison.changes.length === 0,
      `Same state comparison should show no changes: ${sameStateComparison.changes.length === 0}`,
      sameStateComparison
    );
  }

  private async testMixedAgeCalculations() {
    console.log("\n👶 Testing Mixed-Age Group Calculations...");

    // Test mixed ages - should use youngest child's ratio
    const mixedAges = [6, 18, 36, 48]; // 6 months, 18 months, 3 years, 4 years
    
    const mixedCalc = calculateMixedAgeRequirements(mixedAges, "New York");
    this.addResult(
      "Mixed Age Group (NY)",
      mixedCalc.ageGroupUsed === "Infants (0-12 months)",
      `Mixed age group should use infant ratio. Used: ${mixedCalc.ageGroupUsed}`,
      mixedCalc,
      { ageGroupUsed: "Infants (0-12 months)" }
    );

    // Test all older children
    const olderAges = [72, 84, 96]; // 6, 7, 8 years
    const olderCalc = calculateMixedAgeRequirements(olderAges, "Texas");
    this.addResult(
      "All School Age (TX)",
      olderCalc.ageGroupUsed === "School-age (6+)",
      `All school age should use school-age ratio. Used: ${olderCalc.ageGroupUsed}`,
      olderCalc
    );
  }

  private async testComplianceAlerts() {
    console.log("\n🚨 Testing Compliance Alert Generation...");

    const violations = [
      "Infant Room: Need 3 teachers, currently have 2",
      "Toddler Room: Need 2 teachers, currently have 1"
    ];

    const alert = generateComplianceAlert(violations, "California");
    
    this.addResult(
      "Alert Generation",
      alert.severity === "medium" && alert.actionItems.length === 2,
      `Generated ${alert.severity} alert with ${alert.actionItems.length} action items`,
      alert
    );

    // Test high severity alert
    const manyViolations = Array(5).fill("Multiple violations");
    const highAlert = generateComplianceAlert(manyViolations, "New York");
    this.addResult(
      "High Severity Alert",
      highAlert.severity === "high",
      `Many violations should generate high severity alert: ${highAlert.severity}`,
      highAlert
    );
  }

  private async testEdgeCases() {
    console.log("\n🔍 Testing Edge Cases...");

    // Test with zero children
    const emptyRoom = calculateStateRequirements({}, {}, "California");
    this.addResult(
      "Empty Room Calculation",
      emptyRoom.totalRequired === 0 && emptyRoom.isCompliant,
      `Empty room should be compliant with 0 required teachers`,
      emptyRoom
    );

    // Test with invalid state (should fallback to West Virginia)
    const invalidState = calculateStateRequirements(
      { "Test Room": { "Infant": 4 } },
      { "Test Room": 1 },
      "InvalidState"
    );
    this.addResult(
      "Invalid State Fallback",
      invalidState.totalRequired > 0,
      `Invalid state should fallback gracefully`,
      invalidState
    );

    // Test with very high child count
    const highCountRoom = {
      "Large Room": {
        "School Age": 100
      }
    };
    const currentStaffLarge = {
      "Large Room": 10
    };
    
    const largeRoomCalc = calculateStateRequirements(highCountRoom, currentStaffLarge, "Florida");
    this.addResult(
      "Large Room Calculation",
      largeRoomCalc.totalRequired > 0 && !isNaN(largeRoomCalc.totalRequired),
      `Large room calculation should handle high numbers: ${largeRoomCalc.totalRequired} required`,
      largeRoomCalc
    );
  }

  /**
   * Simulate switching between different states with real daycare data
   */
  async simulateStateSwitching(): Promise<{
    success: boolean;
    scenarios: Array<{
      fromState: string;
      toState: string;
      impact: string;
      staffingChange: number;
    }>;
  }> {
    console.log("\n🔄 Simulating State Switching Scenarios...");
    
    const scenarios = [];
    const testChildren = {
      "Infant": 8,
      "Toddler": 12,
      "Preschool": 15,
      "School Age": 20
    };

    const stateTransitions = [
      ["West Virginia", "California"], // Default to strict
      ["California", "Texas"],         // Strict to moderate  
      ["Texas", "New York"],          // Moderate to very strict
      ["New York", "Alabama"],        // Very strict to lenient
      ["Alabama", "West Virginia"]    // Lenient back to default
    ];

    for (const [fromState, toState] of stateTransitions) {
      const comparison = compareStateRequirements(testChildren, fromState, toState);
      
      scenarios.push({
        fromState,
        toState,
        impact: comparison.impactSummary,
        staffingChange: comparison.becameStricter ? 1 : comparison.becameLenient ? -1 : 0
      });
    }

    console.log("📋 State Switching Summary:");
    scenarios.forEach(scenario => {
      console.log(`   ${scenario.fromState} → ${scenario.toState}: ${scenario.impact}`);
    });

    return {
      success: true,
      scenarios
    };
  }
}

// Export instance for use in other components
export const stateComplianceTests = new StateComplianceTestSuite();

export default StateComplianceTestSuite;