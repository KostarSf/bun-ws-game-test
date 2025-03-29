import { Actor, Color, Engine, Scene, type SceneActivationContext } from "excalibur";
import type { GameEvent } from "./interfaces/events";

class MainScene extends Scene {
	bodies = new Map<string, Actor>();

	onActivate(context: SceneActivationContext<unknown>): void {
		const socket = new WebSocket("ws://localhost:3000/ws");
		socket.addEventListener("message", (event: MessageEvent<string>) => {
			const payload = JSON.parse(event.data) as GameEvent;

			if (payload.type === "create") {
				for (const { id, x, y, radius } of payload.data) {
					const actor = new Actor({ radius: radius, color: Color.White, x, y, name: `Body #${id}` });
					this.bodies.set(id, actor);
					this.add(actor);
				}

				return;
			}

			if (payload.type === "update") {
				for (const { id, x, y } of payload.data) {
					const body = this.bodies.get(id);
					if (!body) {
						continue;
					}

					body.pos.setTo(x, y);
				}

				return;
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

const game = new Game();
game.start();
