import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameSchema, joinGameSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  app.post("/api/games", async (req, res) => {
    const game = await storage.createGame(req.body.password);
    res.json(game);
  });

  app.get("/api/games", async (req, res) => {
    const games = await storage.getGames();
    res.json(games);
  });

  app.post("/api/games/:code/verify-password", async (req, res) => {
    const game = await storage.getGameByCode(req.params.code);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    if (game.password !== req.body.password) {
      return res.status(403).json({ message: "Invalid password" });
    }
    res.json({ success: true });
  });

  app.post("/api/games/:code/kick", async (req, res) => {
    const game = await storage.getGameByCode(req.params.code);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    await storage.removePlayer(game.id, req.body.playerId);
    res.json({ success: true });
  });

  app.get("/api/games/:code/messages", async (req, res) => {
    const game = await storage.getGameByCode(req.params.code);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    const messages = await storage.getMessages(game.id);
    res.json(messages);
  });

  app.post("/api/games/:code/messages", async (req, res) => {
    const game = await storage.getGameByCode(req.params.code);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    const message = await storage.addMessage(game.id, {
      content: req.body.content,
      playerId: req.body.playerId,
      toPlayerId: req.body.toPlayerId,
      isPrivate: !!req.body.toPlayerId
    });
    res.json(message);
  });

  app.get("/api/games/:code", async (req, res) => {
    const game = await storage.getGameByCode(req.params.code);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    res.json(game);
  });

  app.post("/api/games/:code/join", async (req, res) => {
    try {
      const data = joinGameSchema.parse(req.body);
      const game = await storage.getGameByCode(data.code);

      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      const players = await storage.getPlayers(game.id);
      if (players.length >= 12) {
        return res.status(400).json({ message: "Game is full" });
      }

      // If player already exists in game, return that player
      const existingPlayer = await storage.getPlayerByDeviceId(game.id, data.deviceId);
      if (existingPlayer) {
        return res.json(existingPlayer);
      }

      const player = await storage.addPlayer(game.id, {
        name: data.name,
        deviceId: data.deviceId,
        gameId: game.id
      });

      res.json(player);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post("/api/games/:code/joker-count", async (req, res) => {
    const game = await storage.getGameByCode(req.params.code);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const count = parseInt(req.body.count);
    if (isNaN(count) || count < 1 || count > 3) {
      return res.status(400).json({ message: "Invalid joker count" });
    }

    const updatedGame = await storage.updateJokerCount(game.id, count);
    res.json(updatedGame);
  });

  app.post("/api/games/:code/start", async (req, res) => {
    const game = await storage.getGameByCode(req.params.code);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const jokerCount = parseInt(req.body.jokerCount as string);
    if (!isNaN(jokerCount)) {
      await storage.updateJokerCount(game.id, jokerCount);
    }

    await storage.startGame(game.id);
    res.json({ success: true });
  });

  app.get("/api/games/:code/players", async (req, res) => {
    const game = await storage.getGameByCode(req.params.code);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const players = await storage.getPlayers(game.id);
    res.json(players);
  });

  app.post("/api/games/:code/next-round", async (req, res) => {
    const game = await storage.getGameByCode(req.params.code);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (!game.started) {
      return res.status(400).json({ message: "Game hasn't started yet" });
    }

    await storage.nextRound(game.id);
    res.json({ success: true });
  });

  app.post("/api/games/:code/stop", async (req, res) => {
    const game = await storage.getGameByCode(req.params.code);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    await storage.stopGame(game.id);
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}