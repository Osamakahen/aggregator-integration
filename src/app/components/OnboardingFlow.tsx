import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';

interface Step {
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

export const OnboardingFlow: React.FC = () => {
  const { connectWallet, connectionStatus, error } = useWallet();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: 'Connect Wallet',
      description: 'Connect your FreoWallet to get started',
      status: connectionStatus === 'connected' ? 'completed' : connectionStatus === 'error' ? 'error' : currentStep === 0 ? 'current' : 'pending'
    },
    {
      title: 'Create Account',
      description: 'Set up your secure wallet account',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending'
    },
    {
      title: 'Secure Your Wallet',
      description: 'Set up your recovery phrase and password',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending'
    },
    {
      title: 'Ready to Go',
      description: 'Your wallet is ready to use',
      status: currentStep === 3 ? 'current' : 'pending'
    }
  ];

  const handleConnect = async () => {
    try {
      await connectWallet();
      if (connectionStatus === 'connected') {
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to FreoWallet</h1>
          <p className="mt-2 text-gray-600">Let's get your wallet set up</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`p-4 rounded-lg border ${
                step.status === 'current'
                  ? 'border-blue-500 bg-blue-50'
                  : step.status === 'completed'
                  ? 'border-green-500 bg-green-50'
                  : step.status === 'error'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : step.status === 'error'
                      ? 'bg-red-500 text-white'
                      : step.status === 'current'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentStep === 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={handleConnect}
              disabled={connectionStatus === 'connecting'}
              className={`px-6 py-3 rounded-lg text-white font-medium ${
                connectionStatus === 'connecting'
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
            </button>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 