import { createContext, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import Router from 'next/router'

import { recoverUserInformation, signInRequest } from "../services/auth";
import { api } from "../services/api";
import router from "next/router";
import { GetServerSideProps } from "next";

type User = {
  name: string;
  email: string;
  avatar_url: string;
}

type SignInData = {
  email: string;
  password: string;
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: User;
  signIn: (data: SignInData) => Promise<void>
}

export const AuthContext = createContext({} as AuthContextType)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)

  const isAuthenticated = !!user;

  useEffect(() => {
    recoverUserInfo()
  }, [])

  async function recoverUserInfo(){
    const { 'nextauth.token': token } = parseCookies()

    if (token) {
      const recoverUser = await recoverUserInformation(token)

      if(recoverUser){
        setUser(recoverUser)
        if(Router.pathname === '/'){
          return Router.push('/dashboard')
        }
      }else {
        destroyCookie(undefined, 'nextauth.token' )
        setUser(null)
        router.push('/')
      }      
    } 
  }

  async function signIn({ email, password }: SignInData) {
    const { token, user } = await signInRequest({
      email,
      password,
    })

    setCookie(undefined, 'nextauth.token', token, {
      maxAge: 60 * 60 * 1, // 1 hour
    })
    
    api.defaults.headers['Authorization'] = `Bearer ${token}`;

    setUser(user)

    Router.push('/dashboard');
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn }}>
      {children}
    </AuthContext.Provider>
  )
  
}
