import React, { useEffect } from "react";
import Tree from 'rc-tree';
import Markdown from 'react-markdown';
import { Operation, } from '../store/operationTypes';
import {
  ParameterBase, ParameterOptionsToList, ParameterPreference, ParameterStringValue, ParameterType,
} from '../store/parameterTypes';
import { TaskCreationSteps } from "../store/createTaskIf";
import { useDataStore } from "../store/dataStore";
import Button from "./Button";
import { FetchState } from "../utils/fetchData";
import WaitCircle from "./WaitCircle";

const CreationSteps = () => {
  const { 
    taskCreationStep,
    isNextStepValid,
    setNextTaskCreationStep,
   } = useDataStore(state => state.createTask);

  const onNextStepOrSubmit = () => {
    if (taskCreationStep !== TaskCreationSteps.Preview) {
      setNextTaskCreationStep(taskCreationStep + 1);
    }
  };

  const onPreviousStep = () => setNextTaskCreationStep(taskCreationStep - 1);

  return (
    <div className="flex flex-row mb-4 justify-between">
      <div className="flex flex-row">
        {['Select Operation', 'Parameters', 'Servers', 'Preview'].map((itemText, idx) => {
          const flagBodyColor = idx < taskCreationStep ? 'bg-emerald-400' : 
            (idx === taskCreationStep ? 'bg-blue-400' : 'bg-gray-300');
          const flagTriangleColor = idx < taskCreationStep ? 'border-l-emerald-400' : 
            (idx === taskCreationStep ? 'border-l-blue-400' : 'border-l-gray-300');
  
          return (
            <div key={itemText} className="flex flex-col">
              <div className="flex flex-row items-center">
                <div className={`flex w-[100px] h-[60px] justify-center text-center items-center text-white ${flagBodyColor}`}>
                  {itemText}
                </div>
                <div className={"w-0 h-0 " +
                        "border-t-[50px] border-t-transparent " +
                        "border-b-[50px] border-b-transparent " +
                        `border-l-[35px] ${flagTriangleColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-row">
        <Button className="!mr-2" text="Back" 
          onClick={onPreviousStep} disabled={taskCreationStep === TaskCreationSteps.OperatorSelection}/>
        <Button text={taskCreationStep !== TaskCreationSteps.Preview ? "Next" : "Submit"}
          onClick={onNextStepOrSubmit} disabled={!isNextStepValid()} />
      </div>
    </div>
  );
};

interface OperationSelectionProps {
  isVisible: boolean;
}

const OperationSelection = ({ isVisible }: OperationSelectionProps) => {
  const {
    taskTrees,
    selectedOperationBranch,
    getLibraryOperatorsFetchAndError,
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
  console.log('selectedOperation:', selectedOperation);

  return (
    <div className={`flex flex-row ${!isVisible && 'invisible w-0 h-0'}`}>
      <div className="flex flex-col w-40" >
        <h4>Operations</h4>
        {getLibraryOperatorsFetchAndError.fetchStatus === FetchState.Loading && <WaitCircle />}
        <Tree treeData={taskTrees} showLine onSelect={onSelect}/>
      </div>
      <div>
        {!!selectedOperation?.description && 
          <Markdown>{selectedOperation.description}</Markdown>}
      </div>
    </div>
  );
};

interface ToggleParameterProps {
  parameterBranch: number[];
  parameterBase: ParameterBase;
}

const ToggleParameter = ({
  parameterBranch,
  parameterBase,
}: ToggleParameterProps) => {
  const setParameterValue = useDataStore(state => state.createTask.setParameterValue);

  if (parameterBase.mandatory) {
    return <div className="justify-self-center">*</div>
  }

  return (
    <input id={`checkbox-${parameterBase.name}`} type="checkbox" 
           className="w-[20px] h-[20px] justify-self-center"
           checked={parameterBase.isSelected}
           onChange={evt => setParameterValue(parameterBranch, !!evt.target.checked)} />
  );
};

interface ParameterPreferenceProps {
  parameterBranch: number[];
  parameterPreference: ParameterPreference;
}

const ParameterPreferenceComponent = ({
  parameterBranch,
  parameterPreference,
}: ParameterPreferenceProps) => {
  const textColor = !parameterPreference.isSelected ? 'text-gray-300' : '';

  return (
    <>
      <ToggleParameter parameterBranch={parameterBranch} parameterBase={parameterPreference} />
      <div className={textColor}>{parameterPreference.name}</div>
      <div/>
      <div className={textColor}>{parameterPreference.description}</div>
    </>
  );
};

interface ParameterStringValueProps {
  parameterBranch: number[];
  parameterStringValue: ParameterStringValue;
}

const ParameterStringValueComponent = ({
  parameterBranch,
  parameterStringValue,
}: ParameterStringValueProps) => {
  const setParameterValue = useDataStore(state => state.createTask.setParameterValue);
  const textColor = !parameterStringValue.isSelected ? 'text-gray-300' : '';

  return (
    <>
      <ToggleParameter parameterBranch={parameterBranch} parameterBase={parameterStringValue} />
      <label className={`text-base ${textColor}`} 
              htmlFor={`string-value-${parameterStringValue.name}`}>
        {parameterStringValue.name}
      </label>
      <input id={`string-value-${parameterStringValue.name}`}
              className="border-1 h-8 p-1 disabled:border-gray-300 disabled:text-gray-300"
              value={parameterStringValue.value || ''} 
              onChange={evt => setParameterValue(parameterBranch, evt.target.value)} 
              disabled={!parameterStringValue.isSelected} />
      <div className={textColor}>{parameterStringValue.description}</div>
    </>
  );
};

interface ParameterOptionsToListProps {
  parameterBranch: number[];
  parameterOptionsToList: ParameterOptionsToList;
}

const ParameterOptionsToListComponent = ({
  parameterBranch,
  parameterOptionsToList,
}: ParameterOptionsToListProps) => {
  const setParameterValue = useDataStore(state => state.createTask.setParameterValue);
  const textColor = !parameterOptionsToList.isSelected ? 'text-gray-300' : '';

  let selectedParameterList: ParameterBase[] = [];
  if (parameterOptionsToList.selectedListIdx >= 0) {
    selectedParameterList = parameterOptionsToList.options[parameterOptionsToList.selectedListIdx].parameters;
  }

  return (
    <>
      <ToggleParameter parameterBranch={parameterBranch} parameterBase={parameterOptionsToList} />
      <label className={`text-base ${textColor}`} 
        htmlFor={`optionsToList-${parameterOptionsToList.name}`}>
        {parameterOptionsToList.name}
      </label>
      <select id={`optionsToList-${parameterOptionsToList.name}`}
        className="border-1 h-8 disabled:border-gray-300 disabled:text-gray-300"
        value={parameterOptionsToList.selectedListIdx /* >= 0 ?
          parameterOptionsToList.options[parameterOptionsToList.selectedListIdx].name : "" */}
        onChange={evt => {
            const idx = parseInt(evt.target.value);
            setParameterValue(parameterBranch, idx);
          }}
        disabled={!parameterOptionsToList.isSelected}
      >
        <option value="-1">--Please choose an option--</option>
        {parameterOptionsToList.options.map((opt, idx) => <option key={idx} value={idx}>{opt.name}</option>)}
      </select>
      <div className={textColor}>{parameterOptionsToList.description}</div>

      {selectedParameterList.map((param, idx) => (
          <React.Fragment key={`${param.name}${idx}`}>
            <Parameter parameter={param} parameterBranch={[...parameterBranch, idx]} />
          </React.Fragment>))}
    </>
  );
};

interface ParameterProps {
  parameter: ParameterBase;
  parameterBranch: number[];
}

const Parameter = ({
  parameter,
  parameterBranch

}: ParameterProps) => {
  switch (parameter.type) {
    case ParameterType.PREFERENCE: {
      const parameterPreference = parameter as ParameterPreference;
      return <ParameterPreferenceComponent parameterPreference={parameterPreference} parameterBranch={parameterBranch} />;
    }

    case ParameterType.STRING_VALUE: {
      const paramStringValue = parameter as ParameterStringValue;
      return <ParameterStringValueComponent parameterStringValue={paramStringValue} parameterBranch={parameterBranch} />;
    }

    case ParameterType.PARAMETER_OPTIONS_TO_LIST: {
      const optionsToList = parameter as ParameterOptionsToList;
      return <ParameterOptionsToListComponent parameterOptionsToList={optionsToList} parameterBranch={parameterBranch} />;
    }
  }
  return null;
}


interface OperationParametersProps {
  isVisible: boolean;
}

const OperationParameters = ({ isVisible }: OperationParametersProps) => {
  const {
    selectedOperationBranch,
    loadParametersFetchAndError,
    loadParameters,
    getSelectedOperation,
  } = useDataStore(state => state.createTask);

  let selectedOperation: Operation | null = null;
  if (selectedOperationBranch) {
    selectedOperation = getSelectedOperation();
  }
  console.log('selectedOperation:', selectedOperation);

  useEffect(() => {
    if (selectedOperation && !selectedOperation.parameters) {
      loadParameters();
    }
  }, [selectedOperation]);

  if (!selectedOperation) {
    return <div className={`${!isVisible && 'invisible w-0 h-0'}`}>
      No operation selected?!?!
    </div>
  }

  return (
    <div className={`${!isVisible && 'invisible w-0 h-0'}`}>
      <div className="grid grid-cols-[50px_175px_225px_auto] gap-2 items-center">
        <div className="justify-self-center">Select</div>
        <div>Parameter</div>
        <div>Value</div>
        <div>Description</div>
        
        {loadParametersFetchAndError.fetchStatus === FetchState.Loading && <WaitCircle />}
        {!!selectedOperation.parameters && <Parameter parameter={selectedOperation.parameters} parameterBranch={[]} />}
      </div>

      {loadParametersFetchAndError.fetchStatus === FetchState.Success && !selectedOperation.parameters &&
          <div>No parameters needed</div>}
      <div className="mt-10 text-xs italic">*: Mandatory parameters need to be filled in</div>
    </div>
  );
};

interface SelectServersProps {
  isVisible: boolean;
}

const SelectServers = ({
  isVisible,
}: SelectServersProps) => {
  return (
    <div className={`flex flex-col gap-3 ${!isVisible && 'invisible w-0 h-0'}`}>
      <div className="flex items-center">
        <input className="m-2" type="radio" name="serverSelection" id="webCliGuiServerRB" value="webCliGuiServer" checked />
        <label htmlFor="webCliGuiServerRB"></label>WebCliGui Server
      </div>
      <div className="flex items-center">
        <input className="m-2" type="radio" name="serverSelection" id="selectServersRB" value="selectServers" disabled />
        <label htmlFor="selectServersRB" className="w-35 text-gray-300">Select Servers</label>
        <select className="w-35 text-gray-300 border p-1" disabled>
          <option value="">--select server--</option>
        </select>
        <Button text="Add" className="!h-9 px-3 py-1 !ml-4" disabled />
      </div>
      <div className="flex items-center">
        <input className="m-2" type="radio" name="serverSelection" id="selectRegionsRB" value="selectRegions" disabled />
        <label htmlFor="selectRegionsRB" className="w-35 text-gray-300">Select Cluster</label>
        <select className="w-35 text-gray-300 border p-1" disabled>
          <option value="">--select cluster--</option>
        </select>
        <Button text="Add" className="!h-9 px-3 py-1 !ml-4" disabled />
      </div>
      <div className="flex items-center">
        <input className="m-2" type="radio" name="serverSelection" id="uploadServersRB" value="uploadServers" disabled />
        <label htmlFor="uploadServersRB" className="w-35 text-gray-300">Upload servers</label>
        <Button text="Select file" className="!h-9 px-3 py-1" disabled />
      </div>
    </div>
  );
}

interface PreviewProps {
  isVisible: boolean;
}

const Preview = ({
  isVisible,
}: PreviewProps) => {
  return (
    <div className={`flex flex-col gap-3 ${!isVisible && 'invisible w-0 h-0'}`}>
      Preview
    </div>
  );
}

const CreationViews = () => {
  const { taskCreationStep } = useDataStore(state => state.createTask);

  return (
    <>
      <OperationSelection isVisible={taskCreationStep === TaskCreationSteps.OperatorSelection} />
      <OperationParameters isVisible={taskCreationStep === TaskCreationSteps.Parameters} />
      <SelectServers isVisible={taskCreationStep === TaskCreationSteps.ServersSelection} />
      <Preview isVisible={taskCreationStep === TaskCreationSteps.Preview} />
    </>
  );
};

const CreateTask = () => {
const { getLibraryOperators } = useDataStore(state => state.createTask);

  useEffect(() => {
    getLibraryOperators();
  }, []);

  return (
    <div className="flex flex-col">
      <CreationSteps />
      <CreationViews />
    </div>
  );
};

export default CreateTask;
