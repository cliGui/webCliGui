import React, { useEffect } from "react";
import { Operation } from '@store/types/operationTypes';
import {
  ParameterBase, ParameterOptionsToList, ParameterPreference, ParameterStringValue, ParameterType,
} from '@store/types/parameterTypes';
import { useDataStore } from "@store/dataStore";
import { FetchState } from "@store/fetchData";
import WaitAndError from "../regalia/WaitAndError";
import handleOnce from "@utils/handleOnce";

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
        value={parameterOptionsToList.selectedListIdx}
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
  parameterBranch,
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
};

const OperationParameters = () => {
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

  useEffect(() => {
    if (selectedOperation && !selectedOperation.parameters) {
      handleOnce(loadParameters);
    }
  }, [selectedOperation]);

  if (!selectedOperation) {
    return <div>No operation selected?!?!</div>
  }

  return (
    <>
      <div className="grid grid-cols-[50px_175px_225px_auto] gap-2 items-center">
        <div className="justify-self-center">Select</div>
        <div>Parameter</div>
        <div>Value</div>
        <div>Description</div>

        <WaitAndError fetchAndError={loadParametersFetchAndError} />
        {!!selectedOperation.parameters && <Parameter parameter={selectedOperation.parameters} parameterBranch={[]} />}
      </div>

      {loadParametersFetchAndError.fetchStatus === FetchState.Success && !selectedOperation.parameters &&
          <div>No parameters needed</div>}
      <div className="mt-10 text-xs italic">*: Mandatory parameters need to be filled in</div>
    </>
  );
};

export default OperationParameters;
