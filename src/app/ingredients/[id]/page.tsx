'use client';

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { AlertTriangle, ExternalLink, Calendar, TrendingUp, Shield, Info } from 'lucide-react';
import Link from 'next/link';
import { useIngredientDetails } from '@/hooks/useIngredientDetails';
import { toTitleCase } from '@/lib/utils/product';

export default function IngredientDetailsPage() {
  const params = useParams();
  const ingredientId = params.id as string;

  const { data, isLoading, error } = useIngredientDetails(ingredientId);

  const getEWGBadge = (rating: number | null) => {
    if (!rating) return <Badge variant="secondary">No Rating</Badge>;

    if (rating <= 2)
      return (
        <Badge variant="default" className="bg-green-500">
          {rating}
        </Badge>
      );
    if (rating <= 6)
      return (
        <Badge variant="default" className="bg-yellow-500">
          {rating}
        </Badge>
      );
    return <Badge variant="destructive">{rating}</Badge>;
  };

  const getRiskBadge = (rating: number | null) => {
    if (!rating) return <Badge variant="secondary">No Rating</Badge>;

    if (rating <= 2)
      return (
        <Badge variant="default" className="bg-green-500">
          Low Risk
        </Badge>
      );
    if (rating <= 6)
      return (
        <Badge variant="default" className="bg-yellow-500">
          Moderate Risk
        </Badge>
      );
    return <Badge variant="destructive">High Risk</Badge>;
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />
        <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-6">
          <LoadingSpinner size="lg" />
        </main>
        <Footer className="bg-muted/50 border-t" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-background flex min-h-screen flex-col">
        <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />
        <main className="container mx-auto flex-1 px-4 py-6">
          <ErrorMessage message={error instanceof Error ? error.message : 'Ingredient not found'} />
        </main>
        <Footer className="bg-muted/50 border-t" />
      </div>
    );
  }

  const { ingredient, affectedProducts } = data;

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />

      <main className="container mx-auto flex-1 px-4 py-6 sm:py-8 lg:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/ingredients" className="text-muted-foreground hover:text-foreground">
            Banned Ingredients
          </Link>
          <span className="text-muted-foreground mx-2">/</span>
          <span className="font-medium">{ingredient.name}</span>
        </div>

        {/* Ingredient Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">{ingredient.name}</h1>
          </div>
          {ingredient.alternativeNames && (
            <p className="text-muted-foreground mb-4 text-lg">
              Also known as: {ingredient.alternativeNames}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">EWG Rating:</span>
              {getEWGBadge(ingredient.ewgRating)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Risk Level:</span>
              {getRiskBadge(ingredient.ewgRating)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Health Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Health Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{ingredient.healthRiskDescription}</p>
              </CardContent>
            </Card>

            {/* Regulatory Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  Regulatory Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge variant="destructive" className="ml-2">
                    {ingredient.regulatoryStatus || 'Banned'}
                  </Badge>
                </div>

                {/* {ingredient.sourceUrl && ( */}
                {/*   <div> */}
                {/*     <span className="font-medium">Source:</span> */}
                {/*     <a */}
                {/*       href={ingredient.sourceUrl} */}
                {/*       target="_blank" */}
                {/*       rel="noopener noreferrer" */}
                {/*       className="ml-2 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800" */}
                {/*     > */}
                {/*       View Regulation */}
                {/*       <ExternalLink className="h-3 w-3" /> */}
                {/*     </a> */}
                {/*   </div> */}
                {/* )} */}

                {ingredient.pubchemUrl && (
                  <div>
                    <span className="font-medium">Chemical Database:</span>
                    <a
                      href={ingredient.pubchemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      PubChem ({ingredient.pubchemCid})
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Affected Products */}
            <Card>
              <CardHeader>
                <CardTitle>Products Containing This Ingredient</CardTitle>
              </CardHeader>
              <CardContent>
                {affectedProducts.length === 0 ? (
                  <p className="text-muted-foreground">
                    No products found containing this ingredient.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {affectedProducts.map((product) => (
                      <div key={product.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{toTitleCase(product.name)}</h3>
                            <p className="text-muted-foreground text-sm">
                              {product.notifNo} • {product.category}
                            </p>
                          </div>
                          <Badge variant="destructive">Cancelled</Badge>
                        </div>

                        <div className="text-muted-foreground mb-2 text-sm">
                          Approved: {new Date(product.dateNotified).toLocaleDateString()}
                        </div>

                        {product.reasonForCancellation && (
                          <div className="text-sm">
                            <span className="font-medium text-red-600">Cancellation reason:</span>
                            <p className="text-muted-foreground mt-1">
                              Product contains{' '}
                              <span className="font-bold text-red-500">
                                {toTitleCase(product.reasonForCancellation)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Products Affected</span>
                  </div>
                  <div className="text-2xl font-bold">{ingredient.occurrencesCount || 0}</div>
                </div>

                {/* {ingredient.firstAppearanceDate && ( */}
                {/*   <div> */}
                {/*     <div className="mb-1 flex items-center gap-2"> */}
                {/*       <Calendar className="h-4 w-4 text-blue-500" /> */}
                {/*       <span className="text-sm font-medium">First Detected</span> */}
                {/*     </div> */}
                {/*     <div className="text-sm"> */}
                {/*       {new Date(ingredient.firstAppearanceDate).toLocaleDateString()} */}
                {/*     </div> */}
                {/*   </div> */}
                {/* )} */}
                {/**/}
                {/* {ingredient.lastAppearanceDate && ( */}
                {/*   <div> */}
                {/*     <div className="mb-1 flex items-center gap-2"> */}
                {/*       <Calendar className="h-4 w-4 text-purple-500" /> */}
                {/*       <span className="text-sm font-medium">Last Detected</span> */}
                {/*     </div> */}
                {/*     <div className="text-sm"> */}
                {/*       {new Date(ingredient.lastAppearanceDate).toLocaleDateString()} */}
                {/*     </div> */}
                {/*   </div> */}
                {/* )} */}
              </CardContent>
            </Card>

            {/* EWG Rating Info */}
            {ingredient.ewgRating && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">EWG Rating Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500">
                      1-2
                    </Badge>
                    <span>Low hazard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-yellow-500">
                      3-6
                    </Badge>
                    <span>Moderate hazard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">7-10</Badge>
                    <span>High hazard</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer className="bg-muted/50 border-t" />
    </div>
  );
}
