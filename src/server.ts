import gamepage from "./index.html";
import ServerEngine from "./server/ServerEngine";

const serverEngine = new ServerEngine();

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
	websocket: serverEngine.createWebsocketHandler(),
});

console.log("Server started at http://localhost:3000");

serverEngine.start(server);
