
import { useState } from "react";
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
  const deviceId = localStorage.getItem("deviceId");
  const currentPlayer = players.find(p => p.deviceId === deviceId);

  const { data: response } = useQuery({
    queryKey: [`/api/games/${gameCode}/messages`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/games/${gameCode}/messages`);
      const data = await res.json();
      return data || [];
    },
    refetchInterval: 1000
  });
  
  const messages = Array.isArray(response) ? response : [];

  const sendMessage = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/games/${gameCode}/messages`, {
        content: message,
        playerId: currentPlayer?.id,
        toPlayerId: selectedPlayer,
        isPrivate: !!selectedPlayer
      });
      setMessage("");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameCode}/messages`] });
    }
  });

  const shouldShowMessage = (msg: any) => {
    if (!msg.isPrivate) return true;
    return msg.playerId === currentPlayer?.id || msg.toPlayerId === currentPlayer?.id;
  };

  const formatMessage = (msg: any) => {
    const sender = players.find(p => p.id === msg.playerId)?.name || 'Unknown';
    const recipient = players.find(p => p.id === msg.toPlayerId)?.name || 'Unknown';
    
    if (msg.isPrivate) {
      if (msg.playerId === currentPlayer?.id) {
        return `To '${recipient}': "${msg.content}"`;
      } else {
        return `From '${sender}': "${msg.content}"`;
      }
    }
    return `${sender}: ${msg.content}`;
  };

  return (
    <Card className="p-4">
      <ScrollArea className="h-[200px] mb-4">
        {messages.filter(shouldShowMessage).map((msg: any) => (
          <div key={msg.id} className="mb-2">
            {formatMessage(msg)}
          </div>
        ))}
      </ScrollArea>
      
      <div className="flex gap-2">
        <select 
          className="border rounded p-2"
          value={selectedPlayer || ""}
          onChange={e => setSelectedPlayer(e.target.value || null)}
        >
          <option value="">Everyone</option>
          {players.filter(p => p.id !== currentPlayer?.id).map(player => (
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
