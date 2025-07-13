// Real-time collaboration service (stub)
// Replace with Yjs, ShareDB, or custom WebSocket logic as needed

let sockets: Record<string, WebSocket> = {};

export function connectToCollaborationRoom(
  artifactId: string,
  onMessage: (data: any) => void
): WebSocket {
  if (sockets[artifactId]) return sockets[artifactId];
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.host;
  const ws = new WebSocket(`${protocol}://${host}/ws/collaboration/${artifactId}`);
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      onMessage(event.data);
    }
  };
  sockets[artifactId] = ws;
  return ws;
}

export function sendCollaborationUpdate(
  socket: WebSocket,
  update: any
) {
  if (socket && socket.readyState === 1) {
    socket.send(JSON.stringify(update));
  }
}
