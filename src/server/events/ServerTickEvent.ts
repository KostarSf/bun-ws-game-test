import type { SerializedEntity } from "../ServerEntity";
import NetworkEvent from "../network/NetworkEvent";

export default class ServerTickEvent extends NetworkEvent {
	type = "tick";

	created: SerializedEntity[];
	updated: SerializedEntity[];
	removed: string[];

	constructor(created?: SerializedEntity[], updated?: SerializedEntity[], removed?: string[]) {
		super();

		this.created = created ?? [];
		this.updated = updated ?? [];
		this.removed = removed ?? [];
	}
}
