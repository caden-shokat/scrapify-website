import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import HeartButton from "@/components/HeartButton";
import type { TopAIHeadline } from "@/pages/ai-studio/TopAIHeadlines";

type AIHeadlineRowProps = {
  item: TopAIHeadline;
  busyId: string | null;
  //disableRegeneration: boolean;
  onRegenerate: (
    source_id: string,
    headline: string,
    frequency: number
  ) => void;
};

export default function AIHeadlineRow({
  item,
  busyId,
  //disableRegeneration,
  onRegenerate,
}: AIHeadlineRowProps) {
  return (
    <TableRow key={item.source_id}>
      <TableCell>
        <div className="text-sm">{item.headline}</div>
      </TableCell>
      <TableCell>
        {item.ai_headline ? (
          <div className="text-gray-900">{item.ai_headline}</div>
        ) : (
          <span className="text-gray-400">Pending…</span>
        )}
      </TableCell>
      <TableCell>{item.frequency}</TableCell>
      <TableCell className="flex gap-2">
        <HeartButton
          source_table="topWeeklyAIHeadlines"
          id={item.id}
          ai_headline={item.ai_headline}
          headline={item.headline}
        />

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onRegenerate(item.source_id, item.headline, item.frequency)
          }
          disabled={busyId === item.source_id}
          //disabled={busyId === item.source_id || disableRegeneration}
        >
          <Sparkles
            className={
              busyId === item.source_id
                ? "w-4 h-4 animate-spin"
                : "w-4 h-4"
            }
          />
        </Button>
      </TableCell>
    </TableRow>
  );
}
