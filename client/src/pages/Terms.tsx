import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: October 13, 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Welcome to Testcraft World. These Terms of Service ("Terms") govern your use of our blogging platform and services. By accessing or using Testcraft World, you agree to be bound by these Terms.
                </p>
                <p>
                  If you do not agree to these Terms, please do not use our platform. We reserve the right to modify these Terms at any time, with changes taking effect immediately upon posting.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Testcraft World is a comprehensive blogging platform that provides:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Content creation and publishing tools</li>
                  <li>SEO optimization features</li>
                  <li>AdSense integration capabilities</li>
                  <li>Analytics and performance tracking</li>
                  <li>Community features and social sharing</li>
                  <li>Multi-category content organization</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="text-lg font-medium text-foreground mt-6 mb-2">Account Creation</h3>
                <p>
                  To use certain features of our platform, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-6 mb-2">Account Termination</h3>
                <p>
                  We reserve the right to suspend or terminate your account at any time for violations of these Terms or for other reasons we deem necessary to protect our platform and community.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Content Ownership and Rights</h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="text-lg font-medium text-foreground mt-6 mb-2">Your Content</h3>
                <p>
                  You retain ownership of all content you create and publish on Testcraft World. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on our platform.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-6 mb-2">Content Standards</h3>
                <p>
                  You agree not to post content that:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Violates any applicable laws or regulations</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains harmful, offensive, or inappropriate material</li>
                  <li>Includes malware or harmful code</li>
                  <li>Violates the privacy rights of others</li>
                  <li>Promotes illegal activities</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Spam:</strong> Post excessive or unsolicited content</li>
                  <li><strong>Harassment:</strong> Harass, threaten, or intimidate other users</li>
                  <li><strong>Impersonation:</strong> Pretend to be someone else or misrepresent your identity</li>
                  <li><strong>Reverse Engineering:</strong> Attempt to reverse engineer or hack our platform</li>
                  <li><strong>Excessive Load:</strong> Overload our servers with automated tools or scripts</li>
                  <li><strong>Commercial Misuse:</strong> Use the platform for unauthorized commercial purposes</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Monetization and Advertising</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Testcraft World supports content monetization through AdSense and other advertising programs. By using these features, you agree to comply with the respective platform's terms and policies.
                </p>
                <p>
                  We may display advertisements on your content and reserve the right to share revenue from these advertisements according to our revenue sharing policies.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  The Testcraft World platform, including its software, design, logos, and content, is protected by intellectual property laws. You may not copy, modify, or distribute our intellectual property without explicit permission.
                </p>
                <p>
                  We respect the intellectual property rights of others and expect our users to do the same. If you believe your intellectual property has been infringed, please contact us.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Testcraft World is provided "as is" without warranties of any kind. We do not guarantee that the platform will be error-free, uninterrupted, or secure. We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  In no event shall Testcraft World be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the platform. Our total liability shall not exceed the amount paid by you for using our services in the past 12 months.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  You agree to indemnify and hold harmless Testcraft World, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the platform or violation of these Terms.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these Terms shall be resolved through binding arbitration.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the platform after changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>Email:</strong> world@testcraft.in</p>
                  <p><strong>Subject:</strong> Terms of Service Inquiry</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}