import React from "react";

interface WaitCircleProps {
  className?: string;
}

const WAIT_CIRCLE_CLASSNAME = "flex flex-row w-5 h-5 m-2 border-t-5 border-emerald-500 " +
                              "rounded-4xl animate-wait-circle";

const WaitCircle = ({className = ''}: WaitCircleProps) => (
  <span className={`${WAIT_CIRCLE_CLASSNAME} ${className}`} />
);

export default WaitCircle;
