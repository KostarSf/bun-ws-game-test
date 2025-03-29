import type { SerializedEntity } from "../server/ServerEntity";
import type { Entity } from "./entities";

export interface CreateEvent {
	type: "create";
	data: Entity[];
}

export interface UpdateEvent {
	type: "update";
	data: Entity[];
}

export interface DeleteEvent {
	type: "delete";
	data: Entity[];
}

export interface ServerTickEvent {
	type: "tick";
	data: {
		created: SerializedEntity[];
		updated: SerializedEntity[];
		removed: string[];
	};
}

export type GameEvent = CreateEvent | UpdateEvent | DeleteEvent | ServerTickEvent;
