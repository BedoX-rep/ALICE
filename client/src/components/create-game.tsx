import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { type Game } from "@shared/schema";

export default function CreateGame() {
  const [, setLocation] = useLocation();
  
  const createGame = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/games");
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
