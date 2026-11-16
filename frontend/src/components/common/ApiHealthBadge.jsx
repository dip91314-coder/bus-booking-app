import React, { useState, useEffect } from 'react';
import { healthApi } from '../../services/api';

const ApiHealthBadge = ({ showVersion = true, className = '' }) => {
  const [health, setHealth] = useState({
    status: 'checking',
    mongo: 'unknown',
    redis: 'unknown',
  });

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const res = await healthApi.getHealth();
        if (!active) return;
        if (res?.status === 'healthy' || res?.status === 'ok') {
          const isDegraded = res.redis === 'disconnected';
          setHealth({
            status: isDegraded ? 'degraded' : 'online',
            mongo: res.mongo,
            redis: res.redis,
          });
        } else {
          setHealth({ status: 'degraded', mongo: res?.mongo, redis: res?.redis });
        }
      } catch (err) {
        if (!active) return;
        setHealth({ status: 'offline', mongo: 'disconnected', redis: 'disconnected' });
      }
    };

    check();
    const interval = setInterval(check, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const badgeConfig = {
    online: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bgDot: 'bg-emerald-500',
      label: 'API Server Online',
    },
    degraded: {
      color: 'text-amber-600 dark:text-amber-400',
      bgDot: 'bg-amber-500 animate-pulse',
      label: 'API Server Degraded',
    },
    offline: {
      color: 'text-rose-600 dark:text-rose-400',
      bgDot: 'bg-rose-500',
      label: 'API Server Offline',
    },
    checking: {
      color: 'text-slate-500 dark:text-slate-400',
      bgDot: 'bg-slate-400',
      label: 'Checking API…',
    },
  }[health.status] || {
    color: 'text-slate-500',
    bgDot: 'bg-slate-400',
    label: 'API Server',
  };

  return (
    <div className={`flex items-center gap-3 text-[11px] ${className}`}>
      <span className={`flex items-center gap-1.5 font-semibold ${badgeConfig.color}`}>
        <span className={`w-2 h-2 rounded-full ${badgeConfig.bgDot}`} />
        <span>{badgeConfig.label}</span>
      </span>
      {showVersion && (
        <>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-mono text-slate-400">v1.0.0</span>
        </>
      )}
    </div>
  );
};

export default ApiHealthBadge;
