import React, { useEffect } from "react";
import { TaskCreationSteps } from "@store/createTask/createTaskIf";
import { useDataStore } from "@store/dataStore";
import Button from "./regalia/Button";
import OperationSelection from "./createTaskSteps/OperationSelection";
import OperationParameters from "./createTaskSteps/OperationParameters";
import SelectServers from "./createTaskSteps/SelectServers";
import Preview from "./createTaskSteps/Preview";
import { AuthenticationState } from "@store/authentication/authenticationIf";

const CreationSteps = () => {
  const {
    taskCreationStep,
    isNextStepValid,
    setNextTaskCreationStep,
    submitOperation,
   } = useDataStore(state => state.createTask);

  const onNextStepOrSubmit = () => {
    if (taskCreationStep !== TaskCreationSteps.Preview) {
      setNextTaskCreationStep(taskCreationStep + 1);
    } else {
      submitOperation();
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
        <Button className="!mr-2"
          onClick={onPreviousStep} disabled={taskCreationStep === TaskCreationSteps.OperatorSelection}>
          Back
        </Button>
        <Button onClick={onNextStepOrSubmit} disabled={!isNextStepValid()}>
          {taskCreationStep !== TaskCreationSteps.Preview ? "Next" : "Submit"}
        </Button>
      </div>
    </div>
  );
};

const CreationViews = () => {
  const { taskCreationStep } = useDataStore(state => state.createTask);

  switch (taskCreationStep) {
    case TaskCreationSteps.OperatorSelection: return <OperationSelection />;
    case TaskCreationSteps.Parameters: return <OperationParameters />;
    case TaskCreationSteps.ServersSelection: return <SelectServers />;
    case TaskCreationSteps.Preview: return <Preview />;
  }
};

const CreateTask = () => {
  const { authenticationState } = useDataStore(state => state.authentication);
  const { libraryFolders, getLibraryOperators } = useDataStore(state => state.createTask);

  useEffect(() => {
    if (authenticationState === AuthenticationState.Authenticated &&
        libraryFolders.length === 0) {
      getLibraryOperators();
    }
  }, [authenticationState]);

  return (
    <div className="flex flex-col">
      <CreationSteps />
      <CreationViews />
    </div>
  );
};

export default CreateTask;
