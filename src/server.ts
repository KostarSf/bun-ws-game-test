import { randomUUIDv7 } from "bun";
import gamepage from "./index.html";
import ServerEngine from "./server/ServerEngine";
import type { WSData } from "./server/network/ServerNetworkManager";

const engine = new ServerEngine();

const server = Bun.serve({
	routes: {
		"/": gamepage,
		"/ws": (request, server) => {
			const upgraded = server.upgrade<WSData>(request, { data: { id: randomUUIDv7() } });
			if (!upgraded) {
				return new Response("Upgrade failed", { status: 400 });
			}
			return new Response(null, { status: 101 });
		},
	},
	websocket: {
		open(ws: Bun.ServerWebSocket<WSData>) {
			engine.network.onConnect(ws);
			engine.start();
		},
		message(ws, message) {
			engine.network.onMessage(ws, message);
		},
		close(ws, code, reason) {
			engine.stop();
			engine.network.onDisconnect(ws, code, reason);
		},
	},
});

console.log("Server started at http://localhost:3000");

// engine.start();
