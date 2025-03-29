import type { WebSocketHandler } from "bun";
import type { ServerTickEvent } from "../interfaces/events";
import ServerScene from "./ServerScene";

export default class ServerEngine {
	private _scene = new ServerScene();
	get scene() {
		return this._scene;
	}

	stopLoop = true;
	pause = true;

	server?: Bun.Server;

	createWebsocketHandler(): WebSocketHandler {
		const engine = this;

		return {
			open(ws) {
				ws.subscribe("tick");
				engine.start(engine.server!);
			},
			message(ws, message) {
				if (message === "resume") {
					engine.pause = false;
				}
			},
			close(ws, code, reason) {
				ws.unsubscribe("tick");
				engine.stop();
			},
		};
	}

	start(server: Bun.Server) {
		this.server = server;

		if (!this.stopLoop) {
			return;
		}

		this.scene.start(this);
		this.stopLoop = false;

		void this.gameLoop();
	}

	private async gameLoop() {
		const tps = 60;
		const msTime = 1000 / tps;

		while (!this.stopLoop) {
			const start = Date.now();
			this.tick();
			await Bun.sleep(new Date(start + msTime));
			const end = Date.now();

			console.log(end - start);
		}
	}

	stop() {
		if (this.stopLoop) {
			return;
		}

		this.pause = true;
		this.stopLoop = true;

		this.scene.stop(this);

		this.server?.publish("tick", "stop");
	}

	private tick() {
		if (!this.pause) {
			this.scene.tick(this);
			this.scene.tickEnd(this);
		}

		const updatedEntities = this.scene.entities
			.filter((entity) => this.scene.removedEntities.indexOf(entity) === -1)
			.map((entity) => entity.serialize());
		const removedEntities = this.scene.removedEntities.map((entity) => entity.id);

		const event: ServerTickEvent = {
			type: "tick",
			data: {
				created: [],
				updated: updatedEntities,
				removed: removedEntities,
			},
		};

		this.server?.publish("tick", JSON.stringify(event));
	}
}
