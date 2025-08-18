import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resources - TotHub',
  description: 'Access helpful resources, guides, and documentation to get the most out of TotHub daycare management platform.',
}

export default function ResourcesPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Resources & Support
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Everything you need to succeed with TotHub. From getting started guides to advanced tutorials and best practices.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Getting Started */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Getting Started</h3>
                    <p className="text-sm text-gray-500">Quick start guides and tutorials</p>
                  </div>
                </div>
                <div className="mt-6">
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li>• Setup your first daycare</li>
                    <li>• Add children and staff</li>
                    <li>• Configure biometric devices</li>
                    <li>• First day checklist</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <a href="#" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    View guides →
                  </a>
                </div>
              </div>
            </div>

            {/* User Manual */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.523 18.246 19 16.5 19c-1.746 0-3.332-.477-4.5-1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">User Manual</h3>
                    <p className="text-sm text-gray-500">Complete feature documentation</p>
                  </div>
                </div>
                <div className="mt-6">
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li>• Feature walkthroughs</li>
                    <li>• Best practices</li>
                    <li>• Troubleshooting</li>
                    <li>• Advanced features</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <a href="#" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    Read manual →
                  </a>
                </div>
              </div>
            </div>

            {/* Video Tutorials */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Video Tutorials</h3>
                    <p className="text-sm text-gray-500">Step-by-step video guides</p>
                  </div>
                </div>
                <div className="mt-6">
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li>• Setup videos</li>
                    <li>• Feature demonstrations</li>
                    <li>• Tips and tricks</li>
                    <li>• Live Q&A sessions</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <a href="#" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    Watch videos →
                  </a>
                </div>
              </div>
            </div>

            {/* Compliance Guides */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Compliance Guides</h3>
                    <p className="text-sm text-gray-500">Stay compliant with regulations</p>
                  </div>
                </div>
                <div className="mt-6">
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li>• State regulations</li>
                    <li>• Licensing requirements</li>
                    <li>• Safety standards</li>
                    <li>• Audit preparation</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <a href="#" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    View guides →
                  </a>
                </div>
              </div>
            </div>

            {/* API Documentation */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">API Documentation</h3>
                    <p className="text-sm text-gray-500">Integrate with your systems</p>
                  </div>
                </div>
                <div className="mt-6">
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li>• REST API reference</li>
                    <li>• Authentication</li>
                    <li>• Code examples</li>
                    <li>• Webhook setup</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <a href="#" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    View API docs →
                  </a>
                </div>
              </div>
            </div>

            {/* Community */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Community</h3>
                    <p className="text-sm text-gray-500">Connect with other users</p>
                  </div>
                </div>
                <div className="mt-6">
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li>• User forums</li>
                    <li>• Feature requests</li>
                    <li>• Success stories</li>
                    <li>• Networking events</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <a href="#" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    Join community →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-20 bg-gray-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Need Help?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Our support team is here to help you succeed with TotHub.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <a
                href="#"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Contact Support
              </a>
              <a
                href="#"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Schedule a Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}