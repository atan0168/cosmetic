import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer, Header } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Terms of Service | Product Safety Insights',
  description: 'Terms of service for Product Safety Insights platform',
};

export default function TermsPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using Product Safety Insights, you accept and agree to be bound by
                the terms and provision of this agreement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Use License</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Permission is granted to temporarily access Product Safety Insights for personal,
                non-commercial transitory viewing only. This is the grant of a license, not a
                transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The information on this website is provided on an &apos;as is&apos; basis. To the
                fullest extent permitted by law, Product Safety Insights excludes all
                representations, warranties, conditions and terms whether express or implied.
              </p>
              <p className="font-semibold text-amber-700 dark:text-amber-300">
                This platform provides information based on official cosmetic notification
                databases. Always consult with healthcare professionals for specific safety
                concerns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                In no event shall Product Safety Insights or its suppliers be liable for any damages
                (including, without limitation, damages for loss of data or profit, or due to
                business interruption) arising out of the use or inability to use the materials on
                Product Safety Insights&apos; website.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Accuracy of Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The materials appearing on Product Safety Insights&apos; website could include
                technical, typographical, or photographic errors. Product Safety Insights does not
                warrant that any of the materials on its website are accurate, complete, or current.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Modifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Product Safety Insights may revise these terms of service for its website at any
                time without notice. By using this website, you are agreeing to be bound by the then
                current version of these terms of service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about these Terms of Service, please contact us through
                our support channels.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer className="bg-muted/50 border-t" />
    </div>
  );
}
