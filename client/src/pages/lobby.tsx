import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PlayerList from "@/components/player-list";
import { type Game, type Player } from "@shared/schema";
import { getDeviceId } from "@/lib/fingerprint";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Lobby() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const gameCode = location.split("/")[2];

  const { data: deviceId } = useQuery({
    queryKey: ["deviceId"],
    queryFn: getDeviceId,
  });

  const [jokerCount, setJokerCount] = useState<number | "randomized" | null>(null);

  const { data: game } = useQuery<Game>({
    queryKey: [`/api/games/${gameCode}`],
    enabled: !!gameCode,
    onSuccess: (data) => {
      // Set initial jokerCount from the server if available
      if (data.jokerCount !== undefined) {
          setJokerCount(data.jokerCount);
      }
    }
  });

  const { data: players } = useQuery<Player[]>({
    queryKey: [`/api/games/${gameCode}/players`],
    enabled: !!game,
    refetchInterval: 1000,
  });

  const startGame = useMutation({
    mutationFn: async () => {
      // Generate random joker count if "randomized" is selected
      const finalJokerCount = jokerCount === "randomized" ? 
        Math.floor(Math.random() * 3) + 1 : // Random number between 1-3
        Number(jokerCount);
        
      await apiRequest("POST", `/api/games/${gameCode}/start`, { jokerCount: finalJokerCount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameCode}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameCode}/players`] });
    }
  });

  const nextRound = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/games/${gameCode}/next-round`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameCode}/players`] });
      toast({
        title: "Next Round Started",
        description: "Roles have been shuffled!"
      });
    }
  });

  const stopGame = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/games/${gameCode}/stop`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameCode}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameCode}/players`] });
      toast({
        title: "Game Stopped",
        description: "You can now start a new game"
      });
    }
  });

  // Auto-join game for creator
  useEffect(() => {
    if (game && deviceId && (!players || !players.find(p => p.deviceId === deviceId))) {
      fetch(`/api/games/${gameCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: gameCode,
          name: 'Player ' + (players?.length || 0 + 1),
          deviceId
        })
      });
    }
  }, [game, deviceId, players, gameCode]);

  if (!game || !players || !deviceId) {
    return null;
  }

  const currentPlayer = players.find(p => p.deviceId === deviceId);
  if (!currentPlayer) {
    return null;
  }

  const isCreator = players[0]?.id === currentPlayer.id;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Game Lobby</h1>
            <div className="text-sm text-muted-foreground">
              Code: <span className="font-mono">{game.code}</span>
            </div>
          </div>

          <PlayerList 
            players={players}
            currentPlayerId={currentPlayer.id}
            onKick={isCreator ? (playerId) => kickPlayer.mutate(playerId) : undefined}
          />

          <div className="mt-4">
            <Chat
              gameCode={gameCode}
              players={players}
              currentPlayer={currentPlayer}
            />
          </div>

          {isCreator && (
            <div className="flex gap-4 mt-6">
              {isCreator && (
                <div>
                  <label htmlFor="jokerCount">Joker Count:</label>
                  <select id="jokerCount" value={jokerCount} onChange={(e) => setJokerCount(e.target.value as number | "randomized")}>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={"randomized"}>Randomized</option>
                  </select>
                </div>
              )}
              {!game.started && players.length >= 2 && (
                <Button 
                  className="flex-1"
                  onClick={() => startGame.mutate()}
                  disabled={startGame.isPending}
                >
                  {startGame.isPending ? "Starting Game..." : "Start Game"}
                </Button>
              )}

              {game.started && (
                <>
                  <Button 
                    className="flex-1"
                    onClick={() => nextRound.mutate()}
                    disabled={nextRound.isPending}
                  >
                    {nextRound.isPending ? "Starting Next Round..." : "Next Round"}
                  </Button>
                  <Button 
                    className="flex-1"
                    variant="destructive"
                    onClick={() => stopGame.mutate()}
                    disabled={stopGame.isPending}
                  >
                    {stopGame.isPending ? "Stopping Game..." : "Stop Game"}
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}