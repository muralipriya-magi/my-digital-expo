import AppRoutes from "./routes/AppRoutes";
import {Toaster} from "react-hot-toast";
function App(){
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            borderRadius: "14px",
            background: "#3D0040",
            color: "#fff",
            boxShadow: "0 16px 36px rgba(61,0,64,0.18)",
          },
          success: {
            style: {
              background: "#166534",
            },
          },
          error: {
            style: {
              background: "#B42318",
            },
          },
        }}
      />
      <AppRoutes/>
    </>
    
  );
}

export default App;
