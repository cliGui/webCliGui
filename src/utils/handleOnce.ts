
const handleOnce = (action: () => void) => {
  const timeoutId = setTimeout(action);
  return () => clearTimeout(timeoutId);
};

export default handleOnce;
