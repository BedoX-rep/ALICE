import { type Player } from "@shared/schema";
import GameCard from "./game-card";

type PlayerListProps = {
  players: Player[];
  currentPlayerId: number;
};

export default function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {players.map((player) => (
        <div 
          key={player.id}
          className="flex items-center gap-4 p-4 rounded-lg border"
        >
          <GameCard 
            role={player.role}
            hideRole={player.id === currentPlayerId}
          />
          <div>
            <h3 className="font-semibold">{player.name}</h3>
            <p className="text-sm text-muted-foreground">
              {player.id === currentPlayerId ? "You" : "Other Player"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
