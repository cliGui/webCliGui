import React, { useEffect } from "react";
import Tree from 'rc-tree';
import { useDataStore } from "../dataStore";

const CreateTask = () => {
  const firstTimeRef = React.useRef(true);
  const taskTrees = useDataStore(state => state.createTask.taskTrees);
  const getLibraryOperators = useDataStore(state => state.createTask.getLibraryOperators);

  useEffect(() => {
    if (firstTimeRef.current) {
      firstTimeRef.current = false; 
      getLibraryOperators();
    };
  }, []);

  return (
    <>
      <Tree treeData={taskTrees} showLine />
    </>
  );
};

export default CreateTask;
