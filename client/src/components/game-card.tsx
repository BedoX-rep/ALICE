import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Heart, Diamond, Square } from "lucide-react";

type GameCardProps = {
  role: string;
  hideRole?: boolean;
  disguisedAs?: string | null;
};

export default function GameCard({ role, hideRole, disguisedAs }: GameCardProps) {
  const isJoker = role === "joker";
  const shouldHide = hideRole && !isJoker;

  // If this is a joker card and we're not hiding it (not the owner)
  // and it has a disguise, show the disguised card instead
  const displayRole = (!hideRole && isJoker && disguisedAs) ? disguisedAs : role;

  return (
    <Card className={cn(
      "w-24 h-32 flex items-center justify-center",
      shouldHide && "bg-muted"
    )}>
      <CardContent className="p-0">
        {!shouldHide && (
          <div className="text-4xl flex items-center justify-center">
            {displayRole === "hearts" && <Heart className="text-red-500" />}
            {displayRole === "diamonds" && <Diamond className="text-blue-500" />}
            {displayRole === "rectangle" && <Square className="text-green-500" />}
            {displayRole === "joker" && <span>🃏</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}