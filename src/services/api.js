// const BASE_URL = "https://dac-pro-backend.onrender.com/api";
const BASE_URL = "http://localhost:8282/api";

/* ======================================================
   TOKEN HELPERS
====================================================== */

const getToken = () => {
    return sessionStorage.getItem("token");
};

const authHeader = () => {
    const token = getToken();

    return token
        ? {
              Authorization: `Bearer ${token}`
          }
        : {};
};


/* ======================================================
   AUTH
====================================================== */

/*
 * REGISTER
 */
export const registerUser = async (data) => {

    const response = await fetch(
        `${BASE_URL}/auth/register`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Registration failed"
        );
    }

    return result;
};


/*
 * LOGIN
 */
export const loginUser = async (data) => {

    const response = await fetch(
        `${BASE_URL}/auth/login`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Login failed"
        );
    }

    /*
     * Our backend LoginResponse is:
     *
     * {
     *   token,
     *   userId,
     *   fullName,
     *   email,
     *   role
     * }
     *
     * So we create the user object here
     * for the existing frontend.
     */

    const user = {
        userId: result.userId,
        fullName: result.fullName,
        email: result.email,
        role: result.role
    };

    sessionStorage.setItem(
        "token",
        result.token
    );

    sessionStorage.setItem(
        "user",
        JSON.stringify(user)
    );

    return {
        ...result,
        user
    };
};


/*
 * GOOGLE LOGIN
 */
export const googleLogin = async (user) => {

    const response = await fetch(
        `${BASE_URL}/auth/google`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Google login failed"
        );
    }

    const loggedInUser = {
        userId: result.userId,
        fullName: result.fullName,
        email: result.email,
        role: result.role
    };

    sessionStorage.setItem(
        "token",
        result.token
    );

    sessionStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
    );

    return {
        ...result,
        user: loggedInUser
    };
};


/* ======================================================
   MODULES
====================================================== */

export const getModules = async () => {

    const response = await fetch(
        `${BASE_URL}/modules`,
        {
            headers: {
                ...authHeader()
            }
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to load modules"
        );
    }

    return result;
};


/* ======================================================
   QUIZ
====================================================== */

export const getQuestions = async (moduleId) => {

    const response = await fetch(
        `${BASE_URL}/quiz/${moduleId}`,
        {
            headers: {
                ...authHeader()
            }
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to load questions"
        );
    }

    return result;
};


/* ======================================================
   RESULT
====================================================== */

export const saveResult = async (result) => {

    const response = await fetch(
        `${BASE_URL}/result`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                ...authHeader()
            },

            body: JSON.stringify({
                /*
                 * Backend gets the authenticated user
                 * from JWT, so userId is not trusted.
                 *
                 * Keeping it here is okay for compatibility
                 * with your existing frontend.
                 */
                userId: result.userId,

                moduleId: result.moduleId,

                score: result.score,

                attempted: result.attempted,

                unattempted: result.unattempted,

                testType: result.testType,

                mockNo:
                    result.testType === "Mock"
                        ? result.mockNo
                        : null
            })
        }
    );

    const text = await response.text();

    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null;
    }

    if (!response.ok) {

        throw new Error(
            data?.message ||
            text ||
            "Failed to save result"
        );
    }

    return data;
};


/*
 * GET ATTEMPT SUMMARY
 */
export const getAttemptSummary = async (userId) => {

    const response = await fetch(
        `${BASE_URL}/result/attempts/${userId}`,
        {
            headers: {
                ...authHeader()
            }
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to load attempts"
        );
    }

    return result;
};


/*
 * GET LATEST RESULT / DASHBOARD
 */
export const getLatestResultStats = async (userId) => {

    try {

        const response = await fetch(
            `${BASE_URL}/result/latest/${userId}`,
            {
                headers: {
                    ...authHeader()
                }
            }
        );

        const text = await response.text();

        let result = null;

        try {
            result = text ? JSON.parse(text) : null;
        } catch {
            result = null;
        }

        if (!response.ok) {
            throw new Error(
                result?.message ||
                "Failed to load dashboard"
            );
        }

        return result;

    } catch (error) {

        console.error(
            "Dashboard API error:",
            error
        );

        return {
            moduleName: "N/A",
            score: 0,
            attempted: 0,
            unattempted: 0,
            totalTests: 0,
            practiceTests: 0,
            mockTests: 0,
            bestScore: 0
        };
    }
};


/* ======================================================
   MOCK
====================================================== */

export const getMockQuestions = async (
    moduleId,
    mockNumber
) => {

    const response = await fetch(
        `${BASE_URL}/mock/${moduleId}/${mockNumber}`,
        {
            headers: {
                ...authHeader()
            }
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to load mock test"
        );
    }

    return result;
};


/*
 * CHECK MOCK ATTEMPT
 *
 * NOTE:
 * This endpoint must exist in the backend.
 * We haven't added it to the new ResultController yet.
 */
export const checkMockAttempt = async (
    userId,
    moduleId,
    mockNo
) => {

    const response = await fetch(
        `${BASE_URL}/result/check-mock?userId=${userId}&moduleId=${moduleId}&mockNo=${mockNo}`,
        {
            headers: {
                ...authHeader()
            }
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to check mock attempt"
        );
    }

    return result;
};


/* ======================================================
   ADMIN APIs
====================================================== */


/*
 * ADMIN MODULES
 */
export const adminGetModules = async () => {

    const response = await fetch(
        `${BASE_URL}/admin/modules`,
        {
            headers: {
                ...authHeader()
            }
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to load admin modules"
        );
    }

    return result;
};


export const adminAddModule = async (module) => {

    const response = await fetch(
        `${BASE_URL}/admin/modules`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                ...authHeader()
            },

            body: JSON.stringify(module)
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to add module"
        );
    }

    return result;
};


export const adminUpdateModule = async (
    id,
    module
) => {

    const response = await fetch(
        `${BASE_URL}/admin/modules/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                ...authHeader()
            },

            body: JSON.stringify(module)
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to update module"
        );
    }

    return result;
};


export const adminDeleteModule = async (id) => {

    const response = await fetch(
        `${BASE_URL}/admin/modules/${id}`,
        {
            method: "DELETE",

            headers: {
                ...authHeader()
            }
        }
    );

    const text = await response.text();

    if (!response.ok) {

        throw new Error(
            text ||
            "Failed to delete module"
        );
    }

    return text;
};


/* ======================================================
   ADMIN QUESTIONS
====================================================== */

export const adminGetQuestions = async (
    moduleId = null
) => {

    const url = moduleId
        ? `${BASE_URL}/admin/questions/module/${moduleId}`
        : `${BASE_URL}/admin/questions`;

    const response = await fetch(
        url,
        {
            headers: {
                ...authHeader()
            }
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to load admin questions"
        );
    }

    return result;
};


export const adminAddQuestion = async (
    question
) => {

    const response = await fetch(
        `${BASE_URL}/admin/questions`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                ...authHeader()
            },

            body: JSON.stringify(question)
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to add question"
        );
    }

    return result;
};


export const adminUpdateQuestion = async (
    id,
    question
) => {

    const response = await fetch(
        `${BASE_URL}/admin/questions/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                ...authHeader()
            },

            body: JSON.stringify(question)
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to update question"
        );
    }

    return result;
};


export const adminDeleteQuestion = async (
    id
) => {

    const response = await fetch(
        `${BASE_URL}/admin/questions/${id}`,
        {
            method: "DELETE",

            headers: {
                ...authHeader()
            }
        }
    );

    const text = await response.text();

    if (!response.ok) {

        throw new Error(
            text ||
            "Failed to delete question"
        );
    }

    return text;
};


/* ======================================================
   ADMIN USERS
====================================================== */

export const adminGetUsers = async () => {

    const response = await fetch(
        `${BASE_URL}/admin/users`,
        {
            headers: {
                ...authHeader()
            }
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to load users"
        );
    }

    return result;
};


/* ======================================================
   ADMIN RESULTS
====================================================== */

export const adminGetResults = async () => {

    const response = await fetch(
        `${BASE_URL}/admin/results`,
        {
            headers: {
                ...authHeader()
            }
        }
    );

    const text = await response.text();

    let result = null;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        result = null;
    }

    if (!response.ok) {

        throw new Error(
            result?.message ||
            "Failed to load results"
        );
    }

    return result;
};