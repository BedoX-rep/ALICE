import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { type Game } from "@shared/schema";
import { useState } from "react";

export default function CreateGame() {
  const [, setLocation] = useLocation();
  const [jokerCount, setJokerCount] = useState("3");
  
  const createGame = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games", { jokerCount: parseInt(jokerCount) });
      return res.json() as Promise<Game>;
    },
    onSuccess: (game) => {
      setLocation(`/lobby/${game.code}`);
    },
  });

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-muted-foreground">
        Create a new game and share the code with your friends to let them join.
      </p>

      <div className="space-y-2">
        <Label htmlFor="jokerCount">Number of Jokers (1-5)</Label>
        <Input
          id="jokerCount"
          type="number"
          min="1"
          max="5"
          value={jokerCount}
          onChange={(e) => setJokerCount(e.target.value)}
        />
      </div>
      
      <Button 
        className="w-full" 
        onClick={() => createGame.mutate()}
        disabled={createGame.isPending}
      >
        {createGame.isPending ? "Creating..." : "Create Game"}
      </Button>
    </div>
  );
}
