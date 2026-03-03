// RedeemWallet.jsx
import { useState } from "react";
import API from "../api/api";

const RedeemWallet = ({ user }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      // ✅ Call backend to create checkout session
      const res = await API.post("/payment/create-checkout-session", {
        userId: user.id,
        amount: parseFloat(amount),
      });

      // ✅ Redirect user to Stripe checkout page
      window.location.href = res.data.checkoutUrl;

    } catch (err) {
      console.error("Redeem Error:", err.response || err);
      alert(
        err.response?.data?.message ||
        "Payment failed. Please try again."
      );
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "30px", maxWidth: "400px", margin: "auto" }}>
      <h2>Redeem Wallet</h2>

      <input
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ padding: "8px", width: "100%", marginTop: "10px" }}
      />

      <button
        onClick={handleRedeem}
        disabled={loading}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          width: "100%",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Processing..." : "Redeem"}
      </button>
    </div>
  );
};

export default RedeemWallet;