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
import { Search, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useIngredients } from '@/hooks/useIngredients';

export default function IngredientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const { data, isLoading, error } = useIngredients({
    query: searchQuery,
    sortBy,
    sortOrder,
    limit: 50,
  });

  const ingredients = data?.ingredients || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically trigger a refetch due to React Query
  };

  const getEWGBadgeScore = (rating: number | null) => {
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

  const getEWGBadgeRating = (rating: number | null) => {
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

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur" />

      <main className="container mx-auto flex-1 px-4 py-6 sm:py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">Banned Ingredients</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Explore banned cosmetic ingredients and understand their health risks
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search ingredients..."
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
              <option value="ewgRating">Sort by EWG Rating</option>
              <option value="occurrencesCount">Sort by Occurrences</option>
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
            {ingredients.map((ingredient) => (
              <Link key={ingredient.id} href={`/ingredients/${ingredient.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                    {ingredient.alternativeNames && (
                      <p className="text-muted-foreground text-sm">
                        Also known as: {ingredient.alternativeNames}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">EWG Rating</span>
                      {getEWGBadgeScore(ingredient.ewgRating)}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Risk Level</span>
                      {getEWGBadgeRating(ingredient.ewgRating)}
                    </div>

                    <div className="text-sm">
                      <p className="text-muted-foreground mb-1">Health Risks:</p>
                      <p className="line-clamp-2">{ingredient.healthRiskDescription}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-red-500" />
                          <span className="text-muted-foreground">Found in</span>
                        </div>
                        <div className="font-semibold">
                          {ingredient.occurrencesCount || 0} products
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="text-muted-foreground">Status</span>
                        </div>
                        <div className="text-xs font-semibold">
                          {ingredient.regulatoryStatus || 'Banned'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {ingredients.length === 0 && !isLoading && !error && (
          <div className="py-12 text-center">
            <AlertTriangle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <p className="text-muted-foreground">No ingredients found</p>
          </div>
        )}
      </main>

      <Footer className="bg-muted/50 border-t" />
    </div>
  );
}
