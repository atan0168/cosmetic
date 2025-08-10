'use client';

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Building2, Calendar, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import Link from 'next/link';
import { useCompanyDetails } from '@/hooks/useCompanyDetails';
import { toTitleCase } from '@/lib/utils/product';

export default function CompanyDetailsPage() {
  const params = useParams();
  const companyId = params.id as string;

  const { data, isLoading, error } = useCompanyDetails(companyId);

  const getReputationBadge = (score: string | null) => {
    if (!score) return <Badge variant="secondary">No Data</Badge>;

    const numScore = parseFloat(score);
    if (numScore >= 0.8)
      return (
        <Badge variant="default" className="bg-green-500">
          Excellent
        </Badge>
      );
    if (numScore >= 0.6)
      return (
        <Badge variant="default" className="bg-blue-500">
          Good
        </Badge>
      );
    if (numScore >= 0.4)
      return (
        <Badge variant="default" className="bg-yellow-500">
          Fair
        </Badge>
      );
    return <Badge variant="destructive">Poor</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'Cancelled' ? (
      <Badge variant="destructive">Cancelled</Badge>
    ) : (
      <Badge variant="default" className="bg-green-500">
        Active
      </Badge>
    );
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
          <ErrorMessage message={error instanceof Error ? error.message : 'Company not found'} />
        </main>
        <Footer className="bg-muted/50 border-t" />
      </div>
    );
  }

  const { company, recentProducts } = data;

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />

      <main className="container mx-auto flex-1 px-4 py-6 sm:py-8 lg:py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/companies" className="text-muted-foreground hover:text-foreground">
            Companies
          </Link>
          <span className="text-muted-foreground mx-2">/</span>
          <span className="font-medium">{company.name}</span>
        </div>

        {/* Company Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Building2 className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold">{toTitleCase(company.name)}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Reputation:</span>
            {getReputationBadge(company.reputationScore)}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company.totalNotifs || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Cancelled Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company.cancelledCount || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4 text-green-500" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {company.totalNotifs
                  ? `${Math.round(((company.totalNotifs - (company.cancelledCount || 0)) / company.totalNotifs) * 100)}%`
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-purple-500" />
                First Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {company.firstNotifiedDate
                  ? new Date(company.firstNotifiedDate).toLocaleDateString()
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <p className="text-muted-foreground">No products found for this company.</p>
            ) : (
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{toTitleCase(product.name)}</h3>
                        <p className="text-muted-foreground text-sm">
                          {product.notifNo} • {product.category}
                        </p>
                      </div>
                      {getStatusBadge(product.status)}
                    </div>

                    <div className="text-muted-foreground mb-2 text-sm">
                      Notified: {new Date(product.dateNotified).toLocaleDateString()}
                    </div>

                    {product.reasonForCancellation && (
                      <div className="text-sm">
                        <span className="font-medium text-red-600">Cancellation reason:</span>
                        <p className="text-muted-foreground mt-1">
                          {product.reasonForCancellation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer className="bg-muted/50 border-t" />
    </div>
  );
}
