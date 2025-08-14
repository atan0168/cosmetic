import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Database, Shield, Users, CheckCircle } from 'lucide-react';
import { Footer, Header } from '@/components/layout';

export const metadata: Metadata = {
  title: 'How It Works | Product Safety Insights',
  description: 'Learn how Product Safety Insights helps you make informed cosmetic choices',
};

export default function HowItWorksPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight">How It Works</h1>
            <p className="text-muted-foreground text-lg">
              Discover how we help you make informed decisions about cosmetic product safety
            </p>
          </div>

          {/* Process Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Simple 3-Step Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold">1. Search</h3>
                  <p className="text-muted-foreground text-sm">
                    Enter a product name, brand, or notification number to find safety information
                  </p>
                </div>

                <div className="space-y-3 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold">2. Analyze</h3>
                  <p className="text-muted-foreground text-sm">
                    We check our database of official notifications and safety records
                  </p>
                </div>

                <div className="space-y-3 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold">3. Inform</h3>
                  <p className="text-muted-foreground text-sm">
                    Get clear safety information and alternative recommendations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What You Get */}
          <Card>
            <CardHeader>
              <CardTitle>What Information You&apos;ll Find</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold">Product Status</h4>
                  </div>
                  <p className="text-muted-foreground pl-7 text-sm">
                    Whether the product is currently active, cancelled, or recalled
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold">Ingredient List</h4>
                  </div>
                  <p className="text-muted-foreground pl-7 text-sm">
                    Complete ingredient information to help identify potential allergens
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold">Safety Alerts</h4>
                  </div>
                  <p className="text-muted-foreground pl-7 text-sm">
                    Any official safety warnings, recalls, or regulatory actions
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold">Alternative Products</h4>
                  </div>
                  <p className="text-muted-foreground pl-7 text-sm">
                    Suggestions for safer alternatives when issues are found
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Understanding Results */}
          <Card>
            <CardHeader>
              <CardTitle>Understanding Your Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Active
                    </Badge>
                    <span className="font-semibold">Safe to Use</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    The product is currently notified and has no known safety issues in our
                    database.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Under Review
                    </Badge>
                    <span className="font-semibold">Use with Caution</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    The product may have reported issues or is under regulatory review. Check
                    details carefully.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Cancelled/Recalled
                    </Badge>
                    <span className="font-semibold">Avoid Use</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    The product has been cancelled or recalled due to safety concerns. We recommend
                    discontinuing use.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behind the Scenes */}
          <Card>
            <CardHeader>
              <CardTitle>Behind the Scenes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      1
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Data Collection</h4>
                    <p className="text-muted-foreground text-sm">
                      We continuously collect data from official cosmetic notification databases and
                      regulatory sources.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Data Processing</h4>
                    <p className="text-muted-foreground text-sm">
                      Raw data is cleaned, standardized, and enriched with additional safety
                      information.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      3
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Safety Analysis</h4>
                    <p className="text-muted-foreground text-sm">
                      Our system analyzes ingredients, checks for recalls, and identifies potential
                      safety concerns.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      4
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold">User-Friendly Presentation</h4>
                    <p className="text-muted-foreground text-sm">
                      Complex regulatory data is presented in an easy-to-understand format with
                      clear recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Best Practices for Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Before Using New Products</h4>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Search for the product in our database</li>
                    <li>• Check ingredient lists for known allergens</li>
                    <li>• Always patch test new products</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">If You Find Issues</h4>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Stop using the product immediately</li>
                    <li>• Consult a healthcare professional</li>
                    <li>• Report adverse reactions to authorities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardContent className="py-8 text-center">
              <h3 className="mb-4 text-xl font-semibold">Ready to Make Safer Choices?</h3>
              <p className="text-muted-foreground mb-6">
                Start by searching for a cosmetic product you use regularly to see what safety
                information is available.
              </p>
              <div className="flex justify-center">
                <Badge className="bg-blue-100 px-4 py-2 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Supporting SDG 3: Good Health and Well-being
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer className="bg-muted/50 border-t" />
    </div>
  );
}
