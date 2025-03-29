import type ServerEngine from "./ServerEngine";

export interface ITickable {
	tick(engine: ServerEngine): void;
	tickEnd(engine: ServerEngine): void;
}
