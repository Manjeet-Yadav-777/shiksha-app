import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";

export function useUpdatedRef<T>(value: T) {
  const valueRef = useRef<T>(value);
  valueRef.current = value;
  return valueRef;
}

export function useWillUnmount(fn: () => void) {
  const onUnmount = useUpdatedRef(fn);
  useEffect(() => () => onUnmount.current(), [onUnmount]);
}

export function useMounted(): () => boolean {
  const mountedRef = useRef<boolean>(false);
  const get = useCallback(() => mountedRef.current, []);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  return get;
}

export function useTimeout() {
  const isMounted = useMounted();
  const handleRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useWillUnmount(() => {
    if (handleRef.current) clearTimeout(handleRef.current);
  });
  return useMemo(() => {
    const clear = () => {
      if (handleRef.current) clearTimeout(handleRef.current);
    };
    function set(fn: () => void, delayMs = 0): void {
      if (!isMounted()) return;
      clear();
      if (delayMs <= MAX_DELAY_MS) {
        // For simplicity, if the timeout is short, just set a normal timeout.
        handleRef.current = setTimeout(fn, delayMs);
      } else {
        setChainedTimeout(handleRef, fn, Date.now() + delayMs);
      }
    }
    return {
      set,
      clear,
    };
  }, [isMounted]);
}

const MAX_DELAY_MS = 2 ** 31 - 1;

function setChainedTimeout(
  handleRef: MutableRefObject<ReturnType<typeof setTimeout> | undefined>,
  fn: () => void,
  timeoutAtMs: number,
) {
  const delayMs = timeoutAtMs - Date.now();

  handleRef.current =
    delayMs <= MAX_DELAY_MS
      ? setTimeout(fn, delayMs)
      : setTimeout(
          () => setChainedTimeout(handleRef, fn, timeoutAtMs),
          MAX_DELAY_MS,
        );
}
