import React, { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { adminApi } from '../../services/api';
import {
  History,
  ShieldAlert,
  Eye,
  Calendar,
  User,
  Activity,
  Filter,
  CheckCircle2
} from 'lucide-react';

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAuditLogs();
      setLogs(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(err?.message || 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    return true;
  });

  const getActionBadgeColor = (action) => {
    if (action.startsWith('CREATE')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.startsWith('UPDATE') || action.startsWith('CHANGE')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.startsWith('DELETE') || action.startsWith('CANCEL')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.startsWith('ADJUST')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (row) => (
        <div>
          <span className="font-mono text-xs text-slate-800 font-bold block">
            {new Date(row.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            {new Date(row.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      ),
    },
    {
      key: 'adminEmail',
      label: 'Admin',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900 text-xs">{row.adminEmail}</span>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border uppercase ${getActionBadgeColor(row.action)}`}>
          {row.action.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'targetEntity',
      label: 'Entity',
      render: (row) => (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
          {row.targetEntity}
        </span>
      ),
    },
    {
      key: 'summary',
      label: 'Summary',
      render: (row) => (
        <span className="text-slate-700 text-xs line-clamp-1 max-w-[280px]" title={row.summary}>
          {row.summary}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-500">{row.ipAddress || '127.0.0.1'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Details',
      cellClassName: 'text-right',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedLog(row)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition inline-flex items-center gap-1 text-xs font-semibold"
          title="View Event Payload"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action))).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-slate-700" /> Platform Security &amp; Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system audit trails tracking admin actions, fare alterations, seat overrides, and trip cancellations
          </p>
        </div>

        {/* Action filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold bg-white text-slate-700"
          >
            <option value="ALL">All Actions ({logs.length})</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        error={error}
        onRetry={fetchLogs}
        searchKey="summary"
        searchPlaceholder="Search audit logs..."
      />

      {/* DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Event Details"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px] font-bold">Event Action</span>
                <span className="font-bold text-slate-900">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-bold">Target Entity</span>
                <span className="font-bold text-slate-900">{selectedLog.targetEntity} {selectedLog.targetId ? `(${selectedLog.targetId})` : ''}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-bold">Initiated By</span>
                <span className="font-bold text-slate-900">{selectedLog.adminEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-bold">IP Address</span>
                <span className="font-mono text-slate-900">{selectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">Action Summary</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium">
                {selectedLog.summary}
              </p>
            </div>

            {selectedLog.diff && (
              <div>
                <span className="text-slate-500 font-bold block mb-1">Payload / State Diff</span>
                <pre className="p-3 bg-slate-950 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800">
                  {JSON.stringify(selectedLog.diff, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogPage;
