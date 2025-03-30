import { randomUUIDv7 } from "bun";
import NetworkEvent from "../network/NetworkEvent";

export default class ClientConnectEvent extends NetworkEvent {
	type = "client-connect";

	id: string;

	constructor(id?: string) {
		super();

		this.id = id ?? randomUUIDv7();
	}
}
