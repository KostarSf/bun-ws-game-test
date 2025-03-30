import NetworkEvent from "../network/NetworkEvent";

export default class PauseEvent extends NetworkEvent {
	type = "pause";

	value: boolean;

	constructor(value?: boolean) {
		super();

		this.value = value ?? true;
	}
}
