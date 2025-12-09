import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Loader2, CheckCircle, AlertCircle, Share2 } from 'lucide-react';
import api from '../services/api';

interface PublicDonatePageProps {
  projectId: number;
  onBack?: () => void;
}

interface ProjectInfo {
  id: number;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  raised_amount: number;
  image_url?: string;
  end_date?: string;
  status: string;
}

const PublicDonatePage: React.FC<PublicDonatePageProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  // Fetch project info
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/v1/projects/${projectId}`);
        if (response.data) {
          setProject(response.data.data || response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Project not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const normalizePhone = (phoneInput: string): string => {
    let cleaned = phoneInput.replace(/[^0-9]/g, '');
    if (cleaned.length === 9) {
      cleaned = '254' + cleaned;
    } else if (cleaned.length === 10 && cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!donorName.trim()) {
      setError('Please enter your name');
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!/^2547\d{8}$/.test(normalizedPhone)) {
      setError('Please enter a valid Safaricom phone number');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 1) {
      setError('Please enter a valid amount (minimum KES 1)');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/v1/projects/${projectId}/public-donate`, {
        donor_name: donorName.trim(),
        phone: normalizedPhone,
        amount: amountNum,
        message: message.trim() || undefined,
      });

      if (response.data.success) {
        setCheckoutRequestId(response.data.data?.checkout_request_id);
        setSuccess(true);
      } else {
        setError(response.data.message || 'Failed to initiate payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process donation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `Donate to ${project?.title}`,
      text: `Help support "${project?.title}" - ${project?.description?.substring(0, 100)}...`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const progressPercentage = project
    ? Math.min(100, (project.raised_amount / project.target_amount) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Project Not Found</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        {onBack && (
          <button onClick={onBack} className="text-primary hover:underline">
            Go back
          </button>
        )}
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Phone!</h2>
          <p className="text-muted-foreground mb-6">
            An M-Pesa prompt has been sent to your phone. Please enter your PIN to complete the donation of <span className="font-semibold text-foreground">KES {amount}</span> to <span className="font-semibold text-foreground">{project?.title}</span>.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              If you don't receive the prompt, please check:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 text-left list-disc list-inside">
              <li>Your phone is on and has network</li>
              <li>M-Pesa service is active</li>
              <li>You have sufficient balance</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setSuccess(false);
              setAmount('');
              setMessage('');
            }}
            className="text-primary hover:underline text-sm"
          >
            Make another donation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {onBack && (
              <button onClick={onBack} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Project Info */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mb-8">
            {project?.image_url && (
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                {project?.category}
              </span>
              <h1 className="text-2xl font-bold text-foreground mb-3">{project?.title}</h1>
              <p className="text-muted-foreground mb-6">{project?.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">
                    KES {project?.raised_amount?.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    of KES {project?.target_amount?.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {progressPercentage.toFixed(1)}% funded
                </p>
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Make a Donation</h2>
                <p className="text-sm text-muted-foreground">No account needed - pay directly with M-Pesa</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Your Name</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712345678"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Enter your Safaricom number</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Amount (KES)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  min="1"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                {/* Quick amount buttons */}
                <div className="flex gap-2 mt-2">
                  {[50, 100, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset.toString())}
                      className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                        amount === preset.toString()
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave a message of support..."
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Heart className="w-5 h-5" />
                    Donate with M-Pesa
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Secure Payment
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Instant Confirmation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDonatePage;
