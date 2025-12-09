import React, { useState, useEffect } from 'react';
import { Link2, Plus, Copy, Trash2, Loader2, CheckCircle, AlertCircle, ExternalLink, Share2, Users } from 'lucide-react';
import api from '../services/api';

interface RechargeToken {
  id: number;
  token: string;
  url: string;
  target_amount?: number;
  collected_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  reason?: string;
  status: string;
  is_valid: boolean;
  expires_at: string;
  contributions: Array<{
    id: number;
    donor_name: string;
    amount: number;
    status: string;
    created_at: string;
  }>;
  created_at: string;
}

const RechargeTokens: React.FC = () => {
  const [tokens, setTokens] = useState<RechargeToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetAmount, setTargetAmount] = useState('');
  const [reason, setReason] = useState('');
  const [expiryDays, setExpiryDays] = useState('30');
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedToken, setExpandedToken] = useState<number | null>(null);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/recharge-tokens');
      if (response.data.success && response.data.data) {
        setTokens(response.data.data as RechargeToken[]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const response = await api.post('/v1/recharge-tokens', {
        target_amount: targetAmount ? parseFloat(targetAmount) : undefined,
        reason: reason.trim() || undefined,
        expiry_days: parseInt(expiryDays),
      });

      if (response.data.success) {
        fetchTokens();
        setShowCreateModal(false);
        setTargetAmount('');
        setReason('');
        setExpiryDays('30');
      } else {
        setError(response.data.error || 'Failed to create recharge link');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create recharge link');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async (token: RechargeToken) => {
    try {
      await navigator.clipboard.writeText(token.url);
      setCopiedId(token.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (token: RechargeToken) => {
    const shareData = {
      title: 'Send me money',
      text: token.reason || 'Recharge my account',
      url: token.url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopyLink(token);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleCancel = async (tokenId: number) => {
    if (!confirm('Are you sure you want to cancel this recharge link?')) return;

    try {
      const response = await api.post(`/v1/recharge-tokens/${tokenId}/cancel`);
      if (response.data.success) {
        fetchTokens();
      } else {
        setError(response.data.error || 'Failed to cancel link');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel link');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (token: RechargeToken) => {
    if (token.status === 'completed') {
      return (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    }
    if (token.status === 'cancelled') {
      return (
        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
          Cancelled
        </span>
      );
    }
    if (!token.is_valid) {
      return (
        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full">
          Expired
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Recharge Links</h2>
          <p className="text-sm text-muted-foreground">Create shareable links to receive money</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Link
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-destructive/70 hover:text-destructive">×</button>
        </div>
      )}

      {/* Tokens List */}
      {tokens.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Link2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Recharge Links</h3>
          <p className="text-muted-foreground mb-4">Create a recharge link to receive money from anyone.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-primary hover:underline"
          >
            Create your first link
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.map(token => (
            <div
              key={token.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(token)}
                      {token.contributions.length > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {token.contributions.filter(c => c.status === 'completed').length} contributions
                        </span>
                      )}
                    </div>
                    {token.reason && (
                      <p className="text-sm font-medium text-foreground mb-1">{token.reason}</p>
                    )}
                    <p className="text-xs text-muted-foreground mb-3">
                      Created {formatDate(token.created_at)} • Expires {formatDate(token.expires_at)}
                    </p>

                    {/* Progress (if target set) */}
                    {token.target_amount && token.target_amount > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            KES {token.collected_amount.toLocaleString()} / {token.target_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${token.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Collected amount (if no target) */}
                    {(!token.target_amount || token.target_amount === 0) && token.collected_amount > 0 && (
                      <p className="text-sm font-medium text-foreground mb-3">
                        Collected: KES {token.collected_amount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {token.is_valid && token.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleCopyLink(token)}
                          className="p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          title="Copy link"
                        >
                          {copiedId === token.id ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleShare(token)}
                          className="p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <a
                          href={token.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          title="Open link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleCancel(token.id)}
                          className="p-2 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                          title="Cancel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expandable contributions */}
                {token.contributions.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedToken(expandedToken === token.id ? null : token.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      {expandedToken === token.id ? 'Hide' : 'View'} contributions ({token.contributions.length})
                    </button>
                    {expandedToken === token.id && (
                      <div className="mt-3 space-y-2">
                        {token.contributions.map(contribution => (
                          <div
                            key={contribution.id}
                            className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2"
                          >
                            <div>
                              <span className="font-medium">{contribution.donor_name}</span>
                              <span className="text-muted-foreground ml-2">
                                {formatDate(contribution.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">KES {contribution.amount.toLocaleString()}</span>
                              {contribution.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : contribution.status === 'pending' ? (
                                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Create Recharge Link</h3>
              <p className="text-sm text-muted-foreground">Share this link to receive money directly to your account</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Target Amount (Optional)
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g., 5000"
                  min="0"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for unlimited contributions
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Emergency fund, Birthday gift"
                  maxLength={255}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Link Validity
                </label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RechargeTokens;
