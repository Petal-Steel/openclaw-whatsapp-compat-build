import { createMemo, Errored, lazy, Loading, onSettled, Show } from "solid-js";
import type { ApplicationContext } from "../../app/context.ts";
import { LazyViewError } from "../../components/solid/lazy-view-error.tsx";
import { t } from "../../lib/reactive/i18n.ts";
import { projectOwner } from "../../lib/reactive/projection.ts";
import { clawCreatorFlow } from "./creator-flow.ts";
import "../../styles/claw-creator.css";

const ClawReviewDialog = lazy(() => import("./creator-review-dialog.tsx"), {
  export: "ClawReviewDialog",
});

export function ClawCreatorReview(props: { context: ApplicationContext }) {
  const current = createMemo(() => {
    const flow = clawCreatorFlow(props.context);
    return { flow, view: projectOwner(flow, (owner) => owner) };
  });
  const flow = () => current().flow;
  const view = () => current().view;
  const reviewReceipt = createMemo(() => view().read().reviewRead);
  const reviewRead = createMemo(async () => {
    await reviewReceipt()?.result;
    return null;
  });
  onSettled(() => {
    const context = props.context;
    const owner = clawCreatorFlow(context);
    const pathname = context.router.getState().location.pathname;
    return context.router.subscribe(() => {
      if (context.router.getState().location.pathname !== pathname) {
        owner.retirePresentation();
      }
    });
  });
  return (
    <>
      <Show when={view().read().modalOpen && view().read().review}>
        <Errored
          fallback={(error, retry) => (
            <LazyViewError error={error()} onRetry={retry} onClose={() => flow().close()} inline />
          )}
        >
          <Loading>
            <ClawReviewDialog
              flow={flow()}
              view={view()}
              reviewRead={reviewRead}
              reviewReceipt={reviewReceipt()}
            />
          </Loading>
        </Errored>
      </Show>
      <Show
        when={
          view().read().hasActiveDraft &&
          !view().read().modalOpen &&
          !view().read().publication &&
          view().read().error
        }
      >
        {(error) => (
          <div class="claw-creator__notice claw-creator__notice--error" role="alert">
            {error()}
            <button class="btn btn--sm" onClick={() => flow().retryReview()}>
              {t("clawsDraft.retryReview")}
            </button>
          </div>
        )}
      </Show>
      <Show
        when={
          view().read().review &&
          !view().read().modalOpen &&
          !view().read().publication &&
          !view().read().error
        }
      >
        <button class="claw-creator__reopen btn btn--sm" onClick={() => flow().reopen()}>
          {t("clawsDraft.reopen")}
        </button>
      </Show>
    </>
  );
}
