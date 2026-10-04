import { useNavigate } from "react-router-dom";
import { C } from "../../constants/colors";

import {
  ArrowRight,
  Calendar,
  Store,
  Ticket
} from "lucide-react";

const ROLES = [

  {
    name:"Organizer",
    key:"organizer",
    icon:Calendar,
    desc:"Create and manage exhibitions."
  },

  {
    name:"Vendor",
    key:"vendor",
    icon:Store,
    desc:"Book stalls and showcase products."
  },

  {
    name:"Visitor",
    key:"visitor",
    icon:Ticket,
    desc:"Discover and attend exhibitions."
  }

];

export default function RoleSelection(){

  const navigate = useNavigate()

  const handleRole = (role) => {

    navigate(`/login?role=${role}`)

  }

  return(

    <div
      style={{
        minHeight:"100vh",
        background:`linear-gradient(160deg, ${C.pinkLight} 0%, white 60%)`,
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        padding:"40px"
      }}
    >

      <div
        style={{
          maxWidth:"900px",
          width:"100%",
          textAlign:"center"
        }}
      >

        {/* TITLE */}

        <h1
          style={{
            fontSize:"36px",
            fontWeight:"800",
            color:C.text,
            marginBottom:"10px"
          }}
        >
          Choose Your Role
        </h1>

        <p
          style={{
            color:C.textMid,
            marginBottom:"50px"
          }}
        >
          Select how you want to use ExpoSphere.
        </p>

        <div
          style={{
            maxWidth:"720px",
            margin:"0 auto 34px",
            padding:"14px 18px",
            borderRadius:"16px",
            background:"rgba(255,255,255,0.86)",
            border:`1px solid ${C.border}`,
            color:C.textMid,
            lineHeight:"1.7",
            fontSize:"14px"
          }}
        >
          If you are a new organizer, register first and wait for admin approval. Existing approved organizers can log in directly.
        </div>


        {/* ROLE CARDS */}

        <div
          style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
            gap:"30px"
          }}
        >

          {ROLES.map((role,i)=>{

            const Icon = role.icon

            return(

              <div
                key={i}
                onClick={()=>handleRole(role.key)}
                style={{
                  padding:"40px 30px",
                  background:"white",
                  borderRadius:"20px",
                  border:`1px solid ${C.border}`,
                  cursor:"pointer",
                  transition:"0.3s",
                  boxShadow:"0 10px 30px rgba(0,0,0,0.06)"
                }}
                onMouseEnter={(e)=>{

                  e.currentTarget.style.transform="translateY(-6px)"

                }}
                onMouseLeave={(e)=>{

                  e.currentTarget.style.transform="translateY(0)"

                }}
              >

                {/* ICON */}

                <div
                  style={{
                    width:"70px",
                    height:"70px",
                    borderRadius:"16px",
                    background:C.pinkLight,
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    margin:"auto",
                    marginBottom:"20px"
                  }}
                >

                  <Icon size={32} color={C.pink}/>

                </div>

                {/* TITLE */}

                <h3
                  style={{
                    marginBottom:"10px",
                    color:C.text
                  }}
                >
                  {role.name}
                </h3>

                {/* DESCRIPTION */}

                <p
                  style={{
                    fontSize:"14px",
                    color:C.textLight,
                    lineHeight:"1.6",
                    marginBottom:"18px"
                  }}
                >
                  {role.desc}
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/signup?role=${role.key}`)
                  }}
                  style={{
                    width:"100%",
                    padding:"12px 14px",
                    borderRadius:"12px",
                    border:`1px solid ${C.border}`,
                    background:C.pinkPale,
                    color:C.text,
                    fontWeight:"700",
                    cursor:"pointer",
                    display:"inline-flex",
                    alignItems:"center",
                    justifyContent:"center",
                    gap:"8px"
                  }}
                >
                  Register as {role.name} <ArrowRight size={16} />
                </button>

              </div>

            )

          })}

        </div>

        <p
          style={{
            marginTop:"22px",
            color:C.textLight,
            fontSize:"14px"
          }}
        >
          Already have an account? Choose your role card to continue to login.
        </p>

      </div>

    </div>

  )

}
