import type { Entity } from "./entities";

export interface CreateEvent {
	type: "create";
	data: Entity[];
}

export interface UpdateEvent {
	type: "update";
	data: Entity[];
}

export type GameEvent = CreateEvent | UpdateEvent;
