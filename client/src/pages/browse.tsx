
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useState } from "react";
import { type Game } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";

export default function Browse() {
  const [, setLocation] = useLocation();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const form = useForm();

  const { data: games } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/games");
      return res.json();
    },
    refetchInterval: 5000
  });

  const joinGame = async (game: Game) => {
    if (game.password) {
      setSelectedGame(game);
    } else {
      setLocation(`/lobby/${game.code}`);
    }
  };

  const handleSubmitPassword = async (values: { password: string }) => {
    if (!selectedGame) return;
    const res = await apiRequest("POST", `/api/games/${selectedGame.code}/verify-password`, {
      password: values.password
    });
    if (res.ok) {
      setLocation(`/lobby/${selectedGame.code}`);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Browse Games</h1>
            <Button onClick={() => setLocation("/")}>Create Game</Button>
          </div>

          <div className="space-y-4">
            {games?.map(game => (
              <Card key={game.id}>
                <CardContent className="flex justify-between items-center p-4">
                  <div>
                    <h2 className="text-xl">Game {game.code}</h2>
                    <p className="text-sm text-muted-foreground">
                      {game.password ? "Password Protected" : "Public"} • 
                      {game.started ? "In Progress" : "Waiting"}
                    </p>
                  </div>
                  <Button onClick={() => joinGame(game)}>Join</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enter Password</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitPassword)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Join Game</Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
