import { nanoid } from "nanoid";
import { type Game, type InsertGame, type Player, type InsertPlayer, type Role } from "@shared/schema";

const ROLES: Role[] = [
  "hearts", "hearts", "hearts",
  "diamonds", "diamonds", "diamonds",
  "rectangle", "rectangle", "rectangle",
  "joker", "joker", "joker"
];

const DISGUISE_ROLES: Role[] = ["hearts", "diamonds", "rectangle"]; // Joker can only disguise as these

export interface IStorage {
  createGame(): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  getGameByCode(code: string): Promise<Game | undefined>;
  getPlayers(gameId: number): Promise<Player[]>;
  addPlayer(gameId: number, player: InsertPlayer): Promise<Player>;
  getPlayerByDeviceId(gameId: number, deviceId: string): Promise<Player | undefined>;
  startGame(gameId: number): Promise<void>;
  nextRound(gameId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private games: Map<number, Game>;
  private players: Map<number, Player>;
  private currentGameId: number;
  private currentPlayerId: number;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.currentGameId = 1;
    this.currentPlayerId = 1;
  }

  async createGame(): Promise<Game> {
    const id = this.currentGameId++;
    const game: Game = {
      id,
      code: nanoid(6).toUpperCase(),
      started: false,
      jokerCount: 1
    };
    this.games.set(id, game);
    return game;
  }

  async updateJokerCount(gameId: number, count: number): Promise<Game | undefined> {
    const game = await this.getGame(gameId);
    if (!game) return;
    const updatedGame = { ...game, jokerCount: count };
    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGameByCode(code: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(g => g.code === code);
  }

  async getPlayers(gameId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(p => p.gameId === gameId);
  }

  async addPlayer(gameId: number, player: InsertPlayer): Promise<Player> {
    const players = await this.getPlayers(gameId);
    const availableRoles = [...ROLES];
    players.forEach(p => {
      const idx = availableRoles.indexOf(p.role as Role);
      if (idx > -1) {
        availableRoles.splice(idx, 1);
      }
    });

    const role = availableRoles[Math.floor(Math.random() * availableRoles.length)];
    const id = this.currentPlayerId++;

    const newPlayer: Player = {
      ...player,
      id,
      role,
      gameId,
      disguisedAs: null
    };

    this.players.set(id, newPlayer);
    return newPlayer;
  }

  async getPlayerByDeviceId(gameId: number, deviceId: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      p => p.gameId === gameId && p.deviceId === deviceId
    );
  }

  async stopGame(gameId: number): Promise<void> {
    const game = await this.getGame(gameId);
    if (!game) return;
    this.games.set(gameId, { ...game, started: false });
  }

  async startGame(gameId: number): Promise<void> {
    const game = await this.getGame(gameId);
    if (!game) return;

    const players = await this.getPlayers(gameId);
    const playerCount = players.length;

    // Create array of roles based on joker count
    const nonJokerRoles: Role[] = ["hearts", "diamonds", "rectangle"];
    let roles: Role[] = [];

    // Add jokers based on joker count
    for (let i = 0; i < game.jokerCount; i++) {
      roles.push("joker");
    }

    // Fill remaining slots with random non-joker roles
    while (roles.length < playerCount) {
      const randomRole = nonJokerRoles[Math.floor(Math.random() * nonJokerRoles.length)];
      roles.push(randomRole);
    }

    // Shuffle roles
    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    // Assign roles to players
    for (let i = 0; i < players.length; i++) {
      const role = roles[i];
      const disguisedAs = role === "joker" 
        ? DISGUISE_ROLES[Math.floor(Math.random() * DISGUISE_ROLES.length)]
        : null;

      this.players.set(players[i].id, { ...players[i], role, disguisedAs });
    }

    // Mark game as started
    this.games.set(gameId, { ...game, started: true });
  }

  async nextRound(gameId: number): Promise<void> {
    const players = await this.getPlayers(gameId);

    // Separate jokers and non-jokers
    const jokerPlayers = players.filter(p => p.role === "joker");
    const nonJokerPlayers = players.filter(p => p.role !== "joker");

    // Get available non-joker roles
    const availableRoles = ROLES.filter(role => role !== "joker");

    // Shuffle non-joker players' roles
    for (const player of nonJokerPlayers) {
      const randomIndex = Math.floor(Math.random() * availableRoles.length);
      const newRole = availableRoles.splice(randomIndex, 1)[0];
      this.players.set(player.id, { ...player, role: newRole, disguisedAs: null });
    }

    // Reassign random disguises to jokers
    for (const player of jokerPlayers) {
      const newDisguise = DISGUISE_ROLES[Math.floor(Math.random() * DISGUISE_ROLES.length)];
      this.players.set(player.id, { ...player, disguisedAs: newDisguise });
    }
  }
}

export const storage = new MemStorage();