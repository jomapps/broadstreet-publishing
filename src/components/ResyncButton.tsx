'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResyncButtonProps {
  onResync?: () => Promise<void>;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showLastSync?: boolean;
}

interface SyncStatus {
  isActive: boolean;
  lastSync?: Date;
  error?: string;
}

export default function ResyncButton({
  onResync,
  className,
  variant = 'outline',
  size = 'md',
  showLastSync = true
}: ResyncButtonProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isActive: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch sync status on component mount
  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync/status');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus({
          isActive: data.isActive || false,
          lastSync: data.lastSync ? new Date(data.lastSync) : undefined,
          error: data.error
        });
      }
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const handleResync = async () => {
    if (isLoading || syncStatus.isActive) return;

    setIsLoading(true);
    setSyncStatus(prev => ({ ...prev, error: undefined }));

    try {
      if (onResync) {
        // Use custom resync handler if provided
        await onResync();
      } else {
        // Default API call
        const response = await fetch('/api/sync/trigger', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type: 'full' })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Sync failed');
        }
      }

      // Refresh sync status after successful trigger
      await fetchSyncStatus();
      
      // Show success state briefly
      setTimeout(() => {
        fetchSyncStatus();
      }, 2000);

    } catch (error) {
      console.error('Resync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sync failed'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSyncIcon = () => {
    if (isLoading || syncStatus.isActive) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (syncStatus.error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (syncStatus.lastSync) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <RefreshCw className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isLoading) return 'Syncing...';
    if (syncStatus.isActive) return 'Sync Active';
    if (syncStatus.error) return 'Retry Sync';
    return 'ReSync';
  };

  const isDisabled = isLoading || syncStatus.isActive;

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      <Button
        onClick={handleResync}
        disabled={isDisabled}
        variant={syncStatus.error ? 'destructive' : variant}
        size={size}
        className={cn(
          'flex items-center gap-2',
          syncStatus.error && 'border-red-200 text-red-700 hover:bg-red-50'
        )}
      >
        {getSyncIcon()}
        {getButtonText()}
      </Button>
      
      {showLastSync && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {syncStatus.lastSync ? (
            <span>Last sync: {formatLastSync(syncStatus.lastSync)}</span>
          ) : (
            <span>Never synced</span>
          )}
        </div>
      )}
      
      {syncStatus.error && (
        <div className="text-xs text-red-600 max-w-xs truncate" title={syncStatus.error}>
          Error: {syncStatus.error}
        </div>
      )}
    </div>
  );
}

// Compact version for toolbar/header use
export function CompactResyncButton({
  onResync,
  className
}: Pick<ResyncButtonProps, 'onResync' | 'className'>) {
  return (
    <ResyncButton
      onResync={onResync}
      className={className}
      variant="outline"
      size="sm"
      showLastSync={false}
    />
  );
}

// Full-width version for dashboard cards
export function DashboardResyncButton({
  onResync,
  className
}: Pick<ResyncButtonProps, 'onResync' | 'className'>) {
  return (
    <ResyncButton
      onResync={onResync}
      className={cn('w-full', className)}
      variant="default"
      size="md"
      showLastSync={true}
    />
  );
}