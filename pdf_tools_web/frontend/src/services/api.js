import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    alert(error.response?.data?.message || "Something went wrong. Please try again.");
    return Promise.reject(error);
  }
);



const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === `${name}=`) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Add CSRF token to headers automatically
api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export default api;

// export default instance;


// Request URL:
// http://127.0.0.1:8000/api/edit-pdf/upload-pdf/
// Request Method:
// POST
// Status Code:
// 403 Forbidden
// Remote Address:
// 127.0.0.1:8000
// Referrer Policy:
// strict-origin-when-cross-origin
// access-control-allow-credentials:
// true
// access-control-allow-origin:
// http://localhost:3000
// content-length:
// 2855
// content-type:
// text/html; charset=utf-8
// cross-origin-opener-policy:
// same-origin
// date:
// Sat, 12 Apr 2025 18:09:04 GMT
// referrer-policy:
// same-origin
// server:
// WSGIServer/0.2 CPython/3.13.1
// vary:
// origin
// x-content-type-options:
// nosniff
// x-frame-options:
// DENY
// accept:
// application/json, text/plain, */*
// accept-encoding:
// gzip, deflate, br, zstd
// accept-language:
// en-US,en;q=0.9
// connection:
// keep-alive
// content-length:
// 378199
// content-type:
// multipart/form-data; boundary=----WebKitFormBoundaryBO6JBv1ssP5CenKQ
// host:
// 127.0.0.1:8000
// origin:
// http://localhost:3000
// referer:
// http://localhost:3000/
// sec-ch-ua:
// "Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"
// sec-ch-ua-mobile:
// ?0
// sec-ch-ua-platform:
// "Windows"
// sec-fetch-dest:
// empty
// sec-fetch-mode:
// cors
// sec-fetch-site:
// cross-site
// sec-fetch-storage-access:
// active
// user-agent:
// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36