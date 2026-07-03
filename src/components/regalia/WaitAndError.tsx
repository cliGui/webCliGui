import React from "react";
import { FetchStatusAndError, FetchState } from "@store/fetchData";
import WaitCircle from "./WaitCircle";
import ErrorMessage from "./ErrorMessage";

export interface WaitAndErrorProps {
  fetchAndError: FetchStatusAndError;
  classNameWait?: string;
  classNameError?: string;
}

const WaitAndError = ({
    fetchAndError,
    classNameWait,
    classNameError,
  }: WaitAndErrorProps) => (
  <div className="flex">
    {fetchAndError.fetchStatus === FetchState.Loading && <WaitCircle className={classNameWait} />}
    <ErrorMessage fetchAndError={fetchAndError} className={classNameError} />
  </div>
);

export default WaitAndError;
