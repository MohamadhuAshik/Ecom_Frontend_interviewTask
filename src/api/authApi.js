import apiClient from "./apiClient";

/**
 * Register a new user
 * @param {{ name: string, email: string, password: string, phone?: string, address?: string }} userData
 */
export async function signupApi(userData) {
  return await apiClient("/users/signup", {
    method: "POST",
    body: userData,
  });
}

/**
 * Login user
 * @param {{ email: string, password: string }} credentials
 */
export async function loginApi(credentials) {
  return await apiClient("/users/login", {
    method: "POST",
    body: credentials,
  });
}

/**
 * Get authenticated user profile
 */
export async function getProfileApi() {
  return await apiClient("/users/profile", {
    method: "GET",
  });
}

