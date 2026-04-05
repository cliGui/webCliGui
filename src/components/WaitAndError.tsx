import React from "react";
import { FetchStatusAndError, FetchState } from "../utils/fetchData";
import WaitCircle from "./WaitCircle";
import ErrorMessage from "./ErrorMessage";

export interface WaitAndErrorProps {
  fetchAndError: FetchStatusAndError;
}

const WaitAndError = ({fetchAndError}: WaitAndErrorProps) => (
  <div className="flex">
    {fetchAndError.fetchStatus === FetchState.Loading && <WaitCircle />}
    <ErrorMessage fetchAndError={fetchAndError} />
  </div>
);

export default WaitAndError;
