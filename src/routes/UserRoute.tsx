import React from 'react'
import Login from "../pages/Login";
import { Routes,Route } from "react-router-dom";
import { UserLoggedOut } from '../components/userLoggedOut';
import { UserLoggedIn } from '../components/userLoggedIn';
import Dashboard from '../pages/Dashboard';

const  UserRoute:React.FC = () => {
  return (
    <>
    <Routes>
        <Route path='' element={<UserLoggedOut/>}>
                <Route path="/" element={<Login/>}/>
        </Route>
        <Route path='' element={<UserLoggedIn/>}> 
            <Route path='/dashboard' element={<Dashboard/>}/>
         </Route>
    </Routes>
    </>
  )
}

export default UserRoute