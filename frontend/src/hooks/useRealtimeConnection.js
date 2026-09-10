import { useEffect, useState } from "react";
import { createRealtimeClient } from "../services/realtime/realtimeClient";

const useRealtimeConnection = (url, onMessage) => {
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    if (!url) return undefined;

    const client = createRealtimeClient({
      url,
      onMessage,
      onStatus: setStatus,
    });

    return client.close;
  }, [url, onMessage]);

  return { status: url ? status : "disabled" };
};

export default useRealtimeConnection;
