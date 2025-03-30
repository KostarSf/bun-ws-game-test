import { EventEmitter, type EventKey, type Handler, type Subscription } from "../utils/EventEmitter";
import ClientConnectEvent from "../events/ClientConnectEvent";
import ClientDisconnectEvent from "../events/ClientDisconnectEvent";
import type NetworkEvent from "./NetworkEvent";

export type WSData = {
	/** Connection identifier */
	id: string;
};

type NetworkManagerEvents = {
	connect: ClientConnectEvent;
	disconnect: ClientDisconnectEvent;
};

export default class ServerNetworkManager {
	private eventEmitter = new EventEmitter<NetworkManagerEvents>();

	private connections = new Map<string, Bun.ServerWebSocket<WSData>>();
	private eventRegistry = new Map<
		string,
		{ klass: { new (): NetworkEvent }; callback: (event: NetworkEvent) => void }
	>();

	onConnect<T extends WSData>(ws: Bun.ServerWebSocket<T>) {
		this.connections.set(ws.data.id, ws);

		const connectEvent = new ClientConnectEvent(ws.data.id);

		this.broadcast(connectEvent);
		this.eventEmitter.emit("connect", connectEvent);
	}

	onMessage<T extends WSData>(ws: Bun.ServerWebSocket<T>, message: string | Buffer<ArrayBufferLike>) {
		try {
			const payload = JSON.parse(message.toString()) as NetworkEvent;

			const eventEntry = this.eventRegistry.get(payload.type);
			if (!eventEntry) {
				return;
			}

			eventEntry.callback(Object.assign(new eventEntry.klass(), payload));
		} catch (err) {
			console.error(err);
		}
	}

	onDisconnect<T extends WSData>(ws: Bun.ServerWebSocket<T>, code: number, reason: string) {
		this.connections.delete(ws.data.id);

		const disconnectEvent = new ClientDisconnectEvent(ws.data.id);

		this.broadcast(disconnectEvent);
		this.eventEmitter.emit("disconnect", disconnectEvent);
	}

	broadcast(event: NetworkEvent) {
		const eventPayload = JSON.stringify(event);
		for (const ws of this.connections.values()) {
			ws.send(eventPayload);
		}
	}

	send(id: string, event: NetworkEvent) {
		const ws = this.connections.get(id);
		if (!ws) {
			console.warn(`[ServerNetworkManager::send] Connection doesn't exist - ID:${id}`);
			return;
		}

		ws.sendText(JSON.stringify(event));
	}

	register<T extends NetworkEvent>(klass: { new (): T }, callback: (event: T) => void) {
		this.eventRegistry.set(new klass().type, { klass, callback: callback as (event: NetworkEvent) => void });
	}

	on<TEventName extends EventKey<NetworkManagerEvents>>(
		eventName: TEventName,
		handler: Handler<NetworkManagerEvents[TEventName]>,
	): Subscription {
		return this.eventEmitter.on(eventName, handler);
	}

	off<TEventName extends EventKey<NetworkManagerEvents>>(
		eventName: TEventName,
		handler: Handler<NetworkManagerEvents[TEventName]>,
	): void {
		this.eventEmitter.off(eventName, handler);
	}
}
