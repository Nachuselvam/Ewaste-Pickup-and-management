// PaymentSuccess.jsx
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const called = useRef(false);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("Processing your payment...");
  const navigate = useNavigate();

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const sessionId = params.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setMessage("❌ Invalid payment session.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await API.get(`/payment/verify-session?sessionId=${sessionId}`);
        console.log("Payment verification response:", response.data);

        setStatus("success");
        setMessage("✅ Payment verified successfully!");

        setTimeout(() => navigate("/dashboard"), 3000);
      } catch (error) {
        console.error("Payment verification failed:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "❌ Payment verification failed. Please contact support."
        );
      }
    };

    verifyPayment();
  }, [params, navigate]);

  const subText =
    status === "loading"
      ? "Please wait..."
      : status === "success"
      ? "You will be redirected shortly..."
      : "Please try again or contact support.";

  const textColor = status === "success" ? "green" : status === "error" ? "red" : "black";

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h2 style={{ color: textColor, marginBottom: "1rem" }}>{message}</h2>
      <p style={{ fontSize: "1rem", color: "#555" }}>{subText}</p>
    </div>
  );
}