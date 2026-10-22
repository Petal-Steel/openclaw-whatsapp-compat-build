import { lazy } from "solid-js";
import type { ConfirmDialogChoice } from "./confirm-dialog-types.ts";
import type { ConfirmDialogViewOptions } from "./confirm-dialog-view.tsx";
import { withPromiseModalHost } from "./promise-modal-host.ts";

const ConfirmDialogView = lazy(() => import("./confirm-dialog-view.tsx"), {
  export: "ConfirmDialogView",
});
let confirmationActive = false;

export function presentConfirmDialog(
  options: ConfirmDialogViewOptions,
): Promise<ConfirmDialogChoice> {
  if (confirmationActive) {
    return Promise.resolve(null);
  }
  confirmationActive = true;
  return withPromiseModalHost<ConfirmDialogChoice>(
    { signal: options.signal, value: null },
    async ({ render, finish }) => {
      await ConfirmDialogView.preload();
      render(() => <ConfirmDialogView options={options} finish={finish} />);
    },
  ).finally(() => {
    confirmationActive = false;
  });
}
