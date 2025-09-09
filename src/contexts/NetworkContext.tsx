'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Network } from '@/types/campaign';

interface NetworkContextType {
  selectedNetwork: Network | null;
  networks: Network[];
  loading: boolean;
  initialized: boolean;
  error: string | null;
  setSelectedNetwork: (network: Network | null) => void;
  refreshNetworks: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNetworks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/networks');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch networks');
      }
      
      const networksData = await response.json();
      setNetworks(networksData);

      // Try to restore from localStorage first
      const savedNetworkId = localStorage.getItem('selectedNetworkId');
      let networkToSelect: Network | null = null;

      if (savedNetworkId && networksData.length > 0) {
        networkToSelect = networksData.find((n: Network) => n.id === parseInt(savedNetworkId)) || null;
      }

      // If no saved network or saved network not found, auto-select the first active network
      if (!networkToSelect && networksData.length > 0) {
        networkToSelect = networksData.find((n: Network) => n.status === 'active') || networksData[0];
      }

      if (networkToSelect) {
        setSelectedNetwork(networkToSelect);
        localStorage.setItem('selectedNetworkId', networkToSelect.id.toString());
      }

      setInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching networks:', err);
      setInitialized(true); // Still mark as initialized even on error
    } finally {
      setLoading(false);
    }
  };

  const refreshNetworks = async () => {
    await fetchNetworks();
  };

  const handleSetSelectedNetwork = (network: Network | null) => {
    setSelectedNetwork(network);
    
    // Store in localStorage for persistence
    if (network) {
      localStorage.setItem('selectedNetworkId', network.id.toString());
    } else {
      localStorage.removeItem('selectedNetworkId');
    }
  };

  useEffect(() => {
    fetchNetworks();
  }, []);

  const value: NetworkContextType = {
    selectedNetwork,
    networks,
    loading,
    initialized,
    error,
    setSelectedNetwork: handleSetSelectedNetwork,
    refreshNetworks,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export default NetworkContext;
