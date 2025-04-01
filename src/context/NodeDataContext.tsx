// src/context/NodeDataContext.tsx
import React, { createContext, useContext, useCallback } from 'react';
import { Node, useReactFlow } from 'reactflow';

interface NodeDataContextType {
  updateNodeData: (nodeId: string, data: any) => void;
  resizeNode: (nodeId: string, width: number, height: number) => void;
}

const NodeDataContext = createContext<NodeDataContextType | undefined>(undefined);

export const NodeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setNodes, getNodes } = useReactFlow();

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

  const resizeNode = useCallback(
    (nodeId: string, width: number, height: number) => {
      console.log(`Resizing node ${nodeId} to width=${width}, height=${height}`);
      
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // Create a new style object with the width and height
            const newStyle = {
              ...(node.style || {}),
              width: `${width}px`,
              height: `${height}px`,
            };
            
            console.log("New node style:", newStyle);
            
            // Update both the node's style and store dimensions in data
            return {
              ...node,
              style: newStyle,
              data: { 
                ...node.data, 
                dimensions: { width, height } 
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  return (
    <NodeDataContext.Provider value={{ updateNodeData, resizeNode }}>
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