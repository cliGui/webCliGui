import React, { useState } from "react";
import { FetchStatusAndError } from "../utils/fetchData";
import Button from "./Button";

interface ErrorMessageProps {
  fetchAndError: FetchStatusAndError;
  className?: string;
}

const ErrorMessage = ({fetchAndError, className = undefined} : ErrorMessageProps) => {
  const [isShowingErrorDetail, setIsShowingErrorDetail] = useState(false);
  
  if (!fetchAndError.error) return null;

  return (
    <div className={`flex flex-col ${className || ''}`}>
      <span className="error-message">{fetchAndError.error}</span>
      {!!fetchAndError.errorDetail && (
        <div className="flex flex-row items-start pt-2 gap-2">
          <Button className="!text-xs !h-8 !p-1 !rounded-4xl bg-red-600"
                  onClick={() => setIsShowingErrorDetail(!isShowingErrorDetail)}>
            {isShowingErrorDetail ? 'Hide' : 'Show'}
          </Button>
          {isShowingErrorDetail && <span className="error-message">{fetchAndError.errorDetail}</span>}
        </div>
      )}
    </div>);
};

export default ErrorMessage;
