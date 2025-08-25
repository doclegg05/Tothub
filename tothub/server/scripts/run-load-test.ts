import { LoadTestingService, type LoadTestConfig } from "../services/loadTestingService";

async function main() {
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";

  const config: LoadTestConfig = {
    baseUrl,
    concurrent: 5,
    duration: 10,
    rampUp: 2,
    scenarios: [
      {
        name: "Health and Staff",
        weight: 70,
        requests: [
          { method: "GET", path: "/api/health" },
          { method: "GET", path: "/api/staff" },
          { method: "GET", path: "/api/schedules" },
        ],
      },
      {
        name: "Schedules Only",
        weight: 30,
        requests: [
          { method: "GET", path: "/api/schedules" },
        ],
      },
    ],
  };

  const service = LoadTestingService.getInstance();
  const results = await service.runLoadTest(config);
  const recommendations = service.generateRecommendations(results);

  // Output concise JSON for automation
  const summary: any = {};
  results.forEach((r, k) => {
    summary[k] = {
      totalRequests: r.totalRequests,
      successfulRequests: r.successfulRequests,
      failedRequests: r.failedRequests,
      avgMs: Math.round(r.averageResponseTime),
      p95Ms: Math.round(r.percentiles.p95),
      rps: Number(r.requestsPerSecond.toFixed(2)),
    };
  });

  // Print results
  console.log(JSON.stringify({ baseUrl, summary, recommendations }, null, 2));
}

main().catch((err) => {
  console.error("Load test failed:", err);
  process.exit(1);
});















