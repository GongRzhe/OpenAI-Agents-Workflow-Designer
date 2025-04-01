// src/context/NodeDataContext.tsx
import React, { createContext, useContext, useCallback } from 'react';
import { Node, useReactFlow } from 'reactflow';

interface NodeDataContextType {
  updateNodeData: (nodeId: string, data: any) => void;
}

const NodeDataContext = createContext<NodeDataContextType | undefined>(undefined);

export const NodeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setNodes } = useReactFlow();

  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // Merge new data with existing data
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  return (
    <NodeDataContext.Provider value={{ updateNodeData }}>
      {children}
    </NodeDataContext.Provider>
  );
};

export const useNodeData = (): NodeDataContextType => {
  const context = useContext(NodeDataContext);
  if (context === undefined) {
    throw new Error('useNodeData must be used within a NodeDataProvider');
  }
  return context;
};