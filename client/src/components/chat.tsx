
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Player } from "@shared/schema";

export default function Chat({ gameCode, players, currentPlayer }: { 
  gameCode: string;
  players: Player[];
  currentPlayer: Player;
}) {
  const [message, setMessage] = useState("");
  const [toPlayer, setToPlayer] = useState<string>("public");

  const { data: messages } = useQuery({
    queryKey: [`/api/games/${gameCode}/messages`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/games/${gameCode}/messages`);
      return res.json();
    },
    refetchInterval: 1000
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/games/${gameCode}/messages`, {
        content: message,
        toPlayerId: toPlayer === "public" ? null : parseInt(toPlayer)
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameCode}/messages`] });
    }
  });

  return (
    <Card className="p-4 h-[400px] flex flex-col">
      <div className="flex gap-2 mb-4">
        <Select value={toPlayer} onValueChange={setToPlayer}>
          <SelectTrigger>
            <SelectValue placeholder="Send to..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            {players.map(player => (
              player.id !== currentPlayer.id && (
                <SelectItem key={player.id} value={player.id.toString()}>
                  {player.name}
                </SelectItem>
              )
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 mb-4">
        {messages?.map(msg => (
          <div
            key={msg.id}
            className={`mb-2 ${msg.playerId === currentPlayer.id ? 'text-right' : ''}`}
          >
            <span className="text-sm text-muted-foreground">
              {players.find(p => p.id === msg.playerId)?.name}:
            </span>
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={e => e.key === 'Enter' && sendMessage.mutate()}
        />
        <Button onClick={() => sendMessage.mutate()}>Send</Button>
      </div>
    </Card>
  );
}
