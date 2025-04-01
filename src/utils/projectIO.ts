// src/utils/projectIO.ts
import { Node, Edge } from 'reactflow';

// Project data interface
export interface ProjectData {
  nodes: Node[];
  edges: Edge[];
  metadata: {
    name: string;
    description?: string;
    version: string;
    created: string;
    lastModified: string;
  };
}

/**
 * Exports the current project to a JSON string
 */
export const exportProject = (nodes: Node[], edges: Edge[], projectName: string, description?: string): string => {
  const projectData: ProjectData = {
    nodes,
    edges,
    metadata: {
      name: projectName,
      description,
      version: '1.0',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }
  };
  
  return JSON.stringify(projectData, null, 2);
};

/**
 * Imports project data from a JSON string
 */
export const importProject = (jsonData: string): ProjectData => {
  try {
    const projectData = JSON.parse(jsonData) as ProjectData;
    
    // Validate the data structure
    if (!projectData.nodes || !projectData.edges || !projectData.metadata) {
      throw new Error('Invalid project file format');
    }
    
    return projectData;
  } catch (error) {
    console.error('Error importing project:', error);
    throw error;
  }
};