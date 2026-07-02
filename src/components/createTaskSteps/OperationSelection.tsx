import React from "react";
import Tree from 'rc-tree';
import Markdown from 'react-markdown';
import { Operation, OperationType } from '@store/types/operationTypes';
import { useDataStore } from "@store/dataStore";
import { FetchState } from "@store/fetchData";
import WaitAndError from "../regalia/WaitAndError";

const OperationSelection = () => {
  const {
    selectedOperationType,
    setSelectedOperationType,
    taskTrees,
    selectedOperationBranch,
    getLibraryOperatorsFetchAndError,
    getDescriptionFetchAndError,
    getSelectedOperation,
    setSelectedOperation,
  } = useDataStore(state => state.createTask);

  const onSelect = (selectedKeys: React.Key[], selectData: any) => {
    setSelectedOperation(selectData.node.pos);
  };

  let selectedOperation: Operation | null = null;
  if (selectedOperationBranch) {
    selectedOperation = getSelectedOperation();
  }

  return (
    <div className="flex flex-row">
      <div className="flex flex-col w-40" >
        <h4>Operations</h4>
        <label htmlFor="operationTypeSelector">Operation Type:</label>
        <select id="operationTypeSelector" value={selectedOperationType}
                className="border-1 !mr-4 !mb-4"
                onChange={evt => setSelectedOperationType(evt.target.value as OperationType)}>
          <option value={OperationType.Pipx}>Pipx</option>
          <option value={OperationType.Module}>Son Module</option>
          <option value={OperationType.Python}>Python</option>
        </select>
        <WaitAndError fetchAndError={getLibraryOperatorsFetchAndError} />
        {taskTrees.length > 0 && <Tree treeData={taskTrees} defaultExpandAll showLine onSelect={onSelect}/>}
        {taskTrees.length === 0 && getLibraryOperatorsFetchAndError.fetchStatus === FetchState.Success &&
          <span>No operations for this operation type</span>}
      </div>
      <div>
        {!!selectedOperation?.description && <Markdown>{selectedOperation.description}</Markdown>}
        <WaitAndError fetchAndError={getDescriptionFetchAndError} />
      </div>
    </div>
  );
};

export default OperationSelection;
