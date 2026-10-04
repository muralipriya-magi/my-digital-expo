import { Suspense, useState } from "react"
import { C } from "../../constants/colors"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

function DashboardSectionLoader() {
  return (
    <div
      style={{
        background: C.white,
        border: `1px solid ${C.borderSoft}`,
        borderRadius: "18px",
        padding: "24px",
        color: C.textMid,
        fontWeight: "700",
      }}
    >
      Loading section...
    </div>
  )
}

export default function DashboardLayout({
  title,
  menu,
  children
}){

  const [active,setActive] = useState(menu[0].id)

  const ActiveComponent = menu.find(m=>m.id===active)?.component

  return(

    <div style={{display:"flex"}}>

      <Sidebar
        items={menu}
        active={active}
        onChange={setActive}
      />

      <main
        style={{
          marginLeft:"250px",
          padding:"30px",
          width:"100%",
          minHeight:"100vh",
          background:C.surface
        }}
      >

        <Topbar title={title} />

        <div>

          {ActiveComponent && (
            <Suspense fallback={<DashboardSectionLoader />}>
              <ActiveComponent />
            </Suspense>
          )}

          {children}

        </div>

      </main>

    </div>

  )

}
