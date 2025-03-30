import { Actor, Circle, Color, DisplayMode, Engine, Scene, type SceneActivationContext } from "excalibur";
import { PHYS_BODY_TYPE } from "./constants";
import type { GameEvent } from "./interfaces/events";
import type { PhysBodySerialized } from "./server/PhysBody";

class MainScene extends Scene {
	entitiesMap = new Map<string, Actor>();

	onActivate(context: SceneActivationContext<unknown>): void {
		this.camera.zoom = 0.5;
		const socket = new WebSocket("ws://localhost:3000/ws");

		socket.addEventListener("open", () => {
			socket.send("resume");
		});

		socket.addEventListener("message", (event: MessageEvent<string>) => {
			if (event.data === "stop") {
				for (const entity of this.entitiesMap.values()) {
					entity.kill();
				}

				this.entitiesMap.clear();
				return;
			}

			const payload = JSON.parse(event.data) as GameEvent;

			if (payload.type === "tick") {
				for (const entityId of payload.data.removed) {
					const entity = this.entitiesMap.get(entityId);

					if (entity) {
						entity.kill();
						this.entitiesMap.delete(entityId);
					}
				}

				for (const entity of payload.data.updated) {
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
