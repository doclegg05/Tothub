import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - TotHub',
  description: 'Choose the perfect TotHub plan for your daycare. Flexible pricing options designed to grow with your business.',
}

export default function PricingPage() {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-base font-semibold leading-7 text-primary-600">Pricing</h1>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the right plan for your daycare
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Start with our free plan and scale up as your daycare grows. All plans include our core features with no hidden fees.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* Free Plan */}
          <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
            <div>
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">Free</h3>
                <p className="rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">Most popular</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">Perfect for small daycares just getting started.</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">$0</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Up to 10 children
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Basic attendance tracking
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Email support
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Basic reporting
                </li>
              </ul>
            </div>
            <a href="/demo" className="mt-8 block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
              Get started
            </a>
          </div>

          {/* Professional Plan */}
          <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
            <div>
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">Professional</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">Ideal for growing daycares with multiple classrooms.</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">$29</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Up to 50 children
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Biometric authentication
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Compliance tracking
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Advanced analytics
                </li>
              </ul>
            </div>
            <a href="/demo" className="mt-8 block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
              Get started
            </a>
          </div>

          {/* Enterprise Plan */}
          <div className="flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10">
            <div>
              <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">Enterprise</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-600">For large daycare chains and multi-location operations.</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">$99</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
              </p>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Unlimited children
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Multi-location support
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Custom integrations
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  24/7 phone support
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Dedicated account manager
                </li>
              </ul>
            </div>
            <a href="/demo" className="mt-8 block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
              Get started
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}