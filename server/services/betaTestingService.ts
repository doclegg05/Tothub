export interface BetaTestGroup {
  id: string;
  name: string;
  daycareCenter: DaycareCenterInfo;
  participants: BetaParticipant[];
  testPhase: 'enrollment' | 'onboarding' | 'testing' | 'feedback' | 'completed';
  startDate: Date;
  endDate?: Date;
  features: string[];
  metrics: BetaTestMetrics;
}

export interface DaycareCenterInfo {
  name: string;
  location: string;
  size: 'small' | 'medium' | 'large';
  childCount: number;
  staffCount: number;
  currentSystem: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface BetaParticipant {
  id: string;
  name: string;
  role: 'director' | 'teacher' | 'admin' | 'parent';
  email: string;
  device: string;
  browser: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
  feedback: BetaFeedback[];
}

export interface BetaFeedback {
  timestamp: Date;
  category: 'usability' | 'functionality' | 'performance' | 'bug' | 'feature_request';
  severity: 'low' | 'medium' | 'high' | 'critical';
  feature: string;
  description: string;
  screenshot?: string;
  deviceInfo: DeviceInfo;
  resolved: boolean;
  response?: string;
}

export interface DeviceInfo {
  userAgent: string;
  screen: { width: number; height: number };
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  mobile: boolean;
  touchSupport: boolean;
}

export interface BetaTestMetrics {
  usageStats: UsageStats;
  performanceMetrics: PerformanceMetrics[];
  errorRate: number;
  crashRate: number;
  userSatisfaction: number; // 1-10 scale
  completionRate: number; // percentage of tasks completed successfully
  timeToComplete: Record<string, number>; // average time for key tasks
  dropoffPoints: string[]; // pages/features where users commonly exit
}

export interface UsageStats {
  totalSessions: number;
  averageSessionDuration: number;
  featuresUsed: Record<string, number>;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

export interface PerformanceMetrics {
  date: Date;
  pageLoadTime: number;
  checkInTime: number;
  payrollProcessingTime: number;
  reportGenerationTime: number;
  memoryUsage: number;
  crashCount: number;
}

export class BetaTestingService {
  private static instance: BetaTestingService;
  private betaGroups: Map<string, BetaTestGroup> = new Map();
  private feedbackQueue: BetaFeedback[] = [];

  public static getInstance(): BetaTestingService {
    if (!BetaTestingService.instance) {
      BetaTestingService.instance = new BetaTestingService();
    }
    return BetaTestingService.instance;
  }

  // Initialize beta testing program
  public async initializeBetaProgram(): Promise<void> {
    console.log('🧪 Initializing beta testing program...');
    
    // Create initial beta test groups
    const initialGroups = this.createInitialBetaGroups();
    
    for (const group of initialGroups) {
      this.betaGroups.set(group.id, group);
      console.log(`📋 Created beta group: ${group.name} (${group.participants.length} participants)`);
    }

    console.log('✅ Beta testing program initialized');
  }

