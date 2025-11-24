import { Button } from "@tothub/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@tothub/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-primary-600 mb-4">
            TotHub Monorepo
          </h1>
          <p className="text-lg text-gray-600">
            Phase 1: Foundation Complete ✅
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Turborepo + Next.js 15 + Shared Packages
          </p>
        </div>

        <Card variant="elevated" className="text-center">
          <CardHeader>
            <CardTitle>Workspace Integration Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This page uses components from{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">@tothub/ui</code>
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" size="md">
                Primary Button
              </Button>
              <Button variant="outline" size="md">
                Outline Button
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
