export const createWebSocket = (url: string) => {
  const ws = new WebSocket(url);

  const send = (data: any) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  };

  return { ws, send };
};
