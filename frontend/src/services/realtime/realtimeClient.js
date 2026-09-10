const DEFAULT_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export const createRealtimeClient = ({ url, onMessage, onStatus }) => {
  let socket;
  let reconnectTimer;
  let reconnectDelay = DEFAULT_RECONNECT_DELAY;
  let stopped = false;

  const updateStatus = (status) => onStatus?.(status);

  const connect = () => {
    if (stopped || !url || typeof WebSocket === "undefined") return;

    updateStatus("connecting");
    socket = new WebSocket(url);

    socket.onopen = () => {
      reconnectDelay = DEFAULT_RECONNECT_DELAY;
      updateStatus("connected");
    };

    socket.onmessage = (event) => {
      try {
        onMessage?.(JSON.parse(event.data));
      } catch {
        updateStatus("message-error");
      }
    };

    socket.onerror = () => updateStatus("error");
    socket.onclose = () => {
      socket = undefined;
      if (stopped) return;
      updateStatus("reconnecting");
      reconnectTimer = window.setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
    };
  };

  connect();

  return {
    send: (message) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
        return true;
      }
      return false;
    },
    close: () => {
      stopped = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
      updateStatus("disabled");
    },
  };
};
