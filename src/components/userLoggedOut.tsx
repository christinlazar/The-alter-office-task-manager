import { Outlet,Navigate } from "react-router-dom";
import React from 'react'
import { useAuth } from "../context/authContext";

export const  UserLoggedOut:React.FC = () =>{
    const {user} = useAuth()
  return (
    <>
        {user ? <Navigate to='/dashboard'/> : <Outlet/>}
    </>
  )
}
