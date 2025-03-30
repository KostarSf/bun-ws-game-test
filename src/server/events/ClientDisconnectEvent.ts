import { randomUUIDv7 } from "bun";
import NetworkEvent from "../network/NetworkEvent";

export default class ClientDisconnectEvent extends NetworkEvent {
	type = "client-disconnect";

	id: string;

	constructor(id?: string) {
		super();

		this.id = id ?? randomUUIDv7();
	}
}
