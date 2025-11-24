import { performance } from 'perf_hooks';

export interface LoadTestConfig {
  baseUrl: string;
  concurrent: number;
  duration: number; // seconds
  rampUp: number; // seconds
  scenarios: LoadTestScenario[];
}

export interface LoadTestScenario {
  name: string;
  weight: number; // percentage
  requests: LoadTestRequest[];
}

export interface LoadTestRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface LoadTestResult {
  scenario: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errors: LoadTestError[];
  percentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

export interface LoadTestError {
  request: LoadTestRequest;
  error: string;
  timestamp: Date;
  responseTime?: number;
}

export class LoadTestingService {
  private static instance: LoadTestingService;
  private activeTests: Map<string, boolean> = new Map();

  public static getInstance(): LoadTestingService {
    if (!LoadTestingService.instance) {
      LoadTestingService.instance = new LoadTestingService();
    }
    return LoadTestingService.instance;
  }

  // Run comprehensive load test
  public async runLoadTest(config: LoadTestConfig): Promise<Map<string, LoadTestResult>> {
    const testId = `test_${Date.now()}`;
    this.activeTests.set(testId, true);

    console.log(`Starting load test: ${testId}`);
    console.log(`Config: ${config.concurrent} concurrent users, ${config.duration}s duration`);

    const results = new Map<string, LoadTestResult>();

    try {
      // Run scenarios in parallel
      const scenarioPromises = config.scenarios.map(scenario => 
        this.runScenario(testId, config, scenario)
      );

      const scenarioResults = await Promise.all(scenarioPromises);
      
      scenarioResults.forEach((result, index) => {
        results.set(config.scenarios[index].name, result);
      });

      console.log(`Load test completed: ${testId}`);
      this.logLoadTestSummary(results);

    } catch (error) {
      console.error(`Load test failed: ${testId}`, error);
    } finally {
      this.activeTests.delete(testId);
    }

    return results;
  }

  // Run individual scenario
  private async runScenario(
    testId: string, 
    config: LoadTestConfig, 
    scenario: LoadTestScenario
  ): Promise<LoadTestResult> {
    const startTime = performance.now();
    const responses: number[] = [];
    const errors: LoadTestError[] = [];
    let successCount = 0;
    let failCount = 0;

    const concurrentUsers = Math.floor(config.concurrent * (scenario.weight / 100));
    const requestsPerUser = Math.floor((config.duration * 10) / concurrentUsers); // ~10 requests per second per user

    console.log(`Running scenario: ${scenario.name} (${concurrentUsers} users, ${requestsPerUser} requests each)`);

    // Create user sessions
    const userPromises: Promise<void>[] = [];
    
    for (let i = 0; i < concurrentUsers; i++) {
      const userDelay = (i / concurrentUsers) * config.rampUp * 1000; // Ramp up delay
      
      userPromises.push(
        this.runUserSession(
          testId,
          config.baseUrl,
          scenario,
          requestsPerUser,
          userDelay,
          responses,
          errors
        )
      );
    }

    await Promise.all(userPromises);

    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds

    successCount = responses.length;
    failCount = errors.length;

    // Calculate statistics
    responses.sort((a, b) => a - b);
    const averageResponseTime = responses.reduce((sum, time) => sum + time, 0) / responses.length || 0;
    const minResponseTime = responses.length > 0 ? responses[0] : 0;
    const maxResponseTime = responses.length > 0 ? responses[responses.length - 1] : 0;
    const requestsPerSecond = (successCount + failCount) / totalTime;

    const percentiles = {
      p50: this.calculatePercentile(responses, 50),
      p90: this.calculatePercentile(responses, 90),
      p95: this.calculatePercentile(responses, 95),
      p99: this.calculatePercentile(responses, 99),
    };

    return {
      scenario: scenario.name,
      totalRequests: successCount + failCount,
      successfulRequests: successCount,
      failedRequests: failCount,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      requestsPerSecond,
      errors,
      percentiles,
    };
  }

  // Run user session (simulate individual user)
  private async runUserSession(
    testId: string,
    baseUrl: string,
    scenario: LoadTestScenario,
    requestCount: number,
    delay: number,
    responses: number[],
    errors: LoadTestError[]
  ): Promise<void> {
    // Wait for ramp-up delay
    if (delay > 0) {
      await this.sleep(delay);
    }

    for (let i = 0; i < requestCount && this.activeTests.get(testId); i++) {
      const request = scenario.requests[i % scenario.requests.length];
      
      try {
        const responseTime = await this.executeRequest(baseUrl, request);
        responses.push(responseTime);
        
        // Add realistic delay between requests (100-500ms)
        await this.sleep(100 + Math.random() * 400);
        
      } catch (error) {
        errors.push({
          request,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        });
      }
    }
  }

