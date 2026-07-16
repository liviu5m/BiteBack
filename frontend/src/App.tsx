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
import Cook from "./components/pages/Cook";
import Share from "./components/pages/Share";
import Chat from "./components/pages/Chat";

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
                path="/aApp.App.uth/*"
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
                      <Route path="/cook" element={<Cook />} />
                      <Route path="/share" element={<Share />} />
                      <Route path="/chat" element={<Chat />} />
                    </Routes>
                  </AuthRequiredRoute>
                }
              />{" "}
            </Routes>{" "}
          </BrowserRouter>{" "}
          <ToastContainer />{" "}
        </AppProvider>
      </QueryClientProvider >
    </>
  );
}

export default App;
