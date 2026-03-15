import React from "react";
import { FetchAndError, FetchState } from "../utils/fetchData";
import WaitCircle from "./WaitCircle";
import ErrorMessage from "./ErrorMessage";

export interface WaitAndErrorProps {
  fetchAndError: FetchAndError;
}

const WaitAndError = ({fetchAndError}: WaitAndErrorProps) => (
  <>
    {fetchAndError.fetchStatus === FetchState.Loading && <WaitCircle />}
    <ErrorMessage fetchAndError={fetchAndError} />
  </>
);

export default WaitAndError;
