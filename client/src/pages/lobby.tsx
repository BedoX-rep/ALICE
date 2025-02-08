import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import PlayerList from "@/components/player-list";
import { type Game, type Player } from "@shared/schema";
import { getDeviceId } from "@/lib/fingerprint";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Lobby() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const gameCode = location.split("/")[2];

  const { data: game } = useQuery<Game>({
    queryKey: [`/api/games/${gameCode}`],
  });

  const { data: players } = useQuery<Player[]>({
    queryKey: [`/api/games/${gameCode}/players`],
    refetchInterval: 1000,
  });

  const { data: deviceId } = useQuery({
    queryKey: ["deviceId"],
    queryFn: getDeviceId,
  });

  const currentPlayer = players?.find(p => p.deviceId === deviceId);

  useEffect(() => {
    if (game && players && deviceId && !currentPlayer) {
      toast({
        title: "Error",
        description: "You are not part of this game",
        variant: "destructive"
      });
      setLocation("/");
    }
  }, [game, players, deviceId, currentPlayer, toast, setLocation]);

  if (!game || !players || !deviceId || !currentPlayer) {
    return null;
  }

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
          />
        </CardContent>
      </Card>
    </div>
  );
}