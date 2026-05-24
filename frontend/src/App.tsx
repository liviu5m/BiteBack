import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import { AppProvider } from "./lib/AppProvider";
import NonAuthRequiredRoute from "./components/middlewares/NonAuthRequiredRoute";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";

function App() {
  const queryClient = new QueryClient();

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
                      <Route path="/signup" element={<Signup />} />
                    </Routes>
                  </NonAuthRequiredRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
