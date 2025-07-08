import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import HeartButton from "@/components/HeartButton";
import { useAuth } from "@/hooks/useAuth"

interface FavoritedHeadline {
  id: string;
  source_table: string;
  source_id: string;
  ai_headline: string;
  headline: string;
  favorited_at: string;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoritedHeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { session } = useAuth()
  const user = session?.user.id

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("id, source_table, source_id, ai_headline, headline, favorited_at")
          .eq("user", user)
          .order("favorited_at", { ascending: false });
        if (error) throw error;
        setFavorites(data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Favorite Headlines</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <div className="text-2xl font-bold text-primary">{favorites.length}</div>
          <div className="text-sm text-gray-600">Total Favorites</div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="text-2xl font-bold text-primary">
            {new Set(favorites.map((f) => f.headline)).size}
          </div>
          <div className="text-sm text-gray-600">Unique Originals</div>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="text-2xl font-bold text-primary">
            {new Set(favorites.map((f) => f.source_table)).size}
          </div>
          <div className="text-sm text-gray-600">Different Sources</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Favorites List</CardTitle>
        </CardHeader>
        <CardContent>
          {favorites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              You haven’t favorited any headlines yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>AI Headline</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>Source Table</TableHead>
                  <TableHead>Favorited On</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {favorites.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {item.ai_headline}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {item.headline}
                    </TableCell>
                    <TableCell>
                      {item.source_table}
                    </TableCell>
                    <TableCell>
                      {new Date(item.favorited_at)
                        .toISOString()               
                        .slice(0,16)              
                        .replace('T',' ')}  
                    </TableCell>
                    <TableCell>
                      <HeartButton
                        source_table={item.source_table}
                        id={item.id}
                        ai_headline={item.ai_headline}
                        headline={item.headline}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
