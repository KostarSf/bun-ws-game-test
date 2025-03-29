import { PHYS_BODY_TYPE } from "../constants";
import type ServerEngine from "./ServerEngine";
import ServerEntity, { type SerializedEntity } from "./ServerEntity";
import { Vector } from "./Vector";

export default class PhysBody extends ServerEntity {
	type = PHYS_BODY_TYPE;

	mass: number;
	pos: Vector;
	vel: Vector;

	constructor(args: { mass: number; pos: Vector; vel?: Vector }) {
		super();

		this.mass = args.mass;
		this.pos = Vector.from(args.pos);
		this.vel = Vector.from(args.vel ?? new Vector(0, 0));
	}

	tick(engine: ServerEngine): void {
		for (const other of engine.scene.entities) {
			if (!PhysBody.is(other) || other === this) {
				continue;
			}

			const diff = Vector.difference(this.pos, other.pos);
			const dist = Vector.distance(diff);

			const force = (other.mass / this.mass / (dist * dist)) * 6.67;

			this.vel.add(diff.mult(force));

			const canAbsorb = this.mass >= other.mass && dist < this.mass * 0.05 && !this.removed && !other.removed;
			if (canAbsorb) {
				other.removed = true;
				this.mass += other.mass;
			}
		}
	}

	tickEnd(engine: ServerEngine): void {
		this.pos.add(this.vel);
	}

	serialize(): PhysBodySerialized {
		return {
			id: this.id,
			type: this.type,
			posX: this.pos.x,
			posY: this.pos.y,
		};
	}

	static is(entity: ServerEntity): entity is PhysBody {
		return entity.type === PHYS_BODY_TYPE;
	}
}

export interface PhysBodySerialized extends SerializedEntity {
	posX: number;
	posY: number;
}
