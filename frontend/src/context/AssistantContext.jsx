import { createContext, useContext, useState } from "react";
import { assistantApi } from "../services/api";

const AssistantContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAssistant = () => useContext(AssistantContext);

export function AssistantProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const sendMessage = async (message) => {
    const result = await assistantApi.message({ message, history: messages.slice(-8) });
    setMessages((current) => [...current, { role: "user", content: message }, { role: "assistant", content: result.reply }]);
    return result;
  };

  return <AssistantContext.Provider value={{ messages, sendMessage }}>{children}</AssistantContext.Provider>;
}