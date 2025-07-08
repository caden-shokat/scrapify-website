import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/integrations/supabase/client"
import { Sparkles, Trash2 } from "lucide-react"
import { useSelectedHeadlines } from "@/hooks/useSelectedHeadlines"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import HeartButton from "@/components/HeartButton"
import { useAuth } from "@/hooks/useAuth"

export default function HeadlineGenerator() {
  const { selectedHeadlines: items, loading, refetch } = useSelectedHeadlines()
  const [generating, setGenerating] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const { toast } = useToast()
  const { session } = useAuth()
  const user = session?.user.id

  const generateAIHeadlines = async () => {
    if (!items.length) {
      toast({
        title: "No headlines selected",
        description: "Please select some headlines first",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-headlines", {
        body: { selectedHeadlines: items },
      })
      if (error) throw error

      toast({
        title: "AI Headlines Generated!",
        description: `Generated ${data.generated} new headline variations`,
      })
      await refetch()
    } catch (error) {
      console.error("Error generating AI headlines:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate AI headlines. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const regenerate = async (id: string) => {
    const toBeRegenerated = items.find(i => i.id === id)
    if (!toBeRegenerated) {
      toast({
        title: "Error",
        description: "Could not find that headline in your selection",
        variant: "destructive",
      })
      return
    }

    setBusyId(id)
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-ai-headlines",
        {
          body: { selectedHeadlines: [toBeRegenerated] },
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        }
      )
      if (error) throw error

      await refetch()
      toast({ title: "Regenerated!", description: "Your AI headline was refreshed." })
    } catch (err) {
      console.error("Regeneration error:", err)
      toast({
        title: "Error",
        description: "Regeneration failed — please try again.",
        variant: "destructive",
      })
    } finally {
      setBusyId(null)
    }
  }

  const removeHeadline = async (id: string) => {
    try {
      const { error } = await supabase.from("selected").delete().eq("id", id).eq("user", user)
      if (error) throw error

      await refetch()
      toast({ title: "Headline removed", description: "Removed from selection" })
    } catch (error) {
      console.error("Error removing headline:", error)
      toast({ title: "Error", description: "Could not remove headline", variant: "destructive" })
    }
  }

  const clearAll = async () => {
    try {
      const { error } = await supabase
        .from("selected")
        .delete()
        .eq("user", user)
        .neq("id", "00000000-0000-0000-0000-000000000000")

      if (error) throw error

      await refetch()
      toast({ title: "All cleared", description: "All selected headlines removed" })
    } catch (error) {
      console.error("Error clearing headlines:", error)
      toast({ title: "Error", description: "Could not clear headlines", variant: "destructive" })
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Headline Generator</h1>
        </div>
      </div>

      {/* Action Panel */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <Badge variant="outline">{items.length} selected</Badge>
          <div className="flex gap-2">
            {items.length > 0 && (
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button
              onClick={generateAIHeadlines}
              disabled={items.length === 0 || generating}
              className="bg-primary hover:bg-primary-light"
            >
              <Sparkles className={`w-4 h-4 mr-2 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Generating..." : "Generate AI Headlines"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Headlines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Headlines ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No headlines selected yet.</p>
              <p className="text-sm mt-2">
                Go to Scrape Data, Anstrex Data, Top Headlines, or CTR Potential to select headlines for AI
                generation.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Headline</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>AI Headline</TableHead>
                  <TableHead className="text-center">Favorite</TableHead>
                  <TableHead>Selected</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-md">
                      <div className="font-medium">"{item.headline}"</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.source_table.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="max-w-md whitespace-normal break-words"
                      title={item.ai_headline || ""}
                    >
                      {item.ai_headline ?? <span className="text-gray-400 italic">Waiting…</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <HeartButton
                        source_table="selected"
                        id={item.id}
                        ai_headline={item.ai_headline}
                        headline={item.headline}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        {new Date(item.selected_at).toLocaleDateString()}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => regenerate(item.id)}
                        disabled={busyId === item.id}
                      >
                        <Sparkles
                          className={`w-5 h-5 ${busyId === item.id ? "animate-spin" : ""}`}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removeHeadline(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
