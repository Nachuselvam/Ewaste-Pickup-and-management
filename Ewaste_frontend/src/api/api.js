// src/api/api.js
import axios from "axios";

// ----------------- AUTH API INSTANCE -----------------
const AUTH_API = axios.create({
  baseURL: "http://localhost:8080/api/auth",
  headers: { "Content-Type": "application/json" },
});

// ----------------- GENERAL API INSTANCE -----------------
const API = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
  auth: {
    username: "admin@gmail.com",
    password: "admin123",
  },
});

// ----------------- LOGIN USER -----------------
export const loginUser = async (email, password) => {
  try {
    const res = await AUTH_API.post("/login", { email, password });
    return res.data;
  } catch (err) {
    console.error("Login API error:", err);
    return { message: err.response?.data?.message || "❌ Login failed." };
  }
};

// ----------------- LOGIN PICKUP PERSONNEL -----------------
export const loginPickupPersonnel = async (email, password) => {
  const data = await loginUser(email, password);
  const role = data.user?.role || (data.roles ? data.roles[0] : "");
  if (role.toUpperCase() !== "PICKUP") {
    return { message: "❌ You are not authorized as Pickup Personnel." };
  }
  return data;
};

// ----------------- REGISTER USER -----------------
export const registerUser = async (userData) => {
  try {
    const res = await AUTH_API.post("/register", userData);
    return res.data;
  } catch (err) {
    console.error("Registration API error:", err);
    return { message: err.response?.data?.message || "❌ Registration failed." };
  }
};

