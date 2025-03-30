import type ServerTickEvent from "../server/events/ServerTickEvent";
import type StopEvent from "../server/events/StopEvent";
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

export type GameEvent = CreateEvent | UpdateEvent | DeleteEvent | ServerTickEvent | StopEvent;
