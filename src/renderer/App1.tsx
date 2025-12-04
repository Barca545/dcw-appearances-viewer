import { ReactNode, Fragment, createContext, useState } from "react";
import CharacterSearchForm from "./components/CharacterSearchForm.js";
import AppResults from "./components/AppResults.js";

// TODO: Create a context provider here for density and the list contents
// TODO: Figure out how to load an existing file.
// - Use context to store the file url? might get complicated once tabs are involved
// TODO: Need a context for setting the results box to a loading state while a request is in process

// https://react.dev/reference/react/useContext#updating-data-passed-via-context
const LoadingContext = createContext<boolean | null>(null);

// TODO: I think my everything is complicated enough I do need a store not just context, sigh

export default function App(): ReactNode {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Fragment>
      <LoadingContext value={{ isLoading, setIsLoading }}>
        <CharacterSearchForm />
        <AppResults />
      </LoadingContext>
    </Fragment>
  );
}

// function DenseResultsList(entries: ListEntry[]): ReactNode {
//   const results = entries.map((entry) => {
//     return <div className="dense-result">{ResultTitle(entry)}</div>;
//   });

//   return results;
// }

// function ResultsList(entries: ListEntry[]): ReactNode {
//   const results = entries.map((entry) => {
//     return (
//       <details className="result-details">
//         <summary className="result-summary">{ResultTitle(entry)}</summary>
//         {/* <!-- TODO: rename --> */}
//         <div className="result-body">
//           {/* <!--Synopsis goes here--> */}
//           Synopsis
//         </div>
//       </details>
//     );
//   });

//   return results;
// }
