import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatCard from '../components/StatCard';
import {
  CreditCard,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Eye,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentManagementPage = () => {
  const { payments, processRefund } = useAdmin();

  // Filters
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refundFilter, setRefundFilter] = useState('ALL');

  // Modals
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [refundConfirmOpen, setRefundConfirmOpen] = useState(false);
  const [txnToRefund, setTxnToRefund] = useState(null);

  // Financial summary metrics
  const totalProcessed = useMemo(() => {
    return payments
      .filter((p) => p.status === 'Success')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [payments]);

  const totalRefunded = useMemo(() => {
    return payments
      .filter((p) => p.refundStatus === 'Processed')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [payments]);

  const pendingCount = useMemo(() => {
    return payments.filter((p) => p.status === 'Pending').length;
  }, [payments]);

  // Filtered list
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (methodFilter !== 'ALL' && p.paymentMethod !== methodFilter) return false;
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (refundFilter !== 'ALL' && p.refundStatus !== refundFilter) return false;
      return true;
    });
  }, [payments, methodFilter, statusFilter, refundFilter]);

  const handleOpenRefund = (txn) => {
    setTxnToRefund(txn);
    setRefundConfirmOpen(true);
  };

  // Columns definition
  const columns = [
    {
      key: 'id',
      label: 'Transaction ID',
      render: (row) => (
        <div>
          <span className="font-mono font-black text-primary block">{row.id}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            Ref: {row.providerReference}
          </span>
        </div>
      )
    },
    {
      key: 'bookingId',
      label: 'Booking PNR',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {row.bookingId}
        </span>
      )
    },
    {
      key: 'passengerName',
      label: 'Passenger',
      render: (row) => (
        <span className="font-bold text-slate-900 text-xs block">{row.passengerName}</span>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (row) => (
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.paymentMethod}</span>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount Paid',
      render: (row) => (
        <span className="font-mono font-black text-slate-900 text-sm">
          ₹{row.amount?.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Gateway Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            row.status === 'Success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.status === 'Pending'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.status === 'Success' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          {row.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
          {row.status === 'Failed' && <XCircle className="w-3 h-3 text-rose-600" />}
          {row.status}
        </span>
      )
    },
    {
      key: 'refundStatus',
      label: 'Refund Status',
      render: (row) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
            row.refundStatus === 'Processed'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : row.refundStatus === 'Requested'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {row.refundStatus}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Timestamp',
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-500">{row.date}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedTxn(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition"
            title="View Receipt & Gateway Audit"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'Success' && row.refundStatus !== 'Processed' && (
            <button
              type="button"
              onClick={() => handleOpenRefund(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
              title="Initiate Gateway Refund"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate__animated animate__fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Payments & Financial Reconciliation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor merchant acquiring gateways, UPI settlements, card transactions, and automated refund pipelines.
        </p>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Settlements"
          value={`₹${(totalProcessed + 18450000).toLocaleString()}`}
          trend="+16.4%"
          trendType="up"
          subtitle="99.4% success rate"
          icon={DollarSign}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total Transactions"
          value={payments.length.toString()}
          subtitle="All payment channels"
          icon={Receipt}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Pending Holds"
          value={pendingCount.toString()}
          subtitle="Bank clearing queues"
          trendType="neutral"
          icon={Clock}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Total Refunded"
          value={`₹${totalRefunded.toLocaleString()}`}
          subtitle="Auto-dispatched"
          trendType="neutral"
          icon={RotateCcw}
          iconBg="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Filter Slot */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <span className="font-bold text-slate-600">Filters:</span>

        {/* Method Filter */}
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Payment Methods</option>
          <option value="UPI">UPI</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Net Banking">Net Banking</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="Success">Success</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>

        {/* Refund Status */}
        <select
          value={refundFilter}
          onChange={(e) => setRefundFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="ALL">All Refund States</option>
          <option value="None">No Refund</option>
          <option value="Requested">Refund Requested</option>
          <option value="Processed">Refund Processed</option>
        </select>

        {(methodFilter !== 'ALL' || statusFilter !== 'ALL' || refundFilter !== 'ALL') && (
          <button
            type="button"
            onClick={() => {
              setMethodFilter('ALL');
              setStatusFilter('ALL');
              setRefundFilter('ALL');
            }}
            className="text-xs font-bold text-rose-600 hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredPayments}
        searchPlaceholder="Search txn ID, PNR, passenger, reference..."
        searchKeys={['id', 'bookingId', 'passengerName', 'providerReference', 'paymentMethod']}
        exportFileName="payment_transactions_audit"
      />

      {/* VIEW RECEIPT MODAL */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Transaction Audit: ${selectedTxn.id}`}
          subtitle={`Recorded on ${selectedTxn.date}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">
                  Amount Transacted
                </span>
                <span className="text-2xl font-black text-slate-900 font-sans">
                  ₹{selectedTxn.amount}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedTxn.status === 'Success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {selectedTxn.status}
              </span>
            </div>

            <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-white">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Booking Reference PNR:</span>
                <span className="font-mono font-bold text-primary">{selectedTxn.bookingId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Paying Customer:</span>
                <span className="font-bold text-slate-800">{selectedTxn.passengerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Instrument:</span>
                <span className="font-semibold text-slate-800">{selectedTxn.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Gateway Provider Ref:</span>
                <span className="font-mono text-slate-600">{selectedTxn.providerReference}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Refund Status:</span>
                <span className="font-bold text-purple-700">{selectedTxn.refundStatus}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {selectedTxn.status === 'Success' && selectedTxn.refundStatus !== 'Processed' && (
                <button
                  type="button"
                  onClick={() => {
                    const t = selectedTxn;
                    setSelectedTxn(null);
                    handleOpenRefund(t);
                  }}
                  className="px-4 py-2 text-xs font-bold text-purple-600 hover:bg-purple-50 border border-purple-200 rounded-xl transition"
                >
                  Initiate Refund
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REFUND CONFIRMATION */}
      <ConfirmDialog
        isOpen={refundConfirmOpen}
        onClose={() => setRefundConfirmOpen(false)}
        onConfirm={() => {
          if (txnToRefund) {
            processRefund(txnToRefund.id);
            setTxnToRefund(null);
          }
        }}
        title="Execute Payment Refund"
        message={`Are you sure you want to credit ₹${txnToRefund?.amount} back to ${txnToRefund?.passengerName} via ${txnToRefund?.paymentMethod}? This action will credit their originating payment account.`}
        confirmText="Confirm Refund"
        type="warning"
      />
    </div>
  );
};

export default PaymentManagementPage;
