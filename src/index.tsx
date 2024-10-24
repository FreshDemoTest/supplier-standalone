// React
import React from "react";
import ReactDOM from "react-dom/client";

// lazy image
import "lazysizes";
import "lazysizes/plugins/attrchange/ls.attrchange";
import "lazysizes/plugins/object-fit/ls.object-fit";
import "lazysizes/plugins/parent-fit/ls.parent-fit";

// snow
import 'react-quill/dist/quill.snow.css';

// redux
import { store, persistor } from "./redux/store";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";

// Service providers
import { AuthProvider } from "./contexts/FirebaseContext";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// PWA service worker
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// Vitals
import reportWebVitals from "./reportWebVitals";

// App
import App from "./App";
import LoadingScreen from "./components/LoadingScreen";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <>
    {/* <React.StrictMode> -- disabled for draggable list */}
    {/* Helmet for meta properties */}
    <HelmetProvider>
      {/* Redux Provider for state management */}
      <ReduxProvider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          {/* Router */}
          <BrowserRouter>
            {/* Firebase Auth Provider */}
            <AuthProvider>
              {/* Main app */}
              <App />
            </AuthProvider>
          </BrowserRouter>
        </PersistGate>
      </ReduxProvider>
    </HelmetProvider>
    {/* </React.StrictMode> */}
  </>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register(); // PWA Activated
// serviceWorkerRegistration.unregister(); // PWA Deactivated

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
