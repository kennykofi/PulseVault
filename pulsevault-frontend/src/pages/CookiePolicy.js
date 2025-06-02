import React from "react";
import "./CookiePolicy.css";

function CookiePolicy() {
  return (
    <div className="cookie-policy">
      <div className="policy-container">
        <h1>
          <span role="img" aria-label="cookie">🍪</span> Cookie Policy
        </h1>
        <p className="last-updated">Last updated: May 15, 2025</p>

        <p>
          PulseVault uses cookies to improve user experience, analyze performance, and enhance the security of our prototype platform.
        </p>

        <h2>What are cookies?</h2>
        <p>
          Cookies are small text files stored on your device by websites you visit. They help websites remember your actions and preferences over time.
        </p>

        <h2>How we use cookies</h2>
        <ul>
          <li><strong>Essential Cookies</strong>: Necessary for the site to function (e.g. login, session).</li>
          <li><strong>Performance Cookies</strong>: Collect anonymous analytics to improve the site.</li>
          <li><strong>Functionality Cookies</strong>: Remember user preferences to personalize experience.</li>
        </ul>

        <h2>Consequences of rejecting cookies</h2>
        <p>If you choose to reject cookies, please note the following limitations:</p>
        <ul>
          <li><strong>You will not be able to register or log in</strong> - session cookies are essential.</li>
          <li>Your preferences (dark mode, chart data, language) <strong>will not be saved</strong>.</li>
          <li>Analytics data will not be collected, limiting our ability to improve the app’s performance.</li>
        </ul>

        <h2>Managing cookies</h2>
        <p>
          You can choose to accept or reject non-essential cookies at any time using our <strong>Cookie Settings</strong> on the banner.
          You can also clear cookies through your browser settings.
        </p>

        <h2>Optional UI behavior</h2>
        <p>
          If a user declines essential cookies:
        </p>
        <ul>
          <li>They will be <strong>blocked from accessing login or signup</strong> routes.</li>
          <li>
            A modal/banner will appear explaining: <em>"Essential cookies are required to create an account or access the dashboard."</em>
          </li>
        </ul>

        <h2>Contact</h2>
        <p>
          If you have questions about this policy, contact us at: <a href="mailto:team@pulsevault.io">team@pulsevault.io</a>
        </p>
      </div>
    </div>
  );
}

export default CookiePolicy;
