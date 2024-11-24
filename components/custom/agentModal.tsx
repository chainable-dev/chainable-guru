import React from "react";
import { AgentState } from "../../hooks/useAgentState";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentState: AgentState;
}

const AgentModal: React.FC<AgentModalProps> = ({ isOpen, onClose, agentState }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>AI Agent Thinking...</h3>
        <div>
          <h4>💭 Thoughts:</h4>
          <ul>
            {agentState.thoughts.map((thought, idx) => (
              <li key={idx}>{thought}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>📋 Plan:</h4>
          <ol>
            {agentState.plan.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
        <div>
          <h4>✅ Actions:</h4>
          <ul>
            {agentState.actions.map((action, idx) => (
              <li key={idx}>{action}</li>
            ))}
          </ul>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AgentModal;
