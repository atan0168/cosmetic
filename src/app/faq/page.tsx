import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Footer, Header } from '@/components/layout';

export const metadata: Metadata = {
  title: 'FAQ | Product Safety Insights',
  description: 'Frequently asked questions about Product Safety Insights',
};

export default function FAQPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about Product Safety Insights
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>General Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="what-is">
                  <AccordionTrigger>What is Product Safety Insights?</AccordionTrigger>
                  <AccordionContent>
                    Product Safety Insights is a platform that provides consumers with reliable
                    information about cosmetic product safety based on official notification
                    databases. We help you make informed decisions about the products you use.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-accurate">
                  <AccordionTrigger>How accurate is the safety information?</AccordionTrigger>
                  <AccordionContent>
                    Our data comes directly from official cosmetic notification databases maintained
                    by regulatory authorities. However, product formulations and safety status can
                    change over time, so we recommend always checking the most current product
                    information and consulting healthcare professionals for specific concerns.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="free-to-use">
                  <AccordionTrigger>Is this service free to use?</AccordionTrigger>
                  <AccordionContent>
                    Yes, Product Safety Insights is completely free to use. Our mission is to make
                    cosmetic safety information accessible to everyone as part of our commitment to
                    SDG 3: Good Health and Well-being.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Using the Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="search-products">
                  <AccordionTrigger>How do I search for products?</AccordionTrigger>
                  <AccordionContent>
                    You can search for products by name, brand, or notification number using our
                    search function. The platform will show you safety information, ingredients, and
                    any reported issues or recalls.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="understand-results">
                  <AccordionTrigger>How do I understand the search results?</AccordionTrigger>
                  <AccordionContent>
                    Search results show product status (active, cancelled, recalled), key
                    ingredients, notification details, and any safety concerns. Products with
                    cancelled notifications may indicate safety issues that led to their removal
                    from the market.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="product-not-found">
                  <AccordionTrigger>What if I can&apos;t find a product?</AccordionTrigger>
                  <AccordionContent>
                    If a product isn&apos;t in our database, it may not be officially notified with
                    the Malaysian Ministry of Health, or it might be a very new product. Try
                    searching by different names or check the product packaging for MOH notification
                    numbers. Products sold in Malaysia should have official notification numbers.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safety and Health</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="safety-concerns">
                  <AccordionTrigger>
                    What should I do if I have safety concerns about a product?
                  </AccordionTrigger>
                  <AccordionContent>
                    If you have safety concerns about a cosmetic product, stop using it immediately
                    and consult a healthcare professional. You should also report adverse reactions
                    to your local regulatory authority and consider reporting it to the product
                    manufacturer.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="allergic-reactions">
                  <AccordionTrigger>Can this help me avoid allergic reactions?</AccordionTrigger>
                  <AccordionContent>
                    Our platform shows ingredient lists which can help you identify potential
                    allergens. However, always patch test new products and consult with a
                    dermatologist or allergist if you have known sensitivities or allergies.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="medical-advice">
                  <AccordionTrigger>Does this replace medical advice?</AccordionTrigger>
                  <AccordionContent>
                    No, this platform provides information only and should not replace professional
                    medical advice. Always consult healthcare professionals for specific health
                    concerns or before making decisions based on product safety information.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data and Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="data-sources">
                  <AccordionTrigger>Where does your data come from?</AccordionTrigger>
                  <AccordionContent>
                    Our data comes from the Malaysian Ministry of Health&apos;s official cosmetic
                    notification databases, including both active and cancelled product
                    notifications. We regularly update our database to ensure you have access to the
                    most current information available from these official sources.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="update-frequency">
                  <AccordionTrigger>How often is the data updated?</AccordionTrigger>
                  <AccordionContent>
                    We update our database regularly to reflect changes in product notifications,
                    recalls, and safety information. The exact frequency depends on when official
                    sources release new data.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="report-error">
                  <AccordionTrigger>How can I report an error in the data?</AccordionTrigger>
                  <AccordionContent>
                    If you notice an error in our data, please contact us through our support
                    channels. We take data accuracy seriously and will investigate and correct any
                    verified errors promptly.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer className="bg-muted/50 border-t" />
    </div>
  );
}
