import type { Metadata } from 'next';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Cookie Policy | Al Ghawas A/C Refrigeration Contracting LLC',
  description: 'Learn how Al Ghawas A/C uses cookies and tracking technologies on our website, and how you can manage your cookie preferences.',
};

const TOC = [
  { id: 'what', title: '1. What Are Cookies?' },
  { id: 'types', title: '2. Types of Cookies We Use' },
  { id: 'essential', title: '3. Essential Cookies' },
  { id: 'analytics', title: '4. Analytics Cookies' },
  { id: 'advertising', title: '5. Advertising Cookies' },
  { id: 'functional', title: '6. Functional Cookies' },
  { id: 'control', title: '7. How to Control Cookies' },
  { id: 'consent', title: '8. Your Cookie Consent' },
  { id: 'changes', title: '9. Changes to This Policy' },
  { id: 'contact', title: '10. Contact Us' },
];

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="24 June 2026" version="1.0" toc={TOC}>
      <section id="what">
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device (computer, tablet, or smartphone) when you visit a website. They help websites recognise your device on subsequent visits and store preferences or behaviour data to improve your experience.
        </p>
        <p>
          Similar technologies such as local storage, session storage, and pixel tags work in comparable ways and may be used alongside cookies.
        </p>
      </section>

      <section id="types" className="mt-8">
        <h2>2. Types of Cookies We Use</h2>
        <p>
          We use four categories of cookies on <strong>www.alghawasac.com</strong>:
        </p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2.5 text-left">Category</th>
                <th className="px-4 py-2.5 text-left">Purpose</th>
                <th className="px-4 py-2.5 text-left">Required?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-white">
                <td className="px-4 py-3 font-semibold text-gray-900">Essential</td>
                <td className="px-4 py-3 text-gray-600">Core website functionality, security, forms</td>
                <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">Always On</span></td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">Analytics</td>
                <td className="px-4 py-3 text-gray-600">Measure visits, traffic, and user behaviour</td>
                <td className="px-4 py-3"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">Consent Required</span></td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-3 font-semibold text-gray-900">Advertising</td>
                <td className="px-4 py-3 text-gray-600">Ad tracking, retargeting, campaign measurement</td>
                <td className="px-4 py-3"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">Consent Required</span></td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-900">Functional</td>
                <td className="px-4 py-3 text-gray-600">Preferences, widgets, and enhanced features</td>
                <td className="px-4 py-3"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">Consent Required</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="essential" className="mt-8">
        <h2>3. Essential Cookies</h2>
        <p>
          Essential cookies are necessary for the website to function properly and cannot be disabled. They do not store any personally identifiable information. These include:
        </p>
        <ul>
          <li><strong>Session management</strong> — maintain your session state while browsing</li>
          <li><strong>Security tokens</strong> — protect against cross-site request forgery (CSRF) and form abuse</li>
          <li><strong>Cookie consent storage</strong> — remember your cookie preferences (stored in localStorage)</li>
          <li><strong>Admin authentication</strong> — secure login sessions for authorised admin users only</li>
        </ul>
      </section>

      <section id="analytics" className="mt-8">
        <h2>4. Analytics Cookies</h2>
        <p>
          With your consent, we use analytics tools to understand how visitors use our website. This helps us improve content, navigation, and form performance.
        </p>
        <ul>
          <li>
            <strong>Google Analytics 4</strong> (Measurement ID: G-XXXXXXXXXX)<br />
            Collects anonymised data about page views, sessions, device types, and traffic sources. Managed through Google Tag Manager.<br />
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sm">Google Privacy Policy →</a>
          </li>
          <li className="mt-3">
            <strong>Google Tag Manager</strong> (Container ID: GTM-XXXXXXX)<br />
            A tag management system used to deploy and manage tracking scripts efficiently. GTM itself does not set cookies but manages scripts that may do so.
          </li>
        </ul>
      </section>

      <section id="advertising" className="mt-8">
        <h2>5. Advertising Cookies</h2>
        <p>
          With your consent, we use advertising tracking tools to measure the performance of our paid advertising campaigns and to enable relevant retargeting. These tools may share data with advertising networks.
        </p>
        <ul>
          <li>
            <strong>Google Ads Conversion Tracking</strong> (Conversion ID: AW-XXXXXXXXX)<br />
            Measures when a customer submits a quote form or contacts us after clicking a Google Ad. This helps us understand which keywords and ads generate enquiries.<br />
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sm">Google Privacy Policy →</a>
          </li>
          <li className="mt-3">
            <strong>Meta Pixel (Facebook Pixel)</strong> (Pixel ID: META-PIXEL-ID)<br />
            Tracks page visits and form submissions from visitors who arrived via Meta (Facebook/Instagram) ads. May be used for retargeting and lookalike audiences on Meta platforms.<br />
            <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-sm">Meta Privacy Policy →</a>
          </li>
        </ul>
        <p className="mt-3 text-sm bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800">
          <strong>Note:</strong> These advertising tools are only activated if you accept advertising cookies via our cookie banner. If you decline, they are not loaded.
        </p>
      </section>

      <section id="functional" className="mt-8">
        <h2>6. Functional Cookies</h2>
        <p>
          Functional cookies enable enhanced features and personalisation. With your consent, these may include:
        </p>
        <ul>
          <li><strong>Language and region preferences</strong> — remember your preferred language or area</li>
          <li><strong>WhatsApp widget settings</strong> — for the WhatsApp contact widget</li>
          <li><strong>Calculator preferences</strong> — BTU or quote calculator inputs that may be retained in session</li>
        </ul>
      </section>

      <section id="control" className="mt-8">
        <h2>7. How to Control Cookies</h2>
        <h3>Via Our Cookie Banner</h3>
        <p>
          When you first visit our website, a cookie consent banner appears. You can:
        </p>
        <ul>
          <li><strong>Accept All</strong> — enable all cookie categories</li>
          <li><strong>Reject Non-Essential</strong> — allow only essential cookies</li>
          <li><strong>Customize</strong> — choose which specific categories to allow</li>
        </ul>
        <p>
          You can update your preferences at any time by clearing your browser&apos;s localStorage (the consent record is stored with the key <code>ag_cookie_consent</code>) and refreshing the page.
        </p>

        <h3>Via Your Browser</h3>
        <p>
          You can also control cookies directly through your browser settings. Instructions for common browsers:
        </p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
        </ul>
        <p>
          Please note that disabling certain cookies may affect the functionality of the website or prevent forms from working correctly.
        </p>

        <h3>Opt-Out of Analytics / Advertising</h3>
        <ul>
          <li>Google Analytics opt-out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a></li>
          <li>Google Ads personalisation: <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a></li>
          <li>Meta advertising opt-out: <a href="https://www.facebook.com/ads/preferences" target="_blank" rel="noopener noreferrer">Meta Ad Preferences</a></li>
        </ul>
      </section>

      <section id="consent" className="mt-8">
        <h2>8. Your Cookie Consent</h2>
        <p>
          Your consent choices are stored locally on your device (in localStorage). We do not share consent decisions with third parties other than to deactivate non-essential cookies when consent is declined.
        </p>
        <p>
          Consent is versioned — if we update our cookie practices significantly, we may ask you to review and re-confirm your preferences.
        </p>
      </section>

      <section id="changes" className="mt-8">
        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Cookie Policy to reflect changes in technologies we use or regulatory requirements. The &quot;Last Updated&quot; date above will be updated accordingly.
        </p>
      </section>

      <section id="contact" className="mt-8">
        <h2>10. Contact Us</h2>
        <p>
          For any questions about our use of cookies:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:info@alghawasac.com">info@alghawasac.com</a></li>
          <li><strong>Phone:</strong> <a href="tel:+971506725808">+971-50-672-5808</a></li>
          <li><strong>Address:</strong> Building No.238, Mohamed Bin Zayed City, ME-11, Abu Dhabi, UAE</li>
        </ul>
      </section>
    </LegalPageLayout>
  );
}