  // Create initial beta test groups
  private createInitialBetaGroups(): BetaTestGroup[] {
    return [
      {
        id: 'beta-group-1',
        name: 'Small Daycare Centers',
        daycareCenter: {
          name: 'Little Sprouts Learning Center',
          location: 'Austin, TX',
          size: 'small',
          childCount: 25,
          staffCount: 6,
          currentSystem: 'Paper-based',
          contactPerson: 'Sarah Johnson',
          email: 'sarah@littlesprouts.com',
          phone: '(512) 555-0123',
        },
        participants: [
          {
            id: 'participant-1',
            name: 'Sarah Johnson',
            role: 'director',
            email: 'sarah@littlesprouts.com',
            device: 'iPad Pro',
            browser: 'Safari',
            experience: 'intermediate',
            feedback: [],
          },
          {
            id: 'participant-2',
            name: 'Maria Garcia',
            role: 'teacher',
            email: 'maria@littlesprouts.com',
            device: 'iPhone 14',
            browser: 'Safari',
            experience: 'beginner',
            feedback: [],
          },
        ],
        testPhase: 'enrollment',
        startDate: new Date(),
        features: ['check-in', 'attendance', 'basic-reports'],
        metrics: this.createEmptyMetrics(),
      },
      {
        id: 'beta-group-2',
        name: 'Medium Daycare Centers',
        daycareCenter: {
          name: 'Sunshine Academy',
          location: 'Denver, CO',
          size: 'medium',
          childCount: 85,
          staffCount: 15,
          currentSystem: 'Brightwheel',
          contactPerson: 'Michael Chen',
          email: 'michael@sunshineacademy.com',
          phone: '(303) 555-0456',
        },
        participants: [
          {
            id: 'participant-3',
            name: 'Michael Chen',
            role: 'director',
            email: 'michael@sunshineacademy.com',
            device: 'Windows Desktop',
            browser: 'Chrome',
            experience: 'advanced',
            feedback: [],
          },
          {
            id: 'participant-4',
            name: 'Jennifer Wilson',
            role: 'admin',
            email: 'jennifer@sunshineacademy.com',
            device: 'MacBook Pro',
            browser: 'Chrome',
            experience: 'intermediate',
            feedback: [],
          },
        ],
        testPhase: 'enrollment',
        startDate: new Date(),
        features: ['check-in', 'attendance', 'payroll', 'parent-communication', 'reports'],
        metrics: this.createEmptyMetrics(),
      },
      {
        id: 'beta-group-3',
        name: 'Large Daycare Centers',
        daycareCenter: {
          name: 'Growing Minds Children\'s Center',
          location: 'Seattle, WA',
          size: 'large',
          childCount: 150,
          staffCount: 25,
          currentSystem: 'Procare',
          contactPerson: 'David Park',
          email: 'david@growingminds.com',
          phone: '(206) 555-0789',
        },
        participants: [
          {
            id: 'participant-5',
            name: 'David Park',
            role: 'director',
            email: 'david@growingminds.com',
            device: 'Surface Pro',
            browser: 'Edge',
            experience: 'advanced',
            feedback: [],
          },
          {
            id: 'participant-6',
            name: 'Lisa Rodriguez',
            role: 'admin',
            email: 'lisa@growingminds.com',
            device: 'Android Tablet',
            browser: 'Chrome',
            experience: 'intermediate',
            feedback: [],
          },
        ],
        testPhase: 'enrollment',
        startDate: new Date(),
        features: ['check-in', 'attendance', 'payroll', 'parent-communication', 'reports', 'security', 'compliance'],
        metrics: this.createEmptyMetrics(),
      },
    ];
  }

  // Submit beta feedback
  public async submitFeedback(participantId: string, feedback: Omit<BetaFeedback, 'timestamp' | 'resolved'>): Promise<void> {
    const completeFeedback: BetaFeedback = {
      ...feedback,
      timestamp: new Date(),
      resolved: false,
    };

    // Add to feedback queue
    this.feedbackQueue.push(completeFeedback);

    // Find participant and add feedback
    for (const [groupId, group] of Array.from(this.betaGroups)) {
      const participant = group.participants.find((p: BetaParticipant) => p.id === participantId);
      if (participant) {
        participant.feedback.push(completeFeedback);
        console.log(`📝 Feedback received from ${participant.name}: ${feedback.category} - ${feedback.severity}`);
        
        // Auto-escalate critical issues
        if (feedback.severity === 'critical') {
          await this.escalateCriticalIssue(group, participant, completeFeedback);
        }
        
        break;
      }
    }
  }

  // Escalate critical issues
  private async escalateCriticalIssue(group: BetaTestGroup, participant: BetaParticipant, feedback: BetaFeedback): Promise<void> {
    console.log(`🚨 CRITICAL ISSUE reported by ${participant.name} at ${group.daycareCenter.name}`);
    console.log(`Feature: ${feedback.feature}`);
    console.log(`Description: ${feedback.description}`);
    
    // In a real implementation, this would:
    // - Send immediate notifications to development team
    // - Create high-priority tickets
    // - Schedule emergency review
    // - Potentially pause rollout for affected features
  }

  // Collect usage metrics
  public async collectMetrics(groupId: string, metrics: Partial<BetaTestMetrics>): Promise<void> {
    const group = this.betaGroups.get(groupId);
    if (!group) return;

    // Merge new metrics with existing ones
    group.metrics = this.mergeMetrics(group.metrics, metrics);
    
    console.log(`📊 Metrics updated for ${group.name}`);
  }

  // Record user session
  public async recordSession(participantId: string, sessionData: {
    duration: number;
    featuresUsed: string[];
    errors: number;
    completed: boolean;
  }): Promise<void> {
    // Find participant's group
    for (const [groupId, group] of Array.from(this.betaGroups)) {
      const participant = group.participants.find((p: BetaParticipant) => p.id === participantId);
      if (participant) {
        group.metrics.usageStats.totalSessions++;
        group.metrics.usageStats.averageSessionDuration = 
          (group.metrics.usageStats.averageSessionDuration + sessionData.duration) / 2;
        
        // Track feature usage
        sessionData.featuresUsed.forEach(feature => {
          group.metrics.usageStats.featuresUsed[feature] = 
            (group.metrics.usageStats.featuresUsed[feature] || 0) + 1;
        });
        
        // Update completion rate
        const completedSessions = group.metrics.completionRate * group.metrics.usageStats.totalSessions;
        group.metrics.completionRate = 
          (completedSessions + (sessionData.completed ? 1 : 0)) / group.metrics.usageStats.totalSessions;
        
        break;
      }
    }
  }

