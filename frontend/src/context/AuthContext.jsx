import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("factoryflow_token"));
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("factoryflow_user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // =========================
  // LOGIN
  // =========================

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        return {
          success: false,
          message: "Please enter email and password.",
        };
      }

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Login failed.",
        };
      }

      // Save JWT
      localStorage.setItem(
        "factoryflow_token",
        data.token
      );

      // Save user
      localStorage.setItem(
        "factoryflow_user",
        JSON.stringify(data.user)
      );

      setUser(data.user);
      setIsAuthenticated(true);

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error("Login Error:", error);

      return {
        success: false,
        message:
          "Unable to connect to server. Please make sure backend is running.",
      };
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("factoryflow_token");
    localStorage.removeItem("factoryflow_user");

    setUser(null);
    setIsAuthenticated(false);
  };

  // =========================
  // GET CURRENT USER
  // =========================

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem(
        "factoryflow_token"
      );

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        logout();
        return;
      }

      setUser(data.user);

      localStorage.setItem(
        "factoryflow_user",
        JSON.stringify(data.user)
      );

      setIsAuthenticated(true);
    } catch (error) {
      console.error(
        "Get Current User Error:",
        error
      );
    }
  };

  // Check login when application starts
  useEffect(() => {
    const token = localStorage.getItem(
      "factoryflow_token"
    );

    if (token) {
      getCurrentUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}