import React, { useState } from 'react';
import { IconTrendingUp, IconCalendar, IconCheckCircle } from '../icons';
import api from '../../services/api';

interface ReportData {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  transactions: any[];
  summary: {
    donations: number;
    withdrawals: number;
    transfers: number;
  };
}

const ReportsManagement: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    account_id: '',
  });
  const [emailModal, setEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const generateReport = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      if (filters.account_id) params.account_id = filters.account_id;

      const response = await api.reports.getFinance(params);
      if (response.success && response.data) {
        setReportData(response.data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const params: Record<string, string> = {};
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      if (filters.account_id) params.account_id = filters.account_id;

      const response = await api.reports.downloadPDF(params);
      if (response.success) {
        // Handle PDF download
        alert('PDF download initiated');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const sendEmail = async () => {
    try {
      setLoading(true);
      const response = await api.reports.emailReport({
        email: emailAddress,
        from_date: filters.from_date,
        to_date: filters.to_date,
      });

      if (response.success) {
        alert('Report sent successfully!');
        setEmailModal(false);
        setEmailAddress('');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <IconTrendingUp className="w-8 h-8 text-blue-600" />
          Financial Reports
        </h2>
        <p className="text-gray-600 mt-1">Generate and export financial reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <IconCalendar className="w-4 h-4 inline mr-1" />
              From Date
            </label>
            <input
              type="date"
              value={filters.from_date}
              onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <IconCalendar className="w-4 h-4 inline mr-1" />
              To Date
            </label>
            <input
              type="date"
              value={filters.to_date}
              onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
              <p className="text-green-700 font-semibold mb-2">Total Income</p>
              <p className="text-4xl font-extrabold text-green-800">
                KES {reportData.total_income.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-xl p-6 border-2 border-red-200">
              <p className="text-red-700 font-semibold mb-2">Total Expenses</p>
              <p className="text-4xl font-extrabold text-red-800">
                KES {reportData.total_expenses.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border-2 border-blue-200">
              <p className="text-blue-700 font-semibold mb-2">Net Balance</p>
              <p className="text-4xl font-extrabold text-blue-800">
                KES {reportData.net_balance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Category Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-blue-700 font-semibold mb-1">Donations</p>
                <p className="text-3xl font-bold text-blue-800">
                  KES {reportData.summary.donations.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                <p className="text-red-700 font-semibold mb-1">Withdrawals</p>
                <p className="text-3xl font-bold text-red-800">
                  KES {reportData.summary.withdrawals.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <p className="text-purple-700 font-semibold mb-1">Transfers</p>
                <p className="text-3xl font-bold text-purple-800">
                  KES {reportData.summary.transfers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Export Options</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={downloadPDF}
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-red-700 hover:to-pink-700 shadow-lg transform hover:scale-105 transition-all"
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => setEmailModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all"
              >
                📧 Email Report
              </button>
              <button
                onClick={() => {
                  const csv = 'data:text/csv;charset=utf-8,' + encodeURIComponent('Report Data');
                  const link = document.createElement('a');
                  link.href = csv;
                  link.download = 'report.csv';
                  link.click();
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:scale-105 transition-all"
              >
                📊 Export CSV
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <IconTrendingUp className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-semibold">No Report Generated</p>
          <p className="text-gray-500 mt-2">Select date range and click Generate Report</p>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Email Report</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setEmailModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  disabled={!emailAddress || loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
