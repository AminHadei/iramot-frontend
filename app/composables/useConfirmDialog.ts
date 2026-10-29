interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
}

let pending: ((value: boolean) => void) | null = null;

export function useConfirmDialog() {
  const state = useState<ConfirmState>("confirm-dialog", () => ({
    open: false,
    title: "",
    message: "",
    confirmLabel: "",
    cancelLabel: "",
  }));

  function ask(input: Omit<ConfirmState, "open">) {
    pending?.(false);
    return new Promise<boolean>((resolve) => {
      pending = resolve;
      state.value = { open: true, ...input };
    });
  }

  function finish(value: boolean) {
    state.value = { ...state.value, open: false };
    pending?.(value);
    pending = null;
  }

  return { state, ask, finish };
}
