import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: October 13, 2025
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  At Testcraft World, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our blogging platform.
                </p>

                <h3 className="text-lg font-medium text-foreground mt-6 mb-2">Personal Information</h3>
                <p>
                  We may collect personal information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Name and contact information</li>
                  <li>Account credentials (username, email, password)</li>
                  <li>Profile information and preferences</li>
                  <li>Content you create and publish</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mt-6 mb-2">Usage Data</h3>
                <p>
                  We automatically collect certain information about your device and usage:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>IP address and location information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent</li>
                  <li>Device information and screen resolution</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We use the collected information for the following purposes:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Provide Services:</strong> To operate and maintain our blogging platform</li>
                  <li><strong>Account Management:</strong> To create and manage your account</li>
                  <li><strong>Content Delivery:</strong> To publish and distribute your content</li>
                  <li><strong>SEO Optimization:</strong> To improve search engine visibility</li>
                  <li><strong>Analytics:</strong> To understand usage patterns and improve our services</li>
                  <li><strong>Communication:</strong> To send important updates and notifications</li>
                  <li><strong>Legal Compliance:</strong> To comply with legal obligations</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
                  <li><strong>Service Providers:</strong> With trusted third-party service providers who assist our operations</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure server infrastructure</li>
                </ul>
                <p className="mt-4">
                  However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We use cookies and similar technologies to enhance your experience on our platform:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p className="mt-4">
                  You can control cookie settings through your browser preferences. However, disabling certain cookies may affect platform functionality.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request transfer of your data</li>
                  <li><strong>Objection:</strong> Object to processing of your information</li>
                  <li><strong>Restriction:</strong> Request limitation of processing</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us using the information provided below.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p><strong>Email:</strong> world@testcraft.in</p>
                  <p><strong>Address:</strong> Testcraft World Privacy Team</p>
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