// ----------------- FETCH USER REQUESTS -----------------
export const fetchUserRequests = async (user) => {
  if (!user) return [];
  try {
    const res = await axios.get(`http://localhost:8080/api/ewaste/user/${user.id}`, {
      auth: {
        username: user.email,
        password: user.password,
      },
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Error fetching requests:", err);
    return [];
  }
};

// ----------------- FETCH ALL EWASTE REQUESTS (ADMIN) -----------------
export const fetchAllRequests = async () => {
  try {
    const res = await API.get("/ewaste/admin/all");
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Fetch all requests (admin) error:", err.response || err.message);
    return [];
  }
};

// ----------------- FETCH REQUESTS BY STATUS (ADMIN) -----------------
export const fetchRequestsByStatus = async (status) => {
  try {
    const res = await API.get(`/ewaste/admin/status/${status}`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error(`Fetch requests by status (${status}) error:`, err.response || err.message);
    return [];
  }
};

// ----------------- APPROVE REQUEST (ADMIN) -----------------
export const approveRequest = async (requestId, allocatedRange) => {
  if (!allocatedRange) {
    return { message: "❌ allocatedRange is required." };
  }

  try {
    const res = await API.put(`/ewaste/${requestId}/approve`, { allocatedRange });
    return res.data;
  } catch (err) {
    console.error(`Approve request ${requestId} error:`, err.response || err.message);
    return { message: err.response?.data || "❌ Failed to approve request." };
  }
};

// ----------------- REJECT REQUEST (ADMIN) -----------------
export const rejectRequest = async (requestId, reason) => {
  try {
    const res = await API.put(`/ewaste/${requestId}/reject`, { reason });
    return res.data;
  } catch (err) {
    console.error(`Reject request ${requestId} error:`, err.response || err.message);
    return { message: err.response?.data || "❌ Failed to reject request." };
  }
};

// ----------------- SCHEDULE PICKUP (ADMIN) -----------------
export const schedulePickup = async (requestId, payload) => {
  try {
    // payload: { pickupDateTime, pickupPersonnelId, pickupPersonnelName, pickupPersonnelEmail }
    const res = await API.put(`/ewaste/${requestId}/schedule`, payload);
    return res.data;
  } catch (err) {
    console.error("Schedule pickup error:", err.response || err.message);
    return { message: err.response?.data || "❌ Failed to schedule pickup." };
  }
};

// ----------------- ADD PICKUP PERSONNEL -----------------
export const addPickupPersonnel = async (personnelData) => {
  try {
    const res = await API.post("/pickup-personnels", personnelData);
    return res.data;
  } catch (err) {
    console.error("Add Pickup Personnel error:", err);
    return { message: err.response?.data?.message || "❌ Failed to add pickup personnel." };
  }
};

// ----------------- FETCH ALL PICKUP PERSONNEL -----------------
export const fetchPickupPersonnels = async () => {
  try {
    const res = await API.get("/pickup-personnels");
    if (!Array.isArray(res.data)) return [];
    return res.data.filter((u) => u.role && u.role.toUpperCase() === "PICKUP");
  } catch (err) {
    console.error("Fetch Pickup Personnels error:", err);
    return [];
  }
};

// ----------------- FETCH ASSIGNED REQUESTS FOR PICKUP PERSONNEL -----------------
export const fetchAssignedRequests = async (personnelId) => {
  try {
    if (!personnelId) return [];
    const res = await API.get("/ewaste/pickup-requests", {
      params: { personnelId },
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Fetch assigned requests error:", err);
    return [];
  }
};

// ----------------- PICKUP PERSON: ACCEPT PICKUP -----------------
export const acceptPickupRequest = async (requestId) => {
  try {
    const res = await API.put(`/ewaste/${requestId}/pickup-response`, {
      response: "ACCEPT",
    });
    return res.data;
  } catch (err) {
    console.error("Accept pickup error:", err.response || err.message);
    return { message: err.response?.data || "❌ Failed to accept pickup." };
  }
};

// ----------------- PICKUP PERSON: REJECT PICKUP -----------------
export const rejectPickupRequest = async (requestId) => {
  try {
    const res = await API.put(`/ewaste/${requestId}/pickup-response`, {
      response: "REJECT",
    });
    return res.data;
  } catch (err) {
    console.error("Reject pickup error:", err.response || err.message);
    return { message: err.response?.data || "❌ Failed to reject pickup." };
  }
};

// ----------------- PICKUP PERSON: MARK REQUEST AS OTP REQUESTED -----------------
export const markRequestOtpRequested = async (requestId) => {
  try {
    const res = await API.put(`/ewaste/${requestId}/request-completion`);
    return res.data;
  } catch (err) {
    console.error(`Error marking request ${requestId} as OTP requested:`, err);
    return { message: err.response?.data?.message || "❌ Failed to mark request as OTP requested." };
  }
};

// ----------------- USER: VERIFY OTP AND COMPLETE REQUEST -----------------
export const verifyOtpAndComplete = async (requestId, otp, amount) => {
  try {
    const res = await API.put(`/ewaste/${requestId}/complete`, { otp, amount });
    return res.data;
  } catch (err) {
    console.error(`Error verifying OTP for request ${requestId}:`, err);
    return { message: err.response?.data?.message || "❌ Failed to verify OTP." };
  }
};

// ----------------- SUBMIT EWASTE REQUEST (MULTIPART) -----------------
export const submitEwasteRequest = async (formData, user) => {
  try {
    const data = new FormData();

    data.append("userId", user.id);
    data.append("userEmail", user.email);
    data.append("userName", user.name);

    data.append("deviceType", formData.deviceType);
    data.append("brand", formData.brand);
    data.append("model", formData.model);
    data.append("deviceCondition", formData.deviceCondition);
    data.append("pickupAddress", formData.pickupAddress);
    data.append("qty", formData.qty);

    if (formData.remarks) data.append("remarks", formData.remarks);

    if (user.images && user.images.length > 0) {
      user.images.forEach((file) => data.append("images", file));
    }

    const res = await API.post("/ewaste/submit", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return { success: true, data: res.data };
  } catch (err) {
    console.error("Submit Ewaste Request error:", err.response || err.message);
    return { success: false, message: err.response?.data || "❌ Failed to submit request." };
  }
};

// ----------------- CHATBOT -----------------
export const askChatbot = async (question) => {
  try {
    const res = await API.post("/chatbot", { question });
    return res.data.answer;
  } catch (err) {
    console.error("Chatbot API error:", err.response || err.message);
    return "❌ Failed to contact chatbot.";
  }
};

// ----------------- USER TRANSACTIONS -----------------
export const fetchUserTransactions = async (userId) => {
  try {
    if (!userId) return [];
    const res = await API.get(`/users/${userId}/transactions`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("Fetch user transactions error:", err.response || err.message);
    return [];
  }
};

// ----------------- WALLET -----------------
export const fetchWalletBalance = async (userId) => {
  try {
    const res = await API.get(`/users/${userId}/wallet`);
    return res.data;
  } catch (err) {
    console.error("Fetch wallet balance error:", err.response || err.message);
    throw err;
  }
};

// ----------------- EXPORT DEFAULT API INSTANCE -----------------
export default API;
