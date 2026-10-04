// /*import Sidebar from "../components/Sidebar";
// import HeroSection from "../components/HeroSection";
// import FeaturesSection from "../components/FeaturesSection";
// import HowItWorks from "../components/HowItWorks";
// import Testimonials from "../components/Testimonials";
// import ContactSection from "../components/ContactSection";
// import FooterSection from "../components/FooterSection";

// import { useState } from "react";

// export default function LandingPage() {

//   const [activeNav,setActiveNav] = useState("home");

//   const scrollTo = (id) => {
//     setActiveNav(id);
//     const el = document.getElementById(id);
//     if (el) el.scrollIntoView({behavior:"smooth"});
//   };

//   return (

//     <div style={{display:"flex",minHeight:"100vh"}}>

//       <Sidebar active={activeNav} onNav={scrollTo}/>

//       <main style={{flex:1,marginLeft:"260px"}}>

//         <HeroSection onCTA={()=>scrollTo("contact")} />

//         <FeaturesSection/>

//         <HowItWorks/>

//         <Testimonials/>

//         <ContactSection/>

//         <FooterSection/>

//       </main>

//     </div>

//   );
// }*/
// import { useState } from "react";

// /* layout components */
// import Sidebar from "../../components/layout/Sidebar";
// import Navbar from "../../components/layout/Navbar";

// /* page sections */
// import HeroSection from "../../components/sections/HeroSection";
// import FeaturesSection from "../../components/sections/FeaturesSection";
// import HowItWorks from "../../components/sections/HowItWorks";
// import Testimonials from "../../components/sections/Testimonials";
// import ContactSection from "../../components/sections/ContactSection";
// import FooterSection from "../../components/sections/FooterSection";

// export default function LandingPage() {

//   const [activeNav,setActiveNav] = useState("home");

//   const scrollTo = (id) => {
//     setActiveNav(id);
//     const el = document.getElementById(id);

//     if (el) {
//       el.scrollIntoView({behavior:"smooth"});
//     }
//   };

//   return (

//     <div style={{display:"flex",minHeight:"100vh"}}>

//       {/* SIDEBAR */}
//       <Sidebar active={activeNav} onNav={scrollTo} />

//       {/* MAIN AREA */}
//       <div style={{flex:1,marginLeft:"260px"}}>

//         {/* TOP NAVBAR */}
//         <Navbar />

//         {/* PAGE CONTENT */}
//         <main style={{marginTop:"70px"}}>

//           <HeroSection onCTA={()=>scrollTo("contact")} />

//           <FeaturesSection />

//           <HowItWorks />

//           <Testimonials />

//           <ContactSection />

//           <FooterSection />

//         </main>

//       </div>

//     </div>

//   );
// }
// import {useState} from "react"

// import Sidebar from "../../components/layout/Sidebar"
// import Navbar from "../../components/layout/Navbar"

// import HeroSection from "../../components/sections/HeroSection"
// import FeaturesSection from "../../components/sections/FeaturesSection"
// import HowItWorks from "../../components/sections/HowItWorks"
// import Testimonials from "../../components/sections/Testimonials"
// import ContactSection from "../../components/sections/ContactSection"
// import FooterSection from "../../components/sections/FooterSection"

// export default function LandingPage(){

//   const [activeNav,setActiveNav]=useState("home")

//   const [sidebarOpen,setSidebarOpen]=useState(false)

//   const scrollTo=id=>{

//     setActiveNav(id)

//     const el=document.getElementById(id)

//     if(el){

//       el.scrollIntoView({behavior:"smooth"})

//     }

//   }

//   return(

//     <div>

//       <Navbar
//         toggleSidebar={()=>setSidebarOpen(!sidebarOpen)}
//       />

//       <Sidebar
//         active={activeNav}
//         onNav={scrollTo}
//         open={sidebarOpen}
//         setOpen={setSidebarOpen}
//       />

//       <main
//         style={{
//           marginTop:"70px"
//         }}
//       >

//         <HeroSection onCTA={()=>scrollTo("contact")}/>

//         <FeaturesSection/>

//         <HowItWorks/>

//         <Testimonials/>

//         <ContactSection/>

//         <FooterSection/>

//       </main>

//     </div>

//   )

// }
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import Sidebar from "../../components/layout/Sidebar"
import Navbar from "../../components/layout/Navbar"

import HeroSection from "../../components/sections/HeroSection"
import FeaturesSection from "../../components/sections/FeaturesSection"
import HowItWorks from "../../components/sections/HowItWorks"
import Testimonials from "../../components/sections/Testimonials"
import ContactSection from "../../components/sections/ContactSection"
import FooterSection from "../../components/sections/FooterSection"

export default function LandingPage(){

  const [activeNav,setActiveNav]=useState("home")
  const [sidebarOpen,setSidebarOpen]=useState(false)

  const navigate = useNavigate()

  const scrollTo=id=>{

    setActiveNav(id)

    const el=document.getElementById(id)

    if(el){
      el.scrollIntoView({behavior:"smooth"})
    }

  }

  return(

    <div>

      <Navbar
        active={activeNav}
        onNav={scrollTo}
        onStart={() => navigate("/login?role=admin")}
        toggleSidebar={()=>setSidebarOpen(!sidebarOpen)}
      />

      <Sidebar
        active={activeNav}
        onNav={scrollTo}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <main
        style={{
          marginTop:"70px",
          marginLeft:"0"
        }}
      >

        {/* HERO SECTION */}

        <HeroSection
          onCTA={()=>navigate("/roles")}
        />

        <FeaturesSection/>

        <HowItWorks/>

        <Testimonials/>

        <ContactSection/>

        <FooterSection/>

      </main>

    </div>

  )

}
