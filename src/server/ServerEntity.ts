import { randomUUIDv7 } from "bun";
import type { ITickable } from "./ITickable";
import type ServerEngine from "./ServerEngine";

export default class ServerEntity implements ITickable {
	id = randomUUIDv7();
	type = "server-entity";

	removed = false;

	tick(engine: ServerEngine): void {}

	tickEnd(engine: ServerEngine): void {}

	serialize(): SerializedEntity {
		return { id: this.id, type: this.type };
	}
}

export interface SerializedEntity {
	id: string;
	type: string;
}
