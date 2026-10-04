// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Login from "../pages/auth/Login";
// import ExpoList from "../pages/expos/ExpoList";
// import Signup from "../pages/auth/SignUp";
// import RoleSelection from "../pages/auth/RoleSelection";

// function AppRoutes(){
//     return(
//         <BrowserRouter>
//             <Routes>
//                 <Route path="/roles" element={<RoleSelection />} />
//                 <Route path="/login" element={<Login/>}/>
//                 <Route path="/signup" element={<Signup/>}/>
//                 <Route path="/expos" element={<ExpoList/>}/>

//             </Routes>        
//         </BrowserRouter>
//     )
// }
// export default AppRoutes;
import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import ProtectedRoute from "./ProtectedRoute"

const LandingPage = lazy(() => import("../pages/marketing/LandingPage"))
const PublicExpoDetail = lazy(() => import("../pages/expos/PublicExpoDetail"))
const RoleSelection = lazy(() => import("../pages/auth/RoleSelection"))
const Login = lazy(() => import("../pages/auth/Login"))
const SignUp = lazy(() => import("../pages/auth/SignUp"))
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"))
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"))
const OrganizerDashboard = lazy(() => import("../dashboards/organizer/OrganizerDashboard"))
const VendorDashboard = lazy(() => import("../dashboards/vendor/VendorDashboard"))
const AdminDashboard = lazy(() => import("../dashboards/admin/AdminDashboard"))
const VisitorDashboard = lazy(() => import("../dashboards/visitor/VisitorDashboard"))

function RouteLoader() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#FFF8FC", color: "#3D0040" }}>
      <p style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Loading page...</p>
    </div>
  )
}

export default function AppRoutes(){

  return(

    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>

          <Route path="/" element={<LandingPage/>}/>
          <Route path="/expos/:id" element={<PublicExpoDetail/>}/>

          <Route path="/roles" element={<RoleSelection/>}/>

          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<SignUp/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/reset-password" element={<ResetPassword/>}/>

          {/* PROTECTED DASHBOARDS */}

          <Route
            path="/organizer-dashboard"
            element={
              <ProtectedRoute allowedRole="organizer">
                <OrganizerDashboard/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendor-dashboard"
            element={
              <ProtectedRoute allowedRole="vendor">
                <VendorDashboard/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/visitor-dashboard"
            element={
              <ProtectedRoute allowedRole="visitor">
                <VisitorDashboard/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard/>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>

    </BrowserRouter>

  )

}
