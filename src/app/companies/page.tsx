'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { Search, Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useCompanies } from '@/hooks/useCompanies';

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const { data, isLoading, error } = useCompanies({
    query: searchQuery,
    sortBy,
    sortOrder,
    limit: 50,
  });

  const companies = data?.companies || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically trigger a refetch due to React Query
  };

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

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />

      <main className="container mx-auto flex-1 px-4 py-6 sm:py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Building2 className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold">Companies</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore cosmetic companies and their safety track records
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex flex-wrap gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-background rounded-md border px-3 py-2"
            >
              <option value="name">Sort by Name</option>
              <option value="totalNotifs">Sort by Total Notifications</option>
              <option value="reputationScore">Sort by Reputation</option>
              <option value="cancelledCount">Sort by Cancelled Products</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-background rounded-md border px-3 py-2"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <ErrorMessage message={error instanceof Error ? error.message : 'An error occurred'} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Link key={company.id} href={`/companies/${company.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Reputation</span>
                      {getReputationBadge(company.reputationScore)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="text-muted-foreground">Total Products</span>
                        </div>
                        <div className="font-semibold">{company.totalNotifs || 0}</div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-muted-foreground">Cancelled</span>
                        </div>
                        <div className="font-semibold">{company.cancelledCount || 0}</div>
                      </div>
                    </div>

                    {company.firstNotifiedDate && (
                      <div className="text-muted-foreground text-xs">
                        First notification:{' '}
                        {new Date(company.firstNotifiedDate).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {companies.length === 0 && !isLoading && !error && (
          <div className="py-12 text-center">
            <Building2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">No companies found</p>
          </div>
        )}
      </main>

      <Footer className="bg-muted/50 border-t" />
    </div>
  );
}
