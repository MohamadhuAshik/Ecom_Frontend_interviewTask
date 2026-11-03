import apiClient from "./apiClient";


export async function signupApi(userData) {
  return await apiClient("/users/signup", {
    method: "POST",
    body: userData,
  });
}


export async function loginApi(credentials) {
  return await apiClient("/users/login", {
    method: "POST",
    body: credentials,
  });
}


export async function getProfileApi() {
  return await apiClient("/users/profile", {
    method: "GET",
  });
}

