import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Privacy Policy - TotHub',
    description: 'TotHub privacy policy. Learn how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
    return (
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>

                <div className="prose prose-blue max-w-none">
                    <p className="text-lg text-gray-600 mb-8">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                        <p className="text-gray-700 mb-4">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Account information (name, email, password)</li>
                            <li>Daycare facility information</li>
                            <li>Child and parent information (with consent)</li>
                            <li>Usage data and analytics</li>
                            <li>Communication preferences</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                        <p className="text-gray-700 mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process transactions and send related information</li>
                            <li>Send technical notices and support messages</li>
                            <li>Respond to your comments and questions</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
                        <p className="text-gray-700 mb-4">
                            We implement appropriate technical and organizational measures to protect your personal data, including:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>AES-256 encryption for data at rest</li>
                            <li>TLS 1.3 encryption for data in transit</li>
                            <li>Regular security audits and penetration testing</li>
                            <li>Access controls and authentication measures</li>
                            <li>Employee training on data protection</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing</h2>
                        <p className="text-gray-700 mb-4">
                            We do not sell your personal information. We may share your information with:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Service providers who assist in our operations</li>
                            <li>Law enforcement when required by law</li>
                            <li>Other parties with your consent</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
                        <p className="text-gray-700 mb-4">
                            You have the right to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Object to processing of your data</li>
                            <li>Export your data</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Compliance</h2>
                        <p className="text-gray-700 mb-4">
                            TotHub is compliant with:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>GDPR (General Data Protection Regulation)</li>
                            <li>COPPA (Children&apos;s Online Privacy Protection Act)</li>
                            <li>HIPAA (Health Insurance Portability and Accountability Act)</li>
                            <li>SOC 2 Type II standards</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
                        <p className="text-gray-700 mb-4">
                            If you have questions about this Privacy Policy, please contact us at:
                        </p>
                        <p className="text-gray-700">
                            Email: <a href="mailto:privacy@thetothub.com" className="text-primary-600 hover:text-primary-700">privacy@thetothub.com</a>
                        </p>
                    </section>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
                            ← Back to Contact
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
