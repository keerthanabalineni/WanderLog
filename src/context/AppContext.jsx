import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_AUTH = "wanderlog_auth";

const AppContext = createContext(null);

function getSavedUser() {
  try {
    const value = localStorage.getItem(STORAGE_AUTH);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getSavedBucket(email) {
  if (!email) return {};
  try {
    const stored = localStorage.getItem(`wanderlog_bucket_${email}`);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => getSavedUser());
  const [bucket, setBucket] = useState(() => getSavedBucket(getSavedUser()?.email));

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_AUTH);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`wanderlog_bucket_${user.email}`, JSON.stringify(bucket));
    }
  }, [bucket, user]);

  async function login({ email, password, register }) {
    if (!email || !password) {
      return { success: false, message: "Email and password are required." };
    }

    const endpoint = register ? "register" : "login";

    try {
      const response = await fetch(`https://reqres.in/api/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      const isDemoUser = email === "eve.holt@reqres.in";

      if (!response.ok) {
        if (data?.error === "missing_api_key" && isDemoUser) {
          const demoToken = `demo-${Date.now()}`;
          setUser({ email, token: demoToken });
          setBucket(getSavedBucket(email));
          return {
            success: true,
            fallback: true,
            message: "Reqres API key missing; signed in with demo fallback.",
          };
        }

        return {
          success: false,
          message: data.error || "Authentication failed. Please try again.",
        };
      }

      if (!data.token) {
        return { success: false, message: "Unexpected auth response." };
      }

      setUser({ email, token: data.token });
      setBucket(getSavedBucket(email));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error?.message || "Unable to connect. Please try again.",
      };
    }
  }

  function logout() {
    setUser(null);
    setBucket({});
  }

  function updateCountryStatus(code, status) {
    setBucket((prev) => {
      if (!code) return prev;
      const next = { ...prev };
      if (!status) {
        delete next[code];
      } else {
        next[code] = status;
      }
      return next;
    });
  }

  const counts = useMemo(() => {
    const wish = Object.values(bucket).filter((status) => status === "wish").length;
    const visited = Object.values(bucket).filter((status) => status === "visited").length;
    return { wish, visited };
  }, [bucket]);

  return (
    <AppContext.Provider value={{ user, login, logout, bucket, updateCountryStatus, counts }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
}
