
import React, { useEffect } from "react";
import {signInWithGoogle,logOut } from '../firebase/firebaseConfig'
import { useAuth } from "../context/authContext";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

const Login:React.FC = () => {
const navigate = useNavigate()
  const {user} = useAuth()
  useEffect(()=>{
    if(user){
      navigate('/dashboard')
    }
  },[])
  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-50">
      <div className="text-center">
        <div className="mb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">📋</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-purple-900">TaskBuddy</h1>
          <p className="text-gray-600 mt-2">
            Streamline your workflow and track progress effortlessly
            <br />
            with our all-in-one task management app.
          </p>
        </div>
      
        <div className="flex justify-center bg-black text-white h-10 rounded-xl">
        <FcGoogle size={20} style={{ marginRight: '10px', marginTop:'10px' }} />
        <button onClick={signInWithGoogle} className="google-sign-in">
         
          Sign in with Google
        </button>
        </div>
      
      </div>
    </div>
  );
};



export default Login;

