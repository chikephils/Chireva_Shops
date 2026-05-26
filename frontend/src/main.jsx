import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store, persistor } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import { setNavigate } from "./utils/navigation";
import { setupInterceptors } from "./utils/axios";
import "./index.css";

setupInterceptors(store);

const AppWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppWrapper />
      </PersistGate>
    </Provider>
  </Router>,
);
