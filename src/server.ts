import gamepage from "./index.html";
import type { Entity } from "./interfaces/entities";
import type { CreateEvent, UpdateEvent } from "./interfaces/events";
import { circlesCollide, gravitationalForce, resolveCollision, updateObject } from "./utils";

const entities: Entity[] = [
	{ id: "1", x: 200, y: 200, radius: 20, mass: 4000, velX: 0, velY: 0, forceX: 0, forceY: 0 },
	{ id: "2", x: 450, y: 300, radius: 10, mass: 10, velX: 0, velY: 0, forceX: 0, forceY: 0 },
	{ id: "3", x: 350, y: 350, radius: 10, mass: 200, velX: 0, velY: 0, forceX: 0, forceY: 0 },
];

const server = Bun.serve({
	routes: {
		"/": gamepage,
		"/ws": (request, server) => {
			const upgraded = server.upgrade(request);
			if (!upgraded) {
				return new Response("Upgrade failed", { status: 400 });
			}
			return new Response(null, { status: 101 });
		},
	},
	websocket: {
		open(ws) {
			ws.subscribe("update");
			ws.send(JSON.stringify({ type: "create", data: entities } satisfies CreateEvent));
		},
		message(ws, message) {
			console.log(message);
		},
		close(ws, code, reason) {
			ws.unsubscribe("update");
		},
	},
});

setInterval(() => {
	const deltaTime = 1 / 60;

	for (const body of entities) {
		for (const otherBody of entities) {
			if (otherBody === body) {
				continue;
			}

			const force = gravitationalForce(body, otherBody);

			body.forceX += force.x;
			body.forceY += force.y;
		}
	}

	for (const body of entities) {
		updateObject(body, deltaTime);
	}

	for (const body of entities) {
		for (const otherBody of entities) {
			if (otherBody === body) {
				continue;
			}

			if (circlesCollide(body, otherBody)) {
				resolveCollision(body, otherBody);
			}
		}
	}

	server.publish("update", JSON.stringify({ type: "update", data: entities } satisfies UpdateEvent));
}, 16);
