/**
 * Fetches data by calling the different set-functions passed in to the options in the following
 * order:
 * 
 * options.setFetchStatus(FetchState.Loading);
 * const result = await fetch(url + options.searchParams);
 * if (result.ok) {
 *   const jsonData = await result.json();
 *   options.setData(jsonData);
 *   options.setFetchStatus(FetchState.Success);
 *   return FetchState.Success;
 * }
 * 
 * In case of error:
 *  options.setError('Error Fetching data', (err as Error).message);
 *  options.setFetchStatus(FetchState.Error);
 *  return FetchState.Error;
 * 
 * This is a simple example using zustand for implementing the set-functions and calling fetchData:
 * 
 * const getMyGrade = async () => {
 *   const setFetchStatus = (stat: FetchStatus) => 
 *       set(state => { state.myGrade.myGradeFetchStatus = stat; }, false, 'getMyGradeFetchStatus');
 *
 *   interface MyGrade {
 *     grade: number;
 *   }
 *
 *   const setData = (jsonData: MyGrade) => {
 *    set(state => { state.myGrade.grade = jsonData.grade; }, false, 'getMyGrade');
 *   };
 *
 *   const setError = (err: string, errorDetail: string) => 
 *        set(state => { state.myGrade.myGradeError = err; state.auth.myGradeErrorDetail = errorDetail; },
 *            false, 'getMyGradeError');
 *
 *   return await fetchData<MyGrade>(
 *     '/api/is-staff', {
 *       accessToken,
 *       setFetchStatus,
 *       setData,
 *       setError,
 *     }
 *   );
 * };
 * 
 * If options.postData is set, then the fetch call changes into a POST where the
 * options.postData is passed on in the body.
 * 
 * You can add an abort controller in case the fetch calls are taking long and maybe need
 * to be interrupted:
 * 
 * const getMyGrade = async () => {
 *   const handleAbortController = await handleAbort(
 *                  () => get().myGrade.myGradeAbortController,
 *                  (abortController: AbortController) => set(state => { state.myGrade.myGradeAbortController = abortController },
 *                                                            false, "myGradeAbortController"));
 *
 *   ... rest of the myGrade function...
 * 
 *   return await fetchData<MyGrade>(
 *     '/api/is-staff', {
 *       accessToken,
 *       setFetchStatus,
 *       setData,
 *       setError,
 *       handleAbortController,
 *     }
 *   );
 * 
 */
import sleep from "./sleep";

export const FetchState = {
  Idle: 'idle',
  Loading: 'loading',
  Success: 'success',
  Error: 'error',
} as const;

export type FetchStatus = typeof FetchState[keyof typeof FetchState];

export interface FetchStatusAndError {
  fetchStatus: FetchStatus;
  error: string | null;
  errorDetail: string | null;
  abortController: AbortController | null;
  abort: () => Promise<void>;
}

const abortFetch = async (abortController: AbortController | null) => {
  if (abortController) {
    abortController.abort(new Error('Interupted'));
    await sleep();  // Skip the current render cycle
  }
}

export const initFetchStatusAndError = () => ({
  fetchStatus: FetchState.Idle,
  error: null,
  errorDetail: null,
  abortController: null,
  abort: async function() { await abortFetch(this.abortController) },
});

export interface HandleFetchStatusAndError {
  get: () => FetchStatusAndError;
  set: (fAndE: FetchStatusAndError, fAndEText: string) => void;
}

export const handleFetchStatusAndError = (
    get: () => FetchStatusAndError,
    set: (fAndE: FetchStatusAndError, fAndEText: string) => void,
  ) => ({ get, set} as HandleFetchStatusAndError);

export interface FetchDataOptions<D, P = void> {
  handleFandE: HandleFetchStatusAndError,
  accessToken?: string;
  searchParameters?: {[key: string]: string | number | undefined}[],
  setData?: (data: D) => void;
  postData?: P;
  reload?: boolean;
}

const fetchData = async <D, P = void>(url: string, options: FetchDataOptions<D, P>): Promise<FetchStatus> => {
  let fAndE = options.handleFandE.get();
  if (!options.reload && fAndE.fetchStatus === FetchState.Success) {
    return fAndE.fetchStatus;
  }

  try {
  // Abort previous running fetch
  await abortFetch(fAndE.abortController);

  fAndE = options.handleFandE.get();
  fAndE = {
      ...fAndE,
      fetchStatus: FetchState.Loading,
      error: null,
      errorDetail: null,
      abortController: new AbortController(),
    };
    options.handleFandE.set(fAndE, FetchState.Loading);

    if (options.searchParameters) {
      const searchParams = new URLSearchParams();
      for (const param of options.searchParameters) {
        const entries = Object.entries(param);
        if (entries.length === 0) throw new Error('fetchData(), options.searchParameters, no object entries?!?!');
        const [key, value] = entries[0];
        searchParams.append(key, value as unknown as string);
      }
      url += `?${searchParams.toString()}`;
    }

    const fetchOptions: RequestInit  = {
      method: Object.hasOwn(options, 'postData') ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }
    if (options.accessToken) {
      (fetchOptions.headers as any)['Authorization'] = `Bearer ${options.accessToken}`;
    }
    if (options.postData) {
      fetchOptions.body = JSON.stringify(options.postData);
    }

    fetchOptions.signal = fAndE.abortController!.signal;

    const result = await fetch(url, fetchOptions);
    if (!result.ok) {
      const errTxt = await result.text();
      throw new Error(errTxt || `${result.status}: ${result.statusText}`);
    }
    const jsonData = await result.json();
    if (options.setData) options.setData(jsonData);

    fAndE = options.handleFandE.get();
    fAndE = {
      ...fAndE,
      fetchStatus: FetchState.Success,
      error: null,
      errorDetail: null,
      abortController: null,
    };
    options.handleFandE.set(fAndE, FetchState.Success);

    return FetchState.Success;

  } catch (err) {
    console.error(`fetchData(), error occured: ${(err as Error).message}`);

    fAndE = options.handleFandE.get();
    fAndE = {
      ...fAndE,
      fetchStatus: FetchState.Error,
      error: 'Error Fetching data',
      errorDetail: (err as Error).message,
      abortController: null,
    };
    options.handleFandE.set(fAndE, FetchState.Error);
    return FetchState.Error;
  }
};

export default fetchData;
