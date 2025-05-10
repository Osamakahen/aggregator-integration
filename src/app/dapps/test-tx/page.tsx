"use client";
import React, { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../../context/WalletContext";

export default function TestTxPage() {
  const { account, isConnected } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<null | string>(null);

  const sendTx = async () => {
    setStatus("pending");
    try {
      if (!window.ethereum) throw new Error("No wallet detected");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      setStatus("success");
    } catch (err: any) {
      setStatus("error: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Send Test Transaction (Sepolia)</h1>
      <input
        className="mb-2 p-2 rounded w-full"
        placeholder="Recipient Address"
        value={to}
        onChange={e => setTo(e.target.value)}
      />
      <input
        className="mb-2 p-2 rounded w-full"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        type="number"
      />
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={sendTx}
        disabled={status === "pending"}
      >
        {status === "pending" ? "Sending..." : "Send"}
      </button>
      {status && <div className="mt-2">{status}</div>}
    </div>
  );
} 