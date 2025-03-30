import type ServerEngine from "./ServerEngine";

export interface ITickable {
	tick(engine: ServerEngine, deltaTime: number): void;
	tickEnd(engine: ServerEngine, deltaTime: number): void;
}
