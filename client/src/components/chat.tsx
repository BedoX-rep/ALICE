
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";

interface ChatProps {
  gameCode: string;
  players: any[];
}

export default function Chat({ gameCode, players }: ChatProps) {
  const [message, setMessage] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const { data: messages = [] as any[] } = useQuery({
    queryKey: [`/api/games/${gameCode}/messages`],
    queryFn: () => apiRequest("GET", `/api/games/${gameCode}/messages`),
    refetchInterval: 1000
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const deviceId = localStorage.getItem("deviceId");
      const player = players.find(p => p.deviceId === deviceId);
      
      await apiRequest("POST", `/api/games/${gameCode}/messages`, {
        content: message,
        playerId: player?.id,
        toPlayerId: selectedPlayer,
        isPrivate: !!selectedPlayer
      });
      
      setMessage("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameCode}/messages`] });
    }
  });

  return (
    <Card className="p-4">
      <ScrollArea className="h-[200px] mb-4">
        {messages.map((msg: any) => {
          const sender = players.find(p => p.id === msg.playerId);
          const recipient = players.find(p => p.id === msg.toPlayerId);
          
          return (
            <div key={msg.id} className="mb-2">
              <span className="font-bold">{sender?.name}</span>
              {msg.isPrivate && (
                <span className="text-sm text-muted-foreground"> to {recipient?.name}</span>
              )}
              <span>: {msg.content}</span>
            </div>
          );
        })}
      </ScrollArea>
      
      <div className="flex gap-2">
        <select 
          className="border rounded p-2"
          value={selectedPlayer || ""}
          onChange={e => setSelectedPlayer(e.target.value || null)}
        >
          <option value="">Everyone</option>
          {players.map(player => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
        
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        
        <Button onClick={() => sendMessage.mutate()}>Send</Button>
      </div>
    </Card>
  );
}
