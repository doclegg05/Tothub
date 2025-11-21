import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Terms of Service - TotHub',
    description: 'TotHub terms of service. Read our terms and conditions for using the platform.',
}

export default function TermsPage() {
    return (
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Terms of Service</h1>

                <div className="prose prose-blue max-w-none">
                    <p className="text-lg text-gray-600 mb-8">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-700 mb-4">
                            By accessing and using TotHub ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
                        <p className="text-gray-700 mb-4">
                            Permission is granted to temporarily access and use the Service for personal or commercial daycare management purposes. This license shall automatically terminate if you violate any of these restrictions.
                        </p>
                        <p className="text-gray-700 mb-4">
                            You may not:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Modify or copy the materials</li>
                            <li>Use the materials for any commercial purpose without authorization</li>
                            <li>Attempt to decompile or reverse engineer any software</li>
                            <li>Remove any copyright or proprietary notations</li>
                            <li>Transfer the materials to another person</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                        <p className="text-gray-700 mb-4">
                            When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.
                        </p>
                        <p className="text-gray-700 mb-4">
                            You are responsible for:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Safeguarding your password</li>
                            <li>All activities that occur under your account</li>
                            <li>Notifying us immediately of any unauthorized use</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Service Availability</h2>
                        <p className="text-gray-700 mb-4">
                            We strive to provide 99.9% uptime but do not guarantee that the Service will be uninterrupted, timely, secure, or error-free. We reserve the right to modify or discontinue the Service with or without notice.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
                        <p className="text-gray-700 mb-4">
                            Certain aspects of the Service are provided for a fee. You agree to pay all fees associated with your subscription plan. All fees are non-refundable unless otherwise stated.
                        </p>
                        <p className="text-gray-700 mb-4">
                            We reserve the right to change our pricing with 30 days notice to existing customers.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Protection</h2>
                        <p className="text-gray-700 mb-4">
                            Your use of the Service is also governed by our Privacy Policy. We are committed to protecting your data in accordance with GDPR, COPPA, and HIPAA regulations.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
                        <p className="text-gray-700 mb-4">
                            In no event shall TotHub or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
                        <p className="text-gray-700 mb-4">
                            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including breach of these Terms.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
                        <p className="text-gray-700 mb-4">
                            These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
                        <p className="text-gray-700 mb-4">
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <p className="text-gray-700">
                            Email: <a href="mailto:legal@thetothub.com" className="text-primary-600 hover:text-primary-700">legal@thetothub.com</a>
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
