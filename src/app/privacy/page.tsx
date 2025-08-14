import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer, Header } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Privacy Policy | Product Safety Insights',
  description: 'Privacy policy for Product Safety Insights platform',
};

export default function PrivacyPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We collect information you provide directly to us, such as when you search for
                products or use our services.
              </p>
              <h4 className="font-semibold">Information we may collect includes:</h4>
              <ul className="list-disc space-y-2 pl-6">
                <li>Search queries and product lookups</li>
                <li>Usage data and analytics</li>
                <li>Device and browser information</li>
                <li>IP address and location data (anonymized)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Provide and improve our services</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Ensure the security and integrity of our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third
                parties without your consent, except as described in this policy.
              </p>
              <p>
                We may share aggregated, anonymized data for research purposes to advance cosmetic
                safety knowledge.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We implement appropriate security measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use cookies and similar tracking technologies to enhance your experience and
                analyze site usage. You can control cookie settings through your browser
                preferences.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of certain data collection</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update this privacy policy from time to time. We will notify you of any
                changes by posting the new policy on this page with an updated revision date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about this Privacy Policy, please contact us through our
                support channels.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer className="bg-muted/50 border-t" />
    </div>
  );
}
