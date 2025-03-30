import type { ITickable } from "./ITickable";
import PhysBody from "./PhysBody";
import type ServerEngine from "./ServerEngine";
import type ServerEntity from "./ServerEntity";
import { Vector } from "./Vector";

export default class ServerScene implements ITickable {
	private _entities: ServerEntity[] = [];
	get entities() {
		return this._entities;
	}

	private _removedEntities: ServerEntity[] = [];
	get removedEntities() {
		return this._removedEntities;
	}

	addEntity(...entity: ServerEntity[]) {
		this._entities.push(...entity);
	}

	start(engine: ServerEngine): void {
		const step = 300;

		for (let y = 0; y <= 1000; y += step) {
			for (let x = 0; x <= 2000; x += step) {
				engine.scene.addEntity(new PhysBody({ mass: 10, pos: new Vector(x, y) }));
			}
		}
	}

	stop(engine: ServerEngine): void {
		while (this._entities.length > 0) {
			this._entities.pop();
		}

		while (this._removedEntities.length > 0) {
			this._removedEntities.pop();
		}
	}

	tick(engine: ServerEngine, deltaTime: number): void {
		for (const entity of this.entities) {
			entity.tick(engine, deltaTime);
		}
	}

	tickEnd(engine: ServerEngine, deltaTime: number): void {
		while (this.removedEntities.length > 0) {
			this._removedEntities.pop();
		}

		for (const entity of this.entities) {
			entity.tickEnd(engine, deltaTime);

			if (entity.removed) {
				this.removedEntities.push(entity);
			}
		}

		this._entities = this._entities.filter((entity) => !entity.removed);
	}
}
