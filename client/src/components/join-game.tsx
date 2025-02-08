import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { joinGameSchema, type Player } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { getDeviceId } from "@/lib/fingerprint";

export default function JoinGame() {
  const [, setLocation] = useLocation();
  const form = useForm({
    resolver: zodResolver(joinGameSchema),
    defaultValues: {
      code: "",
      name: "",
      deviceId: ""
    }
  });

  const { data: deviceId } = useQuery({
    queryKey: ["deviceId"],
    queryFn: getDeviceId
  });

  const joinGame = useMutation({
    mutationFn: async (values: {code: string, name: string}) => {
      const res = await apiRequest("POST", `/api/games/${values.code}/join`, {
        ...values,
        deviceId
      });
      return res.json() as Promise<Player>;
    },
    onSuccess: (_, variables) => {
      setLocation(`/lobby/${variables.code}`);
    }
  });

  async function onSubmit(values: {code: string, name: string}) {
    if (!deviceId) return;
    joinGame.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Game Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter game code..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={joinGame.isPending}
        >
          {joinGame.isPending ? "Joining..." : "Join Game"}
        </Button>
      </form>
    </Form>
  );
}
