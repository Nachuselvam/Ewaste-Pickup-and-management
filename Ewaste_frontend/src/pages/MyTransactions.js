// src/pages/MyTransactions.jsx
import React, { useEffect, useState } from "react";
import { fetchUserTransactions, fetchWalletBalance } from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";

const MyTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        const walletRes = await fetchWalletBalance(userId);
        setBalance(walletRes?.balance || 0);

        const txs = await fetchUserTransactions(userId);
        setTransactions(txs);
      } catch (err) {
        console.error("Error loading transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  if (!userId) {
    return <p>⚠️ Please login to view transactions.</p>;
  }

  if (loading) {
    return <p>⏳ Loading your transactions...</p>;
  }

  return (
    <div className="request-status-page">
      <div className="overlay">
        <h2>💰 My Wallet</h2>
        <h3 style={{ marginBottom: "20px" }}>Current Balance: ₹ {balance}</h3>

        {transactions.length === 0 ? (
          <p>📭 No transactions found.</p>
        ) : (
          <div className="table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Request ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={tx.id}>
                    <td>{index + 1}</td>
                    <td>{tx.requestId}</td>
                    <td
                      style={{
                        color: tx.type === "CREDIT" ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {tx.type}
                    </td>
                    <td>₹ {tx.amount}</td>
                    <td>{tx.status}</td>
                    <td>
                      {tx.createdAt
                        ? new Date(tx.createdAt).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className="back-btn" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>
      </div>
    </div>
  );
};

export default MyTransactions;
