import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateGame from "@/components/create-game";
import JoinGame from "@/components/join-game";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Card Role Game
          </h1>
          
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Game</TabsTrigger>
              <TabsTrigger value="join">Join Game</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <CreateGame />
            </TabsContent>
            <TabsContent value="join">
              <JoinGame />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
