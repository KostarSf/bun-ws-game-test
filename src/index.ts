import { Actor, Circle, Color, DisplayMode, Engine, Scene, type SceneActivationContext } from "excalibur";
import { PHYS_BODY_TYPE } from "./constants";
import type { GameEvent } from "./interfaces/events";
import type { PhysBodySerialized } from "./server/PhysBody";
import PauseEvent from "./server/events/PauseEvent";
import type ServerTickEvent from "./server/events/ServerTickEvent";

class MainScene extends Scene {
	entitiesMap = new Map<string, Actor>();

	onActivate(context: SceneActivationContext<unknown>): void {
		this.camera.zoom = 0.5;
		const socket = new WebSocket("ws://localhost:3000/ws");

		socket.addEventListener("open", () => {
			socket.send(JSON.stringify(new PauseEvent(false)));
		});

		socket.addEventListener("message", (event: MessageEvent<string>) => {
			const payload = JSON.parse(event.data) as GameEvent;

			if (payload.type === "stop") {
				for (const entity of this.entitiesMap.values()) {
					entity.kill();
				}

				this.entitiesMap.clear();
				return;
			}

			if (payload.type === "tick") {
				const tickEvent = payload as ServerTickEvent;

				for (const entityId of tickEvent.removed) {
					const entity = this.entitiesMap.get(entityId);

					if (entity) {
						entity.kill();
						this.entitiesMap.delete(entityId);
					}
				}

				for (const entity of tickEvent.updated) {
					if (entity.type !== PHYS_BODY_TYPE) {
						continue;
					}

					const physBody = entity as PhysBodySerialized;

					const existingEntity = this.entitiesMap.get(physBody.id);
					if (existingEntity) {
						existingEntity.pos.setTo(physBody.posX, physBody.posY);
						existingEntity.scale.setTo(physBody.radius / 10, physBody.radius / 10);
						continue;
					}

					const actor = new Actor({
						radius: physBody.radius,
						color: Color.White,
						x: physBody.posX,
						y: physBody.posY,
					});
					this.entitiesMap.set(physBody.id, actor);
					this.add(actor);
				}
			}
		});
	}
}

class Game extends Engine {
	start() {
		this.add("main-scene", new MainScene());
		return super.start().then(() => {
			this.goToScene("main-scene");
		});
	}
}

const game = new Game({
	displayMode: DisplayMode.FillScreen,
	backgroundColor: Color.Black,
});
game.start();
