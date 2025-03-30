import ServerScene from "./ServerScene";
import PauseEvent from "./events/PauseEvent";
import ServerTickEvent from "./events/ServerTickEvent";
import StopEvent from "./events/StopEvent";
import ServerNetworkManager from "./network/ServerNetworkManager";

export default class ServerEngine {
	private _network: ServerNetworkManager = new ServerNetworkManager();
	get network() {
		return this._network;
	}

	private _scene = new ServerScene();
	get scene() {
		return this._scene;
	}

	stopLoop = true;
	loopDuration = 0;

	timeFactor = 1;
	pause = true;

	constructor() {
		this.network.register(PauseEvent, (event) => {
			this.pause = event.value;
		});
	}

	start() {
		if (!this.stopLoop) {
			return;
		}

		this.scene.start(this);
		this.stopLoop = false;
		this.loopDuration = 0;

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

			this.loopDuration = Math.max(end - start, msTime);
		}
	}

	stop() {
		if (this.stopLoop) {
			return;
		}

		this.pause = true;
		this.stopLoop = true;

		this.scene.stop(this);

		this.network.broadcast(new StopEvent());
	}

	private tick() {
		const deltaTime = (this.loopDuration / 1000) * 60 * this.timeFactor;

		if (!this.pause) {
			this.scene.tick(this, deltaTime);
			this.scene.tickEnd(this, deltaTime);
		}

		const updatedEntities = this.scene.entities
			.filter((entity) => this.scene.removedEntities.indexOf(entity) === -1)
			.map((entity) => entity.serialize());
		const removedEntities = this.scene.removedEntities.map((entity) => entity.id);

		this.network.broadcast(new ServerTickEvent([], updatedEntities, removedEntities));
	}
}
