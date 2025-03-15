import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User } from "../interfaces/userinterface";
import axios from "axios";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  login: () => { },
  logout: () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const refreshToken = async () => {
    try {

      const response = await axios.post("http://localhost:5000/auth/token", {}, {
        withCredentials: true
      });

      const { accessToken, currUser } = response.data;
      setAccessToken(accessToken);
      setUser(currUser)
    } catch (error) {
      console.error("Refresh token failed:", error);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    console.log('running like a hyena')
    refreshToken()
  }, [])

  const login = (user: User, token: string) => {
    setUser(user);
    setAccessToken(token);
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    await axios.post('http://localhost:5000/auth/logout', {}, {
      withCredentials: true
    })
  };

  return <AuthContext.Provider value={{ user, accessToken, login, logout }}>{children}</AuthContext.Provider>;
};