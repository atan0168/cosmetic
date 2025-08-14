import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Database, Shield, RefreshCw } from 'lucide-react';
import { Footer, Header } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Data Sources | Product Safety Insights',
  description: 'Information about our data sources and methodology',
};

export default function DataSourcesPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
            <p className="text-muted-foreground text-lg">
              Transparency in our data collection and methodology
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Primary Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-semibold">
                      Malaysian Ministry of Health - Cosmetic Notifications
                    </h3>
                    <a
                      href="https://data.moh.gov.my/data-catalogue/cosmetic_notifications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      aria-label="Visit MOH cosmetic notifications database"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Official database of cosmetic product notifications registered with the
                    Malaysian Ministry of Health. Contains comprehensive information about active
                    cosmetic products, including product details, ingredients, notification numbers,
                    and regulatory status.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="secondary">Ministry of Health Malaysia</Badge>
                    <Badge variant="secondary">Active Products</Badge>
                    <Badge variant="secondary">Official Registry</Badge>
                  </div>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="font-semibold">
                      Malaysian Ministry of Health - Cancelled Notifications
                    </h3>
                    <a
                      href="https://data.moh.gov.my/data-catalogue/cosmetic_notifications_cancelled"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      aria-label="Visit MOH cancelled cosmetic notifications database"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Database of cosmetic product notifications that have been cancelled by the
                    Malaysian Ministry of Health. These cancellations may indicate safety concerns,
                    regulatory non-compliance, or voluntary withdrawals by manufacturers.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="destructive">Cancelled Products</Badge>
                    <Badge variant="secondary">Safety Alerts</Badge>
                    <Badge variant="secondary">Regulatory Actions</Badge>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                  <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">
                    Data Coverage
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Our platform currently focuses on cosmetic products regulated by the Malaysian
                    Ministry of Health. This includes products sold in Malaysia and those seeking
                    market authorization in the region. We are working to expand coverage to include
                    additional regulatory jurisdictions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Data Collection Methodology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Automated Collection</h4>
                  <p className="text-muted-foreground text-sm">
                    We use automated systems to regularly collect data from official sources,
                    ensuring timely updates.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Data Validation</h4>
                  <p className="text-muted-foreground text-sm">
                    All collected data undergoes validation processes to ensure accuracy and
                    consistency.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Regular Updates</h4>
                  <p className="text-muted-foreground text-sm">
                    Our database is updated regularly to reflect the latest information from
                    official sources.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Quality Assurance</h4>
                  <p className="text-muted-foreground text-sm">
                    We implement quality checks to maintain data integrity and identify potential
                    issues.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Reliability & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300">Strengths</h4>
                  <ul className="list-disc space-y-1 pl-6 text-sm">
                    <li>Data sourced directly from official regulatory databases</li>
                    <li>Regular updates to maintain currency</li>
                    <li>Comprehensive coverage of notified products</li>
                    <li>Transparent methodology and source attribution</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-amber-700 dark:text-amber-300">Limitations</h4>
                  <ul className="list-disc space-y-1 pl-6 text-sm">
                    <li>Data availability depends on regulatory reporting requirements</li>
                    <li>Some products may not be included if not officially notified</li>
                    <li>Information accuracy depends on original source data quality</li>
                    <li>Product formulations may change after initial notification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Processing & Storage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Processing Pipeline</h4>
                  <p className="text-muted-foreground text-sm">
                    Raw data is processed through standardization, validation, and enrichment
                    pipelines before being made available.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Storage Security</h4>
                  <p className="text-muted-foreground text-sm">
                    Data is stored securely with appropriate backup and recovery procedures to
                    ensure availability and integrity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-200">Important Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                While we strive to provide accurate and up-to-date information, this platform should
                not be used as the sole source for safety decisions. Always consult official
                regulatory sources and healthcare professionals for specific safety concerns.
                Product safety status and formulations may change over time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact & Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                If you have questions about our data sources, notice any discrepancies, or would
                like to suggest additional data sources, please contact us through our support
                channels. We value feedback that helps us improve data quality and coverage.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer className="bg-muted/50 border-t" />
    </div>
  );
}
