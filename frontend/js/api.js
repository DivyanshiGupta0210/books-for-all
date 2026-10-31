// api.js - one place that talks to the backend

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// FastAPI sends errors as {detail: "text"} or, for invalid input,
// {detail: [{msg: "..."}]} - turn either into one readable sentence.
function messageFromDetail(detail) {
  if (!detail) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map(function (d) {
        var m = String(d.msg || "Invalid input").replace(/^Value error,\s*/i, "");
        return m.charAt(0).toUpperCase() + m.slice(1);
      })
      .join(". ");
  }
  return null;
}

async function apiRequest(path, options) {
  options = options || {};
  const noAuthRedirect = options.noAuthRedirect;
  const fetchOptions = Object.assign({}, options);
  delete fetchOptions.noAuthRedirect;

  const headers = Object.assign({ "Content-Type": "application/json" }, fetchOptions.headers || {});
  const token = Auth.getToken();
  if (token) headers.Authorization = "Bearer " + token;

  let res;
  try {
    res = await fetch(API_BASE + path, Object.assign({}, fetchOptions, { headers: headers }));
  } catch (e) {
    throw new ApiError("Cannot reach the server. Please make sure the backend is running.", 0);
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch (e) { /* not JSON */ }
  }

  if (!res.ok) {
    if (res.status === 401 && !noAuthRedirect) {
      // expired / invalid token: send the user back to log in
      Auth.clear();
      Auth.redirectToLogin();
    }
    throw new ApiError(messageFromDetail(data && data.detail) || "Something went wrong (" + res.status + ")", res.status);
  }
  return data;
}