  // Record performance data
  public async recordPerformance(groupId: string, performance: Omit<PerformanceMetrics, 'date'>): Promise<void> {
    const group = this.betaGroups.get(groupId);
    if (!group) return;

    const performanceRecord: PerformanceMetrics = {
      ...performance,
      date: new Date(),
    };

    group.metrics.performanceMetrics.push(performanceRecord);
    
    // Keep only last 30 days of performance data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    group.metrics.performanceMetrics = group.metrics.performanceMetrics.filter(
      p => p.date > thirtyDaysAgo
    );

    // Check for performance regressions
    await this.checkPerformanceRegressions(group, performanceRecord);
  }

  // Check for performance regressions
  private async checkPerformanceRegressions(group: BetaTestGroup, latest: PerformanceMetrics): Promise<void> {
    const recent = group.metrics.performanceMetrics.slice(-7); // Last 7 records
    if (recent.length < 3) return;

    const avgLoadTime = recent.reduce((sum, p) => sum + p.pageLoadTime, 0) / recent.length;
    const avgCheckInTime = recent.reduce((sum, p) => sum + p.checkInTime, 0) / recent.length;

    // Alert if performance degraded significantly
    if (latest.pageLoadTime > avgLoadTime * 1.5) {
      console.log(`⚠️  Performance regression detected in ${group.name}: Page load time increased to ${latest.pageLoadTime}ms`);
    }

    if (latest.checkInTime > avgCheckInTime * 1.5) {
      console.log(`⚠️  Performance regression detected in ${group.name}: Check-in time increased to ${latest.checkInTime}ms`);
    }

    if (latest.crashCount > 0) {
      console.log(`🚨 Crashes detected in ${group.name}: ${latest.crashCount} crashes reported`);
    }
  }

  // Generate feedback report
  public generateFeedbackReport(): {
    summary: FeedbackSummary;
    topIssues: BetaFeedback[];
    recommendations: string[];
  } {
    const allFeedback = Array.from(this.betaGroups.values())
      .flatMap(group => group.participants.flatMap(p => p.feedback));

    const summary: FeedbackSummary = {
      total: allFeedback.length,
      byCategory: this.groupBy(allFeedback, 'category'),
      bySeverity: this.groupBy(allFeedback, 'severity'),
      byFeature: this.groupBy(allFeedback, 'feature'),
      resolved: allFeedback.filter(f => f.resolved).length,
    };

    // Get top issues (high severity, unresolved)
    const topIssues = allFeedback
      .filter(f => !f.resolved && (f.severity === 'high' || f.severity === 'critical'))
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
      .slice(0, 10);

    // Generate recommendations
    const recommendations = this.generateRecommendationsFromFeedback(allFeedback);

    return { summary, topIssues, recommendations };
  }

  // Generate usage analytics
  public generateUsageAnalytics(): {
    overallStats: UsageStats;
    groupComparisons: Array<{ group: string; stats: UsageStats }>;
    insights: string[];
  } {
    const allGroups = Array.from(this.betaGroups.values());
    
    // Calculate overall stats
    const overallStats = this.calculateOverallUsageStats(allGroups);
    
    // Group comparisons
    const groupComparisons = allGroups.map(group => ({
      group: group.name,
      stats: group.metrics.usageStats,
    }));

    // Generate insights
    const insights = this.generateUsageInsights(allGroups);

    return { overallStats, groupComparisons, insights };
  }

  // Mobile optimization report
  public generateMobileReport(): {
    mobileUsers: number;
    mobileIssues: BetaFeedback[];
    performanceComparison: { desktop: number; mobile: number };
    recommendations: string[];
  } {
    const allGroups = Array.from(this.betaGroups.values());
    const allParticipants = allGroups.flatMap(g => g.participants);
    
    const mobileUsers = allParticipants.filter(p => 
      p.device.includes('iPhone') || 
      p.device.includes('Android') || 
      p.device.includes('iPad')
    ).length;

    const mobileIssues = allGroups.flatMap(g => g.participants.flatMap(p => p.feedback))
      .filter(f => f.deviceInfo.mobile);

    // Simulate performance comparison
    const performanceComparison = {
      desktop: 1200, // ms average load time
      mobile: 2400,  // ms average load time
    };

    const recommendations = [
      'Optimize image loading for mobile devices',
      'Implement lazy loading for list views',
      'Add offline capability for core features',
      'Improve touch target sizes for better usability',
      'Test with slower network conditions',
    ];

    return { mobileUsers, mobileIssues, performanceComparison, recommendations };
  }

