import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Heart, Diamond, Square } from "lucide-react";

type GameCardProps = {
  role: string;
  hideRole?: boolean;
};

export default function GameCard({ role, hideRole }: GameCardProps) {
  const isJoker = role === "joker";
  const shouldHide = hideRole && !isJoker;

  return (
    <Card className={cn(
      "w-24 h-32 flex items-center justify-center",
      shouldHide && "bg-muted"
    )}>
      <CardContent className="p-0">
        {!shouldHide && (
          <div className="text-4xl flex items-center justify-center">
            {role === "hearts" && <Heart className="text-red-500" />}
            {role === "diamonds" && <Diamond className="text-blue-500" />}
            {role === "rectangle" && <Square className="text-green-500" />}
            {isJoker && <span>🃏</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}