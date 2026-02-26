import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"

import { DarkModeProvider } from "./context/DarkModeContext";
import { UserRoleProvider } from "./context/UserRoleContext";

import GlobalStyles from "./styles/GlobalStyles"
import Dashboard from "./pages/Dashboard"
import Ventas from "./pages/Ventas"
import Pesos from "./pages/Pesos"
import Clientes from "./pages/Clientes"
import Reportes from "./pages/Reportes"
import Configuracion from "./pages/Configuracion"
import Pizarra from "./pages/Pizarra"
import Camal from "./pages/Camal"
import Procesos from "./pages/Procesos"
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
                <UserRoleProvider>
                    <GlobalStyles />
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                                <Route path="reportes" element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                        <Reportes />
                                    </ProtectedRoute>
                                } />
                                <Route path="configuracion" element={
                                    <ProtectedRoute allowedRoles={["admin"]}>
                                        <Configuracion />
                                    </ProtectedRoute>
                                } />
                                <Route path="pizarra" element={
                                    <ProtectedRoute allowedRoles={["admin", "digitador"]}>
                                        <Pizarra />
                                    </ProtectedRoute>
                                } />
                                <Route path="camal" element={
                                    <ProtectedRoute allowedRoles={["admin", "pesador"]}>
                                        <Camal />
                                    </ProtectedRoute>
                                } />
                                <Route path="procesos" element={
                                    <ProtectedRoute allowedRoles={["admin", "pesador"]}>
                                        <Procesos />
                                    </ProtectedRoute>
                                } />
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
                </UserRoleProvider>
            </QueryClientProvider>
        </DarkModeProvider>
    )
}

export default App