  // Execute individual HTTP request
  private async executeRequest(baseUrl: string, request: LoadTestRequest): Promise<number> {
    const startTime = performance.now();
    
    try {
      const url = `${baseUrl}${request.path}`;
      const options: RequestInit = {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers,
        },
        body: request.body ? JSON.stringify(request.body) : undefined,
      };

      const controller = new AbortController();
      const timeout = request.timeout || 30000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Consume response body to simulate real usage
      await response.text();

      return performance.now() - startTime;

    } catch (error) {
      throw new Error(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Calculate percentile
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }

  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Log load test summary
  private logLoadTestSummary(results: Map<string, LoadTestResult>): void {
    console.log('\n=== LOAD TEST SUMMARY ===');
    
    results.forEach((result, scenarioName) => {
      console.log(`\nScenario: ${scenarioName}`);
      console.log(`Total Requests: ${result.totalRequests}`);
      console.log(`Success Rate: ${((result.successfulRequests / result.totalRequests) * 100).toFixed(2)}%`);
      console.log(`Average Response Time: ${result.averageResponseTime.toFixed(2)}ms`);
      console.log(`Requests/Second: ${result.requestsPerSecond.toFixed(2)}`);
      console.log(`P95 Response Time: ${result.percentiles.p95.toFixed(2)}ms`);
      
      if (result.errors.length > 0) {
        console.log(`Errors: ${result.errors.length}`);
        result.errors.slice(0, 5).forEach(error => {
          console.log(`  - ${error.error}`);
        });
      }
    });
  }

  // Predefined load test scenarios for daycare system
  public static getDaycareLoadTestScenarios(): LoadTestScenario[] {
    return [
      {
        name: 'Morning Check-in Rush',
        weight: 60,
        requests: [
          { method: 'GET', path: '/api/children' },
          { method: 'POST', path: '/api/attendance', body: { childId: '123', type: 'checkin' } },
          { method: 'GET', path: '/api/ratios' },
          { method: 'GET', path: '/api/dashboard/stats' },
        ],
      },
      {
        name: 'Parent Communication',
        weight: 20,
        requests: [
          { method: 'GET', path: '/api/messages' },
          { method: 'POST', path: '/api/messages', body: { content: 'Test message', parentId: '456' } },
          { method: 'GET', path: '/api/media-shares' },
        ],
      },
      {
        name: 'Staff Operations',
        weight: 15,
        requests: [
          { method: 'GET', path: '/api/staff' },
          { method: 'GET', path: '/api/staff-schedules/today' },
          { method: 'POST', path: '/api/payroll/timesheet', body: { staffId: '789', type: 'clockin' } },
          { method: 'GET', path: '/api/attendance/present' },
        ],
      },
      {
        name: 'Reporting and Compliance',
        weight: 5,
        requests: [
          { method: 'GET', path: '/api/reports/attendance' },
          { method: 'GET', path: '/api/compliance/ratios/check?state=CA&ageGroup=infant&childCount=4&staffCount=1' },
          { method: 'GET', path: '/api/security/logs' },
        ],
      },
    ];
  }

  // Run morning rush simulation
  public async runMorningRushTest(): Promise<Map<string, LoadTestResult>> {
    const config: LoadTestConfig = {
      baseUrl: 'http://localhost:5000',
      concurrent: 50, // 50 concurrent parents checking in
      duration: 300, // 5 minutes
      rampUp: 60, // Ramp up over 1 minute
      scenarios: [
        {
          name: 'Morning Check-in',
          weight: 100,
          requests: [
            { method: 'GET', path: '/api/children' },
            { method: 'POST', path: '/api/attendance', body: { childId: 'test-child', type: 'checkin', timestamp: new Date().toISOString() } },
            { method: 'GET', path: '/api/ratios' },
          ],
        },
      ],
    };

    return this.runLoadTest(config);
  }

  // Run payroll processing stress test
  public async runPayrollStressTest(): Promise<Map<string, LoadTestResult>> {
    const config: LoadTestConfig = {
      baseUrl: 'http://localhost:5000',
      concurrent: 20,
      duration: 180, // 3 minutes
      rampUp: 30,
      scenarios: [
        {
          name: 'Payroll Processing',
          weight: 100,
          requests: [
            { method: 'GET', path: '/api/payroll/staff' },
            { method: 'GET', path: '/api/payroll/pay-periods' },
            { method: 'POST', path: '/api/payroll/process-period', body: { payPeriodId: 'test-period' } },
            { method: 'GET', path: '/api/payroll/dashboard' },
          ],
        },
      ],
    };

    return this.runLoadTest(config);
  }

  // Performance recommendations based on test results
  public generateRecommendations(results: Map<string, LoadTestResult>): string[] {
    const recommendations: string[] = [];

    results.forEach((result, scenario) => {
      // High error rate
      if (result.failedRequests / result.totalRequests > 0.05) {
        recommendations.push(`${scenario}: High error rate (${((result.failedRequests / result.totalRequests) * 100).toFixed(1)}%). Check server capacity and error handling.`);
      }

      // Slow response times
      if (result.averageResponseTime > 1000) {
        recommendations.push(`${scenario}: Slow response times (${result.averageResponseTime.toFixed(0)}ms avg). Consider caching and database optimization.`);
      }

      // P95 latency issues
      if (result.percentiles.p95 > 5000) {
        recommendations.push(`${scenario}: P95 latency is high (${result.percentiles.p95.toFixed(0)}ms). Check for resource bottlenecks.`);
      }

      // Low throughput
      if (result.requestsPerSecond < 10) {
        recommendations.push(`${scenario}: Low throughput (${result.requestsPerSecond.toFixed(1)} req/s). Consider horizontal scaling.`);
      }
    });

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! Consider monitoring these metrics in production.');
    } else {
      recommendations.push('Consider implementing Redis caching for frequently accessed data.');
      recommendations.push('Optimize database queries with proper indexing.');
      recommendations.push('Implement connection pooling and keep-alive connections.');
      recommendations.push('Consider CDN for static assets.');
    }

    return recommendations;
  }

  // Stop all active tests
  public stopAllTests(): void {
    this.activeTests.forEach((_, testId) => {
      this.activeTests.set(testId, false);
    });
    console.log('Stopping all active load tests...');
  }
}