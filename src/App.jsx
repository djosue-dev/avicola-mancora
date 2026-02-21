import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"

import { DarkModeProvider } from "./context/DarkModeContext";

import GlobalStyles from "./styles/GlobalStyles"
import Dashboard from "./pages/Dashboard"
import Ventas from "./pages/Ventas"
import Pesos from "./pages/Pesos"
import Clientes from "./pages/Clientes"
import Reportes from "./pages/Reportes"
import Configuracion from "./pages/Configuracion"
import Login from "./pages/Login"
import PageNotFound from "./pages/PageNotFound"
import AppLayout from "./ui/AppLayout"
import ProtectedRoute from "./ui/ProtectedRoute"


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0,
        },
    },
});


function App() {
    return (
        <DarkModeProvider>
            <QueryClientProvider client={queryClient}>
                <GlobalStyles />
                <BrowserRouter>
                    <Routes>
                        <Route element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                        >
                            <Route index element={<Navigate replace to='dashboard' />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="ventas" element={<Ventas />} />
                            <Route path="pesos" element={<Pesos />} />
                            <Route path="clientes" element={<Clientes />} />
                            <Route path="reportes" element={<Reportes />} />
                            <Route path="configuracion" element={<Configuracion />} />
                        </Route>

                        <Route path="login" element={<Login />} />
                        <Route path="*" element={<PageNotFound />} />
                    </Routes>
                </BrowserRouter>

                <Toaster
                    position="top-center"
                    gutter={12}
                    containerStyle={{ margin: "8px" }}
                    toastOptions={{
                        success: {
                            duration: 3000,
                        },
                        error: {
                            duration: 5000,
                        },
                        style: {
                            fontSize: "16px",
                            maxWidth: "500px",
                            padding: "16px 24px",
                            backgroundColor: "var(--color-grey-0)",
                            color: "var(--color-grey-700)",
                        },
                    }}
                />
            </QueryClientProvider>
        </DarkModeProvider>
    )
}

export default App
