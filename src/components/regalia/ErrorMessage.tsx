import React, { useState } from "react";
import { FetchStatusAndError } from "@store/fetchData";
import Button from "./Button";

interface ErrorMessageProps {
  fetchAndError: FetchStatusAndError;
  showLeft?: boolean;
  className?: string;
}

const ErrorMessage = ({fetchAndError, showLeft, className = undefined} : ErrorMessageProps) => {
  const [isShowingErrorDetail, setIsShowingErrorDetail] = useState(false);
  
  if (!fetchAndError.error) return null;

  return (
    <div className={`flex flex-col ${showLeft && 'items-end' } ${className || ''}`}>
      <span className="error-message">{fetchAndError.error}</span>
      
      {!!fetchAndError.errorDetail && (
        <div className="flex flex-row items-start pt-2 gap-2">
          {!!showLeft && isShowingErrorDetail &&
             <span className="error-message">{fetchAndError.errorDetail}</span>}
          <Button className="!text-xs !h-8 !p-1 !rounded-4xl bg-red-600"
                  onClick={() => setIsShowingErrorDetail(!isShowingErrorDetail)}>
            {isShowingErrorDetail ? 'Hide' : 'Show'}
          </Button>
          {!showLeft && isShowingErrorDetail &&
             <span className="error-message">{fetchAndError.errorDetail}</span>}
        </div>
      )}
    </div>);
};

export default ErrorMessage;
