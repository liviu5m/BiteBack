import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import { AppProvider } from "./lib/AppProvider";
import NonAuthRequiredRoute from "./components/middlewares/NonAuthRequiredRoute";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";
import { ToastContainer } from "react-toastify";
import Verify from "./components/pages/Verify";
import AuthRequiredRoute from "./components/middlewares/AuthRequiredRoute";
import Dashboard from "./components/pages/Dashboard";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false
      },
    },
  });

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/auth/*"
                element={
                  <NonAuthRequiredRoute>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />{" "}
                      <Route path="/verify" element={<Verify />} />{" "}
                    </Routes>
                  </NonAuthRequiredRoute>
                }
              />
              <Route
                path="/*"
                element={
                  <AuthRequiredRoute>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                  </AuthRequiredRoute>
                }
              />{" "}
            </Routes>{" "}
          </BrowserRouter>{" "}
          <ToastContainer />{" "}
        </AppProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
