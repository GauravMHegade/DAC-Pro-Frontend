const BASE_URL = "https://dac-pro-backend.onrender.com/api";

/* ================= TOKEN & ROLE HELPERS ================= */
const getToken = () => sessionStorage.getItem("token");

const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const adminHeader = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  return {
    ...authHeader(),
    "X-User-Role": user?.role || "USER"
  };
};

// -------- AUTH --------
export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorMessage = await res.text();
    throw new Error(errorMessage);
  }

  const result = await res.json();

  sessionStorage.setItem("token", result.token);
  sessionStorage.setItem("user", JSON.stringify(result.user));

  return result;
};

// export const googleLogin = async (user) => {
//   const res = await fetch(`${BASE_URL}/auth/google`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(user)
//   });

//   const text = await res.text();
//   const result = text ? JSON.parse(text) : null;

//   if (res.ok && result?.token) {
//     sessionStorage.setItem("token", result.token);
//     sessionStorage.setItem("user", JSON.stringify(result.user));
//   } else {
//     throw new Error("Google login failed");
//   }

//   return result;
// };

export const googleLogin = async (user) => {

    const response = await fetch("https://dac-pro-backend.onrender.com/api/auth/google", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });

    if (!response.ok) {
        throw new Error("Google login failed");
    }

    const data = await response.json();

    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    return data;
};

// -------- MODULES --------
export const getModules = async () => {
  const res = await fetch(`${BASE_URL}/modules`, {
    headers: { ...authHeader() }
  });
  return res.json();
};

// -------- QUIZ --------
export const getQuestions = async (moduleId) => {
  const res = await fetch(`${BASE_URL}/quiz/${moduleId}`, {
    headers: { ...authHeader() }
  });
  return res.json();
};

// -------- RESULT --------
export async function saveResult(result) {
  const res = await fetch(`${BASE_URL}/result`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({
      userId: result.userId,
      moduleId: result.moduleId,
      score: result.score,
      attempted: result.attempted,
      unattempted: result.unattempted,
      testType: result.testType,
      mockNo: result.testType === "Mock" ? result.mockNo : null
    })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
}

export const getAttemptSummary = async (userId) => {
  const res = await fetch(`${BASE_URL}/result/attempts/${userId}`, {
    headers: { ...authHeader() }
  });
  return res.json();
};

export async function getLatestResultStats(userId) {
  try {
    const res = await fetch(`${BASE_URL}/result/latest/${userId}`, {
      headers: { ...authHeader() }
    });
    if (!res.ok) throw new Error("API not available");
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json"))
      throw new Error("Invalid response");
    return await res.json();
  } catch {
    return {
      moduleName: "N/A", score: 0, attempted: 0, unattempted: 0,
      totalTests: 0, practiceTests: 0, mockTests: 0, bestScore: 0
    };
  }
}

// -------- MOCK --------
export const getMockQuestions = async (moduleId, mockNumber) => {
  const res = await fetch(`${BASE_URL}/mock/${moduleId}/${mockNumber}`, {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error("Failed to load mock test");
  return res.json();
};

export const checkMockAttempt = (userId, moduleId, mockNo) =>
  fetch(`${BASE_URL}/result/check-mock?userId=${userId}&moduleId=${moduleId}&mockNo=${mockNo}`, {
    headers: { ...authHeader() }
  }).then(res => res.json());


// ======================================================
// ==================== ADMIN APIs ======================
// ======================================================

// -------- ADMIN: MODULES --------
export const adminGetModules = async () => {
  const res = await fetch(`${BASE_URL}/admin/modules`, {
    headers: { ...adminHeader() }
  });
  return res.json();
};

export const adminAddModule = async (module) => {
  const res = await fetch(`${BASE_URL}/admin/modules`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeader() },
    body: JSON.stringify(module)
  });
  return res.json();
};

export const adminUpdateModule = async (id, module) => {
  const res = await fetch(`${BASE_URL}/admin/modules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...adminHeader() },
    body: JSON.stringify(module)
  });
  return res.json();
};

export const adminDeleteModule = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/modules/${id}`, {
    method: "DELETE",
    headers: { ...adminHeader() }
  });
  return res.text();
};

// -------- ADMIN: QUESTIONS --------
export const adminGetQuestions = async (moduleId = null) => {
  const url = moduleId
    ? `${BASE_URL}/admin/questions/module/${moduleId}`
    : `${BASE_URL}/admin/questions`;
  const res = await fetch(url, { headers: { ...adminHeader() } });
  return res.json();
};

export const adminAddQuestion = async (question) => {
  const res = await fetch(`${BASE_URL}/admin/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeader() },
    body: JSON.stringify(question)
  });
  return res.json();
};

export const adminUpdateQuestion = async (id, question) => {
  const res = await fetch(`${BASE_URL}/admin/questions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...adminHeader() },
    body: JSON.stringify(question)
  });
  return res.json();
};

export const adminDeleteQuestion = async (id) => {
  const res = await fetch(`${BASE_URL}/admin/questions/${id}`, {
    method: "DELETE",
    headers: { ...adminHeader() }
  });
  return res.text();
};

// -------- ADMIN: USERS --------
export const adminGetUsers = async () => {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: { ...adminHeader() }
  });
  return res.json();
};

// -------- ADMIN: RESULTS --------
export const adminGetResults = async () => {
  const res = await fetch(`${BASE_URL}/admin/results`, {
    headers: { ...adminHeader() }
  });
  return res.json();
};
