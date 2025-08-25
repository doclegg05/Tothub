import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Security - TotHub',
  description: 'Learn about TotHub\'s enterprise-grade security measures, data protection, compliance standards, and incident response procedures for daycare management.',
}

export default function SecurityPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Enterprise-Grade Security
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your data security is our top priority. TotHub implements industry-leading security measures to protect sensitive information and ensure compliance with childcare regulations.
          </p>
        </div>

        <div className="mt-20">
          <div className="space-y-20">
            {/* Multi-Factor Authentication */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Multi-Factor Authentication (2FA)
                </h3>
                <p className="mt-3 max-w-3xl text-lg text-gray-500">
                  Enhanced security for administrators and staff with mandatory 2FA implementation. Protect your account with multiple layers of authentication including SMS, email, and authenticator apps.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Admin 2FA Required:</strong> All administrative accounts must use 2FA
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Multiple Methods:</strong> SMS, email, and authenticator app support
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Biometric Integration:</strong> Fingerprint and facial recognition support
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-4">Multi-Factor Authentication</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-Based Access Control */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="lg:col-start-2">
                <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Role-Based Access Control (RBAC)
                </h3>
                <p className="mt-3 max-w-3xl text-lg text-gray-500">
                  Granular access control with predefined roles and custom permissions. Ensure staff only access the data and features they need for their specific responsibilities.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Predefined Roles:</strong> Director, Teacher, Staff, Parent with appropriate permissions
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Custom Permissions:</strong> Tailor access levels to your specific needs
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>API Route Protection:</strong> Secure endpoints based on user roles
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0 lg:col-start-1">
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="mt-4">Role-Based Access Control</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Encryption & Data Protection */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  End-to-End Encryption
                </h3>
                <p className="mt-3 max-w-3xl text-lg text-gray-500">
                  Military-grade encryption protecting your data both in transit and at rest. All sensitive information is encrypted using AES-256-GCM with secure key management.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>AES-256-GCM:</strong> Industry-standard encryption for sensitive data
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>TLS 1.3:</strong> Latest transport layer security for data in transit
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Biometric Hashing:</strong> Irreversible hashes for fingerprint and facial data
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Secure Key Management:</strong> Enterprise-grade key storage and rotation
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="mt-4">Encryption at Rest & in Transit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Backup & Recovery */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="lg:col-start-2">
                <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Secure Backup & Recovery
                </h3>
                <p className="mt-3 max-w-3xl text-lg text-gray-500">
                  Comprehensive backup strategies with encrypted storage and regular testing. Ensure business continuity with automated backup procedures and documented recovery processes.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Encrypted Backups:</strong> AES-256 encryption for all backup data
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Offsite Storage:</strong> Secure cloud storage with geographic redundancy
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Automated Testing:</strong> Regular backup integrity verification
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Recovery Procedures:</strong> Documented disaster recovery plans
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0 lg:col-start-1">
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="mt-4">Secure Backup & Recovery</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Incident Response */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Incident Response & Breach Notification
                </h3>
                <p className="mt-3 max-w-3xl text-lg text-gray-500">
                  Comprehensive incident response procedures with real-time monitoring and automated alerts. Meet regulatory requirements with 72-hour notification compliance and transparent communication protocols.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Real-time Monitoring:</strong> 24/7 suspicious activity detection
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>72-Hour Notification:</strong> GDPR and regulatory compliance
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Automated Response:</strong> Immediate containment procedures
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Post-Incident Review:</strong> Comprehensive analysis and improvement
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="mt-4">Incident Response & Monitoring</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance & Standards */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="lg:col-start-2">
                <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Compliance & Industry Standards
                </h3>
                <p className="mt-3 max-w-3xl text-lg text-gray-500">
                  Meet and exceed industry security standards with comprehensive compliance frameworks. TotHub is designed to help you maintain compliance with childcare regulations and data protection laws.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Childcare Regulations:</strong> State-specific compliance requirements
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Data Protection:</strong> COPPA, HIPAA, FERPA compliance
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Audit Logging:</strong> Comprehensive activity tracking
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Industry Compliance:</strong> Meet all childcare industry standards
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Regular Audits:</strong> Quarterly security assessments
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0 lg:col-start-1">
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-4">Compliance & Standards</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subprocessors */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Subprocessors & Third-Party Services
                </h3>
                <p className="mt-3 max-w-3xl text-lg text-gray-500">
                  Transparent disclosure of all third-party services and subprocessors used by TotHub. We maintain strict data processing agreements and ensure all partners meet our security standards.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Data Processing Agreements:</strong> GDPR-compliant contracts with all subprocessors
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Security Standards:</strong> All partners must meet our security requirements
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Regular Audits:</strong> Ongoing assessment of subprocessor security
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-700">
                      <strong>Transparency:</strong> Complete list available upon request
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-gray-100 rounded-lg p-8">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="mt-4">Subprocessors & Third-Party Services</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Contact Section */}
        <div className="mt-20 bg-gray-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Security Contact Information</h2>
            <p className="mt-4 text-lg text-gray-600">
              For security issues, vulnerabilities, or breach notifications, contact our security team immediately.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Emergency Security Issues</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    For immediate security concerns or active breaches
                  </p>
                  <p className="mt-2 text-sm font-medium text-red-600">
                    security-emergency@tothub.com
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Vulnerability Reports</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    For security researchers and bug reports
                  </p>
                  <p className="mt-2 text-sm font-medium text-yellow-600">
                    security@tothub.com
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Compliance & Legal</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    For compliance questions and legal matters
                  </p>
                  <p className="mt-2 text-sm font-medium text-blue-600">
                    compliance@tothub.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features Grid */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Additional Security Features
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Real-time Monitoring</h3>
                  <p className="text-sm text-gray-500">24/7 security monitoring and alerting</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Penetration Testing</h3>
                  <p className="text-sm text-gray-500">Quarterly security assessments</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Input Protection</h3>
                  <p className="text-sm text-gray-500">XSS and SQL injection prevention</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-6 6m6-6l6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">File Upload Security</h3>
                  <p className="text-sm text-gray-500">Secure file validation and scanning</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Performance Monitoring</h3>
                  <p className="text-sm text-gray-500">Real-time system health monitoring</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.523 18.246 19 16.5 19c-1.746 0-3.332-.477-4.5-1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Data Retention</h3>
                  <p className="text-sm text-gray-500">Compliant data lifecycle management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}