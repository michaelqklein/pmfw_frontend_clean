export default function MelodyBricksPrivacyPolicyPage() {
  return (
    <div className="reactive-container">
      <h1 className="text-3xl font-bold mb-2">Melody Bricks – Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-6">Last updated: 26th Nov 2025</p>

      <div className="prose max-w-none">
        <p className="text-lg mb-4">
          Melody Bricks is an ear-training game designed by PlayMusicFromWithin Ltd.
        </p>
        <p className="mb-4">
          We respect your privacy and are committed to being transparent about the very limited data our app uses.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Overview</h2>
        <p className="mb-4">
          Melody Bricks does <strong>not</strong> collect, store, or share any personal information.
        </p>
        <p className="mb-4">
          The app does not require users to create an account, does not track your identity, and does not record or upload audio.
          Melody Bricks functions entirely on-device and does not require an internet connection for its core features.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Audio Usage</h2>
        <p className="mb-4">
          Melody Bricks uses audio <strong>only for playback</strong> of musical sounds during gameplay.
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>The app does <strong>not</strong> access the device microphone.</li>
          <li>The app does <strong>not</strong> record, store, or transmit audio.</li>
          <li>All sounds used by the app are pre-recorded audio files packaged with the app itself.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Device Information (Non-Personal Data)</h2>
        <p className="mb-4">
          To ensure audio playback works correctly across different Android devices, Melody Bricks uses third-party libraries
          that may temporarily access <strong>non-personal device information</strong>, such as:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Device model</li>
          <li>Operating system version</li>
          <li>Anonymous device identifiers (e.g., Android device ID or similar hardware identifiers)</li>
        </ul>
        <p className="mb-4">
          This information is:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Processed <strong>ephemerally</strong> (in memory only)</li>
          <li><strong>Not stored</strong> by the app</li>
          <li><strong>Not shared</strong> with any third party</li>
          <li>Used solely to enable correct audio functionality and compatibility</li>
        </ul>
        <p className="mb-4">
          No personal data of any kind is collected.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Storage &amp; Retention</h2>
        <p className="mb-4">
          Melody Bricks does <strong>not</strong> store any user data on the device or on external servers.
        </p>
        <p className="mb-4">
          Any non-personal device information accessed by third-party libraries is processed in real time and discarded
          immediately. There is no user data to delete, transfer, or review.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Children&apos;s Privacy</h2>
        <p className="mb-4">
          Melody Bricks does not collect personal data from anyone, including children. The app is suitable for general
          audiences and does not require user accounts or personal information to function.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Third-Party Services</h2>
        <p className="mb-4">
          Melody Bricks uses the following third-party components:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li><strong>RevenueCat</strong> (for handling in-app subscriptions)</li>
          <li><strong>React Native frameworks and audio libraries</strong></li>
        </ul>
        <p className="mb-4">
          These services may process anonymous device information required for app functionality (for example, device model
          or OS version). Melody Bricks does not provide these services with any personal data.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Changes to This Policy</h2>
        <p className="mb-4">
          We may update this privacy policy from time to time. The most current version will always be available on our
          website.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
        <p className="mb-1 font-semibold">PlayMusicFromWithin Ltd</p>
        <p className="mb-2">
          If you have any questions about this privacy policy, you may contact us via the{' '}
          <a
            href="https://www.playmusicfromwithin.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            contact form
          </a>{' '}
          on our website. We only process the information you choose to provide for the purpose of responding to your
          inquiry.
        </p>
        <p className="mb-4">
          Website:{' '}
          <a
            href="https://www.playmusicfromwithin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            https://www.playmusicfromwithin.com
          </a>
        </p>
      </div>
    </div>
  );
}