  // Helper methods
  private createEmptyMetrics(): BetaTestMetrics {
    return {
      usageStats: {
        totalSessions: 0,
        averageSessionDuration: 0,
        featuresUsed: {},
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        retention: { day1: 0, day7: 0, day30: 0 },
      },
      performanceMetrics: [],
      errorRate: 0,
      crashRate: 0,
      userSatisfaction: 0,
      completionRate: 0,
      timeToComplete: {},
      dropoffPoints: [],
    };
  }

  private mergeMetrics(existing: BetaTestMetrics, updates: Partial<BetaTestMetrics>): BetaTestMetrics {
    return {
      ...existing,
      ...updates,
      usageStats: {
        ...existing.usageStats,
        ...updates.usageStats,
      },
      performanceMetrics: [
        ...existing.performanceMetrics,
        ...(updates.performanceMetrics || []),
      ],
    };
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateRecommendationsFromFeedback(feedback: BetaFeedback[]): string[] {
    const recommendations: string[] = [];
    
    // Analyze common issues
    const usabilityIssues = feedback.filter(f => f.category === 'usability').length;
    const performanceIssues = feedback.filter(f => f.category === 'performance').length;
    const bugReports = feedback.filter(f => f.category === 'bug').length;

    if (usabilityIssues > feedback.length * 0.3) {
      recommendations.push('Conduct UX review and simplify complex workflows');
    }

    if (performanceIssues > feedback.length * 0.2) {
      recommendations.push('Optimize application performance, especially on mobile devices');
    }

    if (bugReports > feedback.length * 0.1) {
      recommendations.push('Increase testing coverage and implement better error handling');
    }

    // Feature-specific recommendations
    const featureIssues = this.groupBy(feedback, 'feature');
    Object.entries(featureIssues).forEach(([feature, count]) => {
      if (count > 3) {
        recommendations.push(`Review ${feature} feature for usability improvements`);
      }
    });

    return recommendations;
  }

  private calculateOverallUsageStats(groups: BetaTestGroup[]): UsageStats {
    const totalUsers = groups.reduce((sum, g) => sum + g.participants.length, 0);
    const totalSessions = groups.reduce((sum, g) => sum + g.metrics.usageStats.totalSessions, 0);
    
    return {
      totalSessions,
      averageSessionDuration: groups.reduce((sum, g) => sum + g.metrics.usageStats.averageSessionDuration, 0) / groups.length,
      featuresUsed: groups.reduce((acc, g) => {
        Object.entries(g.metrics.usageStats.featuresUsed).forEach(([feature, count]) => {
          acc[feature] = (acc[feature] || 0) + count;
        });
        return acc;
      }, {} as Record<string, number>),
      dailyActiveUsers: totalUsers,
      weeklyActiveUsers: totalUsers,
      retention: {
        day1: 0.85,
        day7: 0.72,
        day30: 0.64,
      },
    };
  }

  private generateUsageInsights(groups: BetaTestGroup[]): string[] {
    const insights: string[] = [];
    
    // Compare group performance
    const completionRates = groups.map(g => g.metrics.completionRate);
    const avgCompletion = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
    
    if (avgCompletion < 0.8) {
      insights.push('Task completion rate is below 80% - consider simplifying workflows');
    }

    // Analyze feature usage
    const allFeatureUsage = groups.reduce((acc, g) => {
      Object.entries(g.metrics.usageStats.featuresUsed).forEach(([feature, count]) => {
        acc[feature] = (acc[feature] || 0) + count;
      });
      return acc;
    }, {} as Record<string, number>);

    const sortedFeatures = Object.entries(allFeatureUsage).sort(([,a], [,b]) => b - a);
    const leastUsedFeature = sortedFeatures[sortedFeatures.length - 1];
    
    if (leastUsedFeature && leastUsedFeature[1] < 5) {
      insights.push(`${leastUsedFeature[0]} feature has low adoption - consider improving discoverability`);
    }

    return insights;
  }

  // Get all beta groups
  public getBetaGroups(): Map<string, BetaTestGroup> {
    return this.betaGroups;
  }

  // Get pending feedback
  public getPendingFeedback(): BetaFeedback[] {
    return this.feedbackQueue.filter(f => !f.resolved);
  }
}

interface FeedbackSummary {
  total: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byFeature: Record<string, number>;
  resolved: number;
}