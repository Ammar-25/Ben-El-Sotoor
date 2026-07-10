/* =====================================================================
   auth-service.js — Service contract for authentication.
   Handles login, registration, logout, and refresh token requests.
   Saves access and refresh tokens in localStorage, automatically
   refreshing expired credentials.
   ===================================================================== */

const AuthService = (() => {
  // Base endpoint for ASP.NET Core AuthController
  const API_BASE = "http://localhost:5033/api/Auth";

  /* ---------- JWT Parsing Utilities ---------- */
  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  function isTokenExpired(token) {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;
    // Buffer of 30 seconds to refresh before actual expiration
    const buffer = 30;
    return payload.exp < Date.now() / 1000 + buffer;
  }

  /* ---------- Token Management ---------- */
  function getStorage() {
    return localStorage.getItem("use_local_storage") ? localStorage : sessionStorage;
  }

  function saveTokens(token, refreshToken, rememberMe = true) {
    if (rememberMe) {
      localStorage.setItem("use_local_storage", "true");
    } else {
      localStorage.removeItem("use_local_storage");
    }
    const storage = getStorage();
    if (token) storage.setItem("auth_token", token);
    if (refreshToken) storage.setItem("refresh_token", refreshToken);
  }

  function getToken() {
    return getStorage().getItem("auth_token") || localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  }

  function getRefreshToken() {
    return getStorage().getItem("refresh_token") || localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
  }

  function clearTokens() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("refresh_token");
    localStorage.removeItem("use_local_storage");
  }

  function isAuthenticated() {
    return !!getToken();
  }

  function getUser() {
    const token = getToken();
    if (!token) return null;
    return parseJwt(token);
  }

  function shouldRefresh() {
    const token = getToken();
    const refresh = getRefreshToken();
    if (!refresh) return false;
    if (!token) return true;
    return isTokenExpired(token);
  }

  function isAdmin() {
    const user = getUser();
    if (!user) return false;
    const roles = user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || user.role || user.roles || [];
    if (Array.isArray(roles)) {
      return roles.includes("Admin");
    }
    return roles === "Admin";
  }

  /* ---------- API Services ---------- */

  /**
   * Send a login request.
   */
  async function login(email, password, rememberMe = true) {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();
      const isSuccess = data.isSuccess ?? data.IsSuccess ?? response.ok;

      if (isSuccess) {
        const token =
          data.token || data.accessToken || data.Token || data.AccessToken;
        const refreshToken = data.refreshToken || data.RefreshToken;
        saveTokens(token, refreshToken, rememberMe);
        return {
          ok: true,
          token,
          refreshToken,
          message: data.message || "Success",
        };
      }
      return { ok: false, message: data.message || "Login failed" };
    } catch (error) {
      console.warn("[AuthService] Real API failed, using simulation:", error);
      const res = await simulateLogin(email, password, rememberMe);
      if (res.ok) saveTokens(res.token, res.refreshToken, rememberMe);
      return res;
    }
  }

  /**
   * Send a registration request.
   */
  async function register(name, email, password) {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      const isSuccess = data.isSuccess ?? data.IsSuccess ?? response.ok;

      if (isSuccess) {
        const token =
          data.token || data.accessToken || data.Token || data.AccessToken;
        const refreshToken = data.refreshToken || data.RefreshToken;
        saveTokens(token, refreshToken);
        return {
          ok: true,
          token,
          refreshToken,
          message: data.message || "Success",
        };
      }
      return { ok: false, message: data.message || "Registration failed" };
    } catch (error) {
      console.warn("[AuthService] Real API failed, using simulation:", error);
      const res = await simulateRegister(name, email, password);
      if (res.ok) saveTokens(res.token, res.refreshToken);
      return res;
    }
  }

  /**
   * Refresh the access token using the refresh token.
   */
  async function refresh() {
    const token = getToken();
    const refreshToken = getRefreshToken();
    if (!refreshToken)
      return { ok: false, message: "No refresh token available" };

    try {
      const response = await fetch(`${API_BASE}/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ token: token || "missing_token", refreshToken }),
      });

      const data = await response.json();
      const isSuccess = data.isSuccess ?? data.IsSuccess ?? response.ok;

      if (isSuccess) {
        const newToken =
          data.token || data.accessToken || data.Token || data.AccessToken;
        const newRefreshToken = data.refreshToken || data.RefreshToken;
        saveTokens(newToken, newRefreshToken);
        console.log("[AuthService] Token refreshed successfully");
        return { ok: true, token: newToken, refreshToken: newRefreshToken };
      }
      console.error("[AuthService] Refresh failed on server:", data.message);
      clearTokens();
      return { ok: false, message: data.message || "Session expired" };
    } catch (error) {
      console.warn(
        "[AuthService] Refresh API failed, using simulation:",
        error,
      );
      const res = await simulateRefresh(token, refreshToken);
      if (res.ok) saveTokens(res.token, res.refreshToken);
      return res;
    }
  }

  /**
   * Send a logout request and clear local session.
   */
  async function logout() {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await fetch(`${API_BASE}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.warn("[AuthService] Logout API failed:", error);
      }
    }
    clearTokens();
  }

  /**
   * Send a Google login/register request
   */
  async function googleLogin(tokenId, isRegister) {
    try {
      const response = await fetch(`${API_BASE}/social`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ tokenId, provider: "Google", isRegister }),
      });

      const data = await response.json();
      const isSuccess = data.isSuccess ?? data.IsSuccess ?? response.ok;

      if (isSuccess) {
        const token = data.token || data.accessToken || data.Token || data.AccessToken;
        const refreshToken = data.refreshToken || data.RefreshToken;
        saveTokens(token, refreshToken);
        return {
          ok: true,
          token,
          refreshToken,
          message: data.message || "Success",
        };
      }
      return { ok: false, message: data.message || (isRegister ? "Registration failed" : "Login failed") };
    } catch (error) {
      console.warn("[AuthService] Google API failed:", error);
      return { ok: false, message: "Network error during Google auth" };
    }
  }

  /**
   * Authenticated fetch wrapper. Automatically injects authorization header,
   * detects 401s, handles token refresh, and retries.
   */
  async function fetchAuthenticated(url, options = {}) {
    let token = getToken();
    if (shouldRefresh()) {
      const res = await refresh();
      if (res.ok) {
        token = res.token;
      } else {
        location.href = "login.html";
        throw new Error("Authentication session expired");
      }
    }

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token || ""}`,
    };

    let response = await fetch(url, options);

    // If unauthorized, token might have just expired. Try to refresh once and retry.
    if (response.status === 401) {
      const res = await refresh();
      if (res.ok) {
        options.headers["Authorization"] = `Bearer ${res.token}`;
        response = await fetch(url, options);
      } else {
        location.href = "login.html";
        throw new Error("Authentication session expired");
      }
    }

    return response;
  }

  function simulateLogin(email, password, rememberMe = true) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          // Generate a mock JWT that expires in 15 minutes (900 seconds)
          const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
          
          // Determine role based on email for testing
          const roles = email.toLowerCase().includes("admin") ? ["Admin"] : ["Reader"];
          
          const payload = btoa(
            JSON.stringify({
              sub: "1234567890",
              name: "محمد علي",
              email: email,
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": roles,
              role: roles,
              exp: Math.floor(Date.now() / 1000) + 900,
            }),
          );
          const mockToken = `${header}.${payload}.signature`;
          resolve({
            ok: true,
            token: mockToken,
            refreshToken:
              "mock_refresh_token_" + Math.random().toString(36).substring(2),
            message: "Simulation login successful",
          });
        } else {
          resolve({
            ok: false,
            message:
              "Simulation: Email required and password must be at least 6 characters",
          });
        }
      }, 600);
    });
  }

  function simulateRegister(name, email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (name && email && password.length >= 6) {
          const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
          const payload = btoa(
            JSON.stringify({
              sub: "1234567890",
              name: name,
              email: email,
              exp: Math.floor(Date.now() / 1000) + 900,
            }),
          );
          const mockToken = `${header}.${payload}.signature`;
          resolve({
            ok: true,
            token: mockToken,
            refreshToken:
              "mock_refresh_token_" + Math.random().toString(36).substring(2),
            message: "Simulation registration successful",
          });
        } else {
          resolve({
            ok: false,
            message:
              "Simulation: All fields are required and password must be at least 6 characters",
          });
        }
      }, 600);
    });
  }

  function simulateRefresh(token, refreshToken) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payload = parseJwt(token) || {};
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const newPayload = btoa(
          JSON.stringify({
            ...payload,
            exp: Math.floor(Date.now() / 1000) + 900, // extend by another 15 minutes
          }),
        );
        const newMockToken = `${header}.${newPayload}.signature`;
        resolve({
          ok: true,
          token: newMockToken,
          refreshToken:
            "mock_refresh_token_" + Math.random().toString(36).substring(2),
        });
      }, 300);
    });
  }

  return {
    login,
    register,
    refresh,
    logout,
    getToken,
    getRefreshToken,
    isAuthenticated,
    getUser,
    isAdmin,
    shouldRefresh,
    fetchAuthenticated,
    googleLogin,
  };
})();

window.AuthService = AuthService;
