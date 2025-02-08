import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Heart, Diamond, Square } from "lucide-react";

type GameCardProps = {
  role: string;
  hideRole?: boolean;
};

export default function GameCard({ role, hideRole }: GameCardProps) {
  return (
    <Card className={cn(
      "w-24 h-32 flex items-center justify-center",
      hideRole && "bg-muted"
    )}>
      <CardContent className="p-0">
        {!hideRole && (
          <div className="text-4xl">
            {role === "hearts" && <Heart className="text-red-500" />}
            {role === "diamonds" && <Diamond className="text-blue-500" />}
            {role === "rectangle" && <Square className="text-green-500" />}
            {role === "joker" && "🃏"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}