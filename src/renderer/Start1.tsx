import { Fragment, ReactNode } from "react";
import { useNavigate, Link } from "react-router";

// FIXME: Apparently use navigate is not ideal. Check docs
// https://reactrouter.com/start/declarative/navigating

//

export default function Start(): ReactNode {
  const navigate = useNavigate();
  // TODO: There should be some way to pass state in the second one the navigate options interface has a state param
  // interface NavigateOptions {
  //   /** Replace the current entry in the history stack instead of pushing a new one */
  //   replace?: boolean;
  //   /** Adds persistent client side routing state to the next location */
  //   state?: any;
  //   /** If you are using {@link https://api.reactrouter.com/v7/functions/react_router.ScrollRestoration.html <ScrollRestoration>}, prevent the scroll position from being reset to the top of the window when navigating */
  //   preventScrollReset?: boolean;
  //   /** Defines the relative path behavior for the link. "route" will use the route hierarchy so ".." will remove all URL segments of the current route pattern while "path" will use the URL path so ".." will remove one URL segment. */
  //   relative?: RelativeRoutingType;
  //   /** Wraps the initial state update for this navigation in a {@link https://react.dev/reference/react-dom/flushSync ReactDOM.flushSync} call instead of the default {@link https://react.dev/reference/react/startTransition React.startTransition} */
  //   flushSync?: boolean;
  //   /** Enables a {@link https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API View Transition} for this navigation by wrapping the final state update in `document.startViewTransition()`. If you need to apply specific styles for this view transition, you will also need to leverage the {@link https://api.reactrouter.com/v7/functions/react_router.useViewTransitionState.html useViewTransitionState()} hook.  */
  //   viewTransition?: boolean;
  // }
  // TODO: OTOH seems like passing state might be impossible without a store: https://stackoverflow.com/questions/41466055/how-do-i-pass-state-through-react-router
  // Easiest thing to do would be to preload the session with the savepath and have it load from there on the first load

  // TODO: I think I can store the path to the data in the url then use uselocation to load it in?
  return (
    <Fragment>
      {/* <button className="landing-button" onClick={() => navigate("app")}>
        New
      </button> */}
      <Link to={"app"}>New</Link>
      <button className="landing-button" onClick={() => window.api.open.file()}>
        Open
      </button>
    </Fragment>
  );
}
