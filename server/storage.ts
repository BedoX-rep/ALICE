import { nanoid } from "nanoid";
import { type Game, type InsertGame, type Player, type InsertPlayer, type Role } from "@shared/schema";

const ROLES: Role[] = ["hearts", "diamonds", "rectangle", "joker"];

export interface IStorage {
  createGame(): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  getGameByCode(code: string): Promise<Game | undefined>;
  getPlayers(gameId: number): Promise<Player[]>;
  addPlayer(gameId: number, player: InsertPlayer): Promise<Player>;
  getPlayerByDeviceId(gameId: number, deviceId: string): Promise<Player | undefined>;
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
      started: false
    };
    this.games.set(id, game);
    return game;
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
      gameId
    };
    
    this.players.set(id, newPlayer);
    return newPlayer;
  }

  async getPlayerByDeviceId(gameId: number, deviceId: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(
      p => p.gameId === gameId && p.deviceId === deviceId
    );
  }
}

export const storage = new MemStorage();
