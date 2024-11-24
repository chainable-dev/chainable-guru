import { useState, useEffect } from "react";

export interface AgentState {
  thoughts: string[];
  actions: string[];
  plan: string[];
}

const initialState: AgentState = {
  thoughts: [],
  actions: [],
  plan: [],
};

export const useAgentState = (url: string): AgentState => {
  const [state, setState] = useState<AgentState>(initialState);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setState((prev) => ({
        ...prev,
        [message.type]: [...prev[message.type], message.content],
      }));
    };

    return () => ws.close();
  }, [url]);

  return state;
};
