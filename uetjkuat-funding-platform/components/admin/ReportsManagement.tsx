import React, { useState } from 'react';
import { TrendingUp, Calendar, CheckCircle2, FileText, Mail, Download, X } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Financial Reports
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Generate and export financial reports</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1.5 text-muted-foreground" />
              From Date
            </label>
            <input
              type="date"
              value={filters.from_date}
              onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1.5 text-muted-foreground" />
              To Date
            </label>
            <input
              type="date"
              value={filters.to_date}
              onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Income</p>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                KES {reportData.total_income.toLocaleString()}
              </p>
            </div>

            <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Expenses</p>
                <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                KES {reportData.total_expenses.toLocaleString()}
              </p>
            </div>

            <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Balance</p>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                KES {reportData.net_balance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Category Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Donations</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  KES {reportData.summary.donations.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50/50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-800">
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Withdrawals</p>
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                  KES {reportData.summary.withdrawals.toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Transfers</p>
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  KES {reportData.summary.transfers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Export Options</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={downloadPDF}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </button>
              <button
                onClick={() => setEmailModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Report
              </button>
              <button
                onClick={() => {
                  const csv = 'data:text/csv;charset=utf-8,' + encodeURIComponent('Report Data');
                  const link = document.createElement('a');
                  link.href = csv;
                  link.download = 'report.csv';
                  link.click();
                }}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <div className="bg-card rounded-xl shadow-sm p-12 text-center border border-border">
          <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-lg text-foreground font-semibold">No Report Generated</p>
          <p className="text-muted-foreground mt-2">Select date range and click Generate Report</p>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-6 border border-border relative">
            <button
              onClick={() => setEmailModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground mb-6">Email Report</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm"
                  placeholder="email@example.com"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEmailModal(false)}
                  className="flex-1 px-4 py-2 border border-input rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  disabled={!emailAddress || loading}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
