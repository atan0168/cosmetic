import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Globe, Users, Target, BookOpen, Shield } from 'lucide-react';
import { Footer, Header } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Our Mission | Product Safety Insights',
  description:
    'Learn about our mission to promote good health and well-being through cosmetic safety',
};

export default function MissionPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Our Mission</h1>
            <p className="text-muted-foreground text-lg">
              Empowering consumers with knowledge for healthier choices
            </p>
          </div>

          {/* SDG Connection */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                Supporting UN Sustainable Development Goal 3
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  SDG 3: Good Health and Well-being
                </Badge>
                <Badge variant="outline">Target 3.9: Reduce illness from hazardous chemicals</Badge>
              </div>
              <p className="text-lg">
                We believe everyone deserves access to safe cosmetic products. Our platform directly
                supports
                <strong> SDG 3: Good Health and Well-being</strong> by providing transparent,
                accessible information about cosmetic product safety, helping consumers make
                informed decisions that protect their health.
              </p>
            </CardContent>
          </Card>

          {/* Our Vision */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">
                A world where every consumer has easy access to reliable cosmetic safety
                information, enabling them to make informed choices that protect their health and
                well-being. We envision a future where transparency in cosmetic safety is the norm,
                not the exception.
              </p>
            </CardContent>
          </Card>

          {/* What We Do */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                What We Do
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold">Safety Information Access</h4>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    We make official cosmetic safety data accessible and understandable for everyday
                    consumers, breaking down complex regulatory information into clear, actionable
                    insights.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold">Education & Awareness</h4>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    We educate consumers about cosmetic ingredients, safety standards, and how to
                    identify potential risks, empowering them to make informed purchasing decisions.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    <h4 className="font-semibold">Community Protection</h4>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    By highlighting recalled or problematic products, we help protect entire
                    communities from potentially harmful cosmetic products.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-orange-500" />
                    <h4 className="font-semibold">Global Health Impact</h4>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Our work contributes to global health initiatives by reducing exposure to
                    hazardous chemicals and promoting safer consumer products worldwide.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why It Matters */}
          <Card>
            <CardHeader>
              <CardTitle>Why This Matters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    Millions
                  </div>
                  <p className="text-muted-foreground text-sm">
                    of people use cosmetic products daily without knowing their safety status
                  </p>
                </div>

                <div className="space-y-2 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Complex
                  </div>
                  <p className="text-muted-foreground text-sm">
                    regulatory data is often difficult for consumers to access and understand
                  </p>
                </div>

                <div className="space-y-2 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    Prevention
                  </div>
                  <p className="text-muted-foreground text-sm">
                    is better than treatment when it comes to chemical exposure and health risks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Our Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Our Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We are a dedicated team of students from diverse academic backgrounds, united by our
                passion for public health and technology. Our multidisciplinary approach combines
                expertise in:
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Public Health & Safety
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Data Science & Analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    Software Development
                  </li>
                </ul>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    Regulatory Affairs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    User Experience Design
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                    Chemistry & Materials Science
                  </li>
                </ul>
              </div>
              <p className="text-muted-foreground text-sm">
                As students, we bring fresh perspectives and innovative approaches to addressing
                global health challenges through technology and data transparency.
              </p>
            </CardContent>
          </Card>

          {/* Our Commitment */}
          <Card>
            <CardHeader>
              <CardTitle>Our Commitment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Transparency</h4>
                  <p className="text-muted-foreground text-sm">
                    We are committed to complete transparency in our data sources, methodology, and
                    limitations.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold">Accessibility</h4>
                  <p className="text-muted-foreground text-sm">
                    Our platform is free to use and designed to be accessible to everyone,
                    regardless of technical background.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold">Continuous Improvement</h4>
                  <p className="text-muted-foreground text-sm">
                    We continuously update our data and improve our platform based on user feedback
                    and new research.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold">Evidence-Based</h4>
                  <p className="text-muted-foreground text-sm">
                    All our recommendations are based on official regulatory data and established
                    safety standards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
            <CardContent className="py-8 text-center">
              <h3 className="mb-4 text-xl font-semibold">
                Join Us in Promoting Health & Well-being
              </h3>
              <p className="text-muted-foreground mb-6">
                Together, we can create a safer world where everyone has access to the information
                they need to make healthy choices about the products they use every day.
              </p>
              <div className="flex justify-center gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  SDG 3: Good Health and Well-being
                </Badge>
                <Badge variant="outline">Target 3.9: Reduce illness from hazardous chemicals</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer className="bg-muted/50 border-t" />
    </div>
  );
}
