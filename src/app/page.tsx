'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { useWallet } from './context/WalletContext';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <OnboardingFlow />
    </div>
  );
}
