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

export interface HandleAbortController {
  get: () => AbortController;
  set: (ctrl: AbortController | null) => void;
}

export const handleAbort = async (get: () => AbortController, 
                                  set: (ctrl: AbortController | null) => void): Promise<HandleAbortController> => {
  const handleAbortController: HandleAbortController = { get, set };
  let abortController = get();
  if (abortController) {
    abortController.abort(new Error('Interupted'));
    await sleep();
  }
  set(new AbortController());

  return handleAbortController;
}

export interface FetchDataOptions<D, P = void> {
  setFetchStatus: (stat: FetchStatus) => void;
  setError: (err: string, errorDetail: string) => void;
  accessToken?: string;
  searchParameters?: {[key: string]: string | number | undefined}[],
  setData?: (data: D) => void;
  postData?: P;
  handleAbortController?: HandleAbortController;
}

const fetchData = async <D, P = void>(url: string, options: FetchDataOptions<D, P>): Promise<FetchStatus> => {
  try {
    options.setFetchStatus(FetchState.Loading);

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
      method: options.postData ? 'POST' : 'GET',
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
    if (options.handleAbortController) {
      fetchOptions.signal = options.handleAbortController.get().signal;
    }

    const result = await fetch(url, fetchOptions);
    if (!result.ok) {
      const errTxt = await result.text();
      throw new Error(errTxt || `${result.status}: ${result.statusText}`);
    }
    const jsonData = await result.json();
    if (options.setData) options.setData(jsonData);

    options.setFetchStatus(FetchState.Success);
    return FetchState.Success;
  } catch (err) {
    console.error(`fetchData(), error occured: ${(err as Error).message}`);
    options.setError('Error Fetching data', (err as Error).message);
    options.setFetchStatus(FetchState.Error);
    return FetchState.Error;
  } finally {
    if (options.handleAbortController) {
      options.handleAbortController.set(null);
    }
  }
};

export default fetchData;
