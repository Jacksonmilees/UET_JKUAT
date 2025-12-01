
import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useCallback,
    ReactNode,
    useEffect,
} from 'react';
import {
    Account,
    AccountSubtype,
    AccountType,
    Donation,
    MandatoryContributionStatus,
    MpesaSession,
    Ticket,
    Transaction,
    Withdrawal,
} from '../types';
import { MANDATORY_CONTRIBUTION_AMOUNT } from '../constants';
import { useAuth } from './AuthContext';
import { NotificationContext } from './NotificationContext';
import api from '../services/api';

// Frontend will receive 401 from protected endpoints unless VITE_API_KEY is configured.
const HAS_API_KEY = !!import.meta.env.VITE_API_KEY;

interface InitiateProjectContributionPayload {
    projectId: number;
    projectTitle: string;
    amount: number;
    phoneNumber: string;
    userId?: number;
    donorName?: string;
}

interface RecordManualDonationPayload {
    projectId: number;
    projectTitle: string;
    amount: number;
    phoneNumber: string;
    donorName: string;
    userId?: number;
    mpesaReceipt?: string;
    status?: Donation['status'];
    createdAt?: string;
}

interface FinanceContextType {
    accounts: Account[];
    accountTypes: AccountType[];
    accountSubtypes: AccountSubtype[];
    donations: Donation[];
    transactions: Transaction[];
    withdrawals: Withdrawal[];
    tickets: Ticket[];
    mpesaSessions: MpesaSession[];
    mandatoryContributionAmount: number;
    isLoading: boolean;
    initiateProjectContribution: (
        payload: InitiateProjectContributionPayload
    ) => Promise<{ session: MpesaSession; success: boolean; message?: string }>;
    recordManualDonation: (payload: RecordManualDonationPayload) => Donation;
    getUserDonations: (userId?: number) => Donation[];
    getUserTransactions: (userId?: number) => Transaction[];
    getMandatoryStatus: (userId?: number) => MandatoryContributionStatus;
    refreshTransactions: () => Promise<void>;
    refreshAccounts: () => Promise<void>;
    refreshWithdrawals: () => Promise<void>;
    refreshTickets: () => Promise<void>;
    initiateWithdrawal: (amount: number, phoneNumber: string, reason: string) => Promise<void>;
    checkMpesaStatus: (checkoutRequestId: string) => Promise<MpesaSession>;
}

const FinanceContext = createContext<FinanceContextType>({} as FinanceContextType);

export const useFinance = () => useContext(FinanceContext);

// Transform backend data to frontend format
const transformTransaction = (backendTx: any): Transaction => {
    return {
        id: backendTx.id?.toString() || `txn-${Date.now()}`,
        projectId: backendTx.project_id,
        projectTitle: backendTx.project_title || backendTx.description || 'Transaction',
        amount: parseFloat(backendTx.amount || 0),
        date: backendTx.created_at || backendTx.processed_at || new Date().toISOString(),
        type: backendTx.type || 'credit',
        status: backendTx.status || 'completed',
        reference: backendTx.reference || backendTx.transaction_id,
        phoneNumber: backendTx.phone_number,
        userId: backendTx.user_id,
        description: backendTx.description,
    };
};

const transformDonation = (backendDonation: any): Donation => {
    return {
        id: backendDonation.id?.toString() || `don-${Date.now()}`,
        projectId: backendDonation.project_id,
        projectTitle: backendDonation.project?.title || 'Project',
        amount: parseFloat(backendDonation.amount || 0),
        phoneNumber: backendDonation.phone_number,
        donorName: backendDonation.donor_name || 'Anonymous',
        userId: backendDonation.user_id,
        mpesaReceipt: backendDonation.transaction_id,
        status: backendDonation.status || 'completed',
        createdAt: backendDonation.created_at || new Date().toISOString(),
    };
};

const transformAccount = (backendAccount: any): Account => {
    return {
        id: backendAccount.id,
        accountNumber: backendAccount.account_number || backendAccount.reference,
        type: backendAccount.type || backendAccount.account_type?.name || 'Standard',
        balance: parseFloat(backendAccount.balance || 0),
        status: backendAccount.status || 'active',
    };
};

const transformWithdrawal = (backendWithdrawal: any): Withdrawal => {
    return {
        id: backendWithdrawal.id?.toString(),
        accountId: backendWithdrawal.account_id,
        amount: parseFloat(backendWithdrawal.amount || 0),
        phoneNumber: backendWithdrawal.phone_number,
        reason: backendWithdrawal.withdrawal_reason,
        status: backendWithdrawal.status || 'pending',
        createdAt: backendWithdrawal.created_at || new Date().toISOString(),
        completedAt: backendWithdrawal.completed_at,
        mpesaTransactionId: backendWithdrawal.mpesa_transaction_id,
    };
};

const transformTicket = (backendTicket: any): Ticket => {
    return {
        id: backendTicket.id?.toString(),
        ticketNumber: backendTicket.ticket_number,
        amount: parseFloat(backendTicket.amount || 0),
        status: backendTicket.status || backendTicket.payment_status || 'active',
        purchaseDate: backendTicket.created_at || new Date().toISOString(),
    };
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { addNotification } = useContext(NotificationContext);

    const [donations, setDonations] = useState<Donation[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
    const [accountSubtypes, setAccountSubtypes] = useState<AccountSubtype[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [mpesaSessions, setMpesaSessions] = useState<MpesaSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load data from API
    const loadTransactions = useCallback(async () => {
        try {
            // Transactions endpoint is public - no API key needed
            const response = await api.accounts.getTransactions();
            if (response.success && response.data) {
                const transformed = response.data.map(transformTransaction);
                setTransactions(transformed);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            setTransactions([]); // Set empty array on error
        }
    }, []);

    const loadDonations = useCallback(async () => {
        try {
            // Transactions endpoint is public - no API key needed
            const response = await api.transactions.getAll({ sort_by: 'created_at', sort_direction: 'desc' });
            if (response.success && response.data) {
                const txs = response.data as any[];
                const derived = txs
                    .filter(t => (t.type || '').toLowerCase() === 'credit' || (t.payment_method || '').toLowerCase() === 'mpesa')
                    .map(t => ({
                        id: (t.id?.toString?.() || `don-${t.reference || Date.now()}`),
                        projectId: t.project_id,
                        projectTitle: t.project_title || t.description || 'Project',
                        amount: parseFloat(t.amount || 0),
                        phoneNumber: t.phone_number,
                        donorName: t.payer_name || 'Anonymous',
                        userId: t.user_id,
                        mpesaReceipt: t.reference || t.transaction_id,
                        status: (t.status || 'completed'),
                        createdAt: t.created_at || new Date().toISOString(),
                    }));
                setDonations(derived);
            }
        } catch (error) {
            console.error('Error loading donations:', error);
            setDonations([]); // Set empty array on error
        }
    }, []);

    const loadAccounts = useCallback(async () => {
        try {
            const response = await api.accounts.getMyAccount();
            if (response.success && response.data) {
                const transformed = Array.isArray(response.data)
                    ? response.data.map(transformAccount)
                    : [transformAccount(response.data)];
                setAccounts(transformed);
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    }, []);

    const loadWithdrawals = useCallback(async () => {
        try {
            if (!HAS_API_KEY) {
                setWithdrawals([]);
                return;
            }
            const response = await api.withdrawals.getAll();
            if (response.success && response.data) {
                const transformed = response.data.map(transformWithdrawal);
                setWithdrawals(transformed);
            }
        } catch (error) {
            console.error('Error loading withdrawals:', error);
        }
    }, []);

    const loadTickets = useCallback(async () => {
        try {
            const response = await api.tickets.getMyTickets();
            if (response.success && response.data) {
                const transformed = response.data.map(transformTicket);
                setTickets(transformed);
            }
        } catch (error) {
            console.error('Error loading tickets:', error);
        }
    }, []);

    // Load data on mount and when user changes
    useEffect(() => {
        if (user) {
            loadTransactions();
            loadDonations();
            loadAccounts();
            loadWithdrawals();
            loadTickets();
        }
    }, [user, loadTransactions, loadDonations, loadAccounts, loadWithdrawals, loadTickets]);

    const recordManualDonation = useCallback(
        (payload: RecordManualDonationPayload): Donation => {
            const createdAt = payload.createdAt ?? new Date().toISOString();
            const id = payload.mpesaReceipt
                ? `don-${payload.mpesaReceipt}`
                : `don-${Date.now()}`;

            const status = payload.status ?? 'completed';
            const donation: Donation = {
                id,
                projectId: payload.projectId,
                projectTitle: payload.projectTitle,
                amount: payload.amount,
                phoneNumber: payload.phoneNumber,
                donorName: payload.donorName,
                userId: payload.userId,
                mpesaReceipt: payload.mpesaReceipt,
                status,
                createdAt,
            };

            setDonations(prev => [donation, ...prev]);

            if (status === 'completed') {
                const transaction: Transaction = {
                    id: `txn-${Date.now()}`,
                    projectId: payload.projectId,
                    projectTitle: payload.projectTitle,
                    amount: payload.amount,
                    date: createdAt,
                    type: 'donation',
                    status: 'completed',
                    reference: payload.mpesaReceipt,
                    phoneNumber: payload.phoneNumber,
                    userId: payload.userId,
                };
                setTransactions(prev => [transaction, ...prev]);
            }

            return donation;
        },
        []
    );

    const updateSessionStatus = useCallback((sessionId: string, updates: Partial<MpesaSession>) => {
        setMpesaSessions(prev =>
            prev.map(session =>
                session.id === sessionId
                    ? { ...session, ...updates }
                    : session
            )
        );
    }, []);

    const initiateProjectContribution = useCallback(
        async ({
            projectId,
            projectTitle,
            amount,
            phoneNumber,
            userId,
            donorName,
        }: InitiateProjectContributionPayload) => {
            try {
                let accountNumber: string;
                
                // Handle mandatory contribution (projectId = 0)
                if (projectId === 0) {
                    accountNumber = 'MANDATORY-CONTRIBUTION';
                } else {
                    // Get project account number
                    const projectResponse = await api.projects.getById(projectId);
                    if (!projectResponse.success || !projectResponse.data) {
                        return {
                            session: {} as MpesaSession,
                            success: false,
                            message: 'Project not found',
                        };
                    }
                    accountNumber = projectResponse.data.account_number || `PROJ-${projectId}`;
                }

                // Initiate MPesa STK Push
                const mpesaResponse = await api.mpesa.initiateSTKPush({
                    phone_number: phoneNumber,
                    amount: amount,
                    account_number: accountNumber,
                });

                if (!mpesaResponse.success || !mpesaResponse.data) {
                    return {
                        session: {} as MpesaSession,
                        success: false,
                        message: mpesaResponse.error || 'Failed to initiate payment',
                    };
                }

                const mpesaData = mpesaResponse.data;
                const timestamp = Date.now();
                const session: MpesaSession = {
                    id: `mpesa-${timestamp}`,
                    amount,
                    phoneNumber,
                    projectId,
                    projectTitle,
                    status: 'pending',
                    initiatedAt: new Date().toISOString(),
                    checkoutRequestId: mpesaData.CheckoutRequestID,
                    merchantRequestId: mpesaData.MerchantRequestID,
                };

                setMpesaSessions(prev => [session, ...prev]);
                addNotification(
                    `STK push initiated to ${phoneNumber}. Approve the payment on your phone to complete your contribution.`
                );

                return { session, success: true };
            } catch (error: any) {
                return {
                    session: {} as MpesaSession,
                    success: false,
                    message: error.message || 'Failed to initiate payment',
                };
            }
        },
        [addNotification]
    );

    const checkMpesaStatus = useCallback(async (checkoutRequestId: string): Promise<MpesaSession> => {
        try {
            const response = await api.mpesa.checkStatus(checkoutRequestId);
            if (response.success && response.data) {
                const statusData = response.data;
                const session: MpesaSession = {
                    id: `mpesa-${checkoutRequestId}`,
                    amount: statusData.amount,
                    phoneNumber: statusData.phoneNumber,
                    status: statusData.status,
                    checkoutRequestId: statusData.checkoutRequestId,
                    mpesaReceiptNumber: statusData.mpesaReceiptNumber,
                    errorMessage: statusData.errorMessage,
                };

                // Update session in state
                setMpesaSessions(prev =>
                    prev.map(s =>
                        s.checkoutRequestId === checkoutRequestId ? session : s
                    )
                );

                // If completed, refresh transactions and donations
                if (statusData.status === 'completed') {
                    await loadTransactions();
                    await loadDonations();
                }

                return session;
            }
            throw new Error('Failed to check status');
        } catch (error: any) {
            throw error;
        }
    }, [loadTransactions, loadDonations]);

    const initiateWithdrawal = useCallback(
        async (amount: number, phoneNumber: string, reason: string) => {
            try {
                const account = accounts[0];
                if (!account) {
                    throw new Error('No account found');
                }

                const response = await api.withdrawals.initiate({
                    account_id: account.id,
                    amount,
                    phone_number: phoneNumber,
                    withdrawal_reason: reason,
                });

                if (response.success) {
                    addNotification('Withdrawal request submitted successfully');
                    await loadWithdrawals();
                } else {
                    throw new Error(response.error || 'Failed to initiate withdrawal');
                }
            } catch (error: any) {
                addNotification(error.message || 'Failed to initiate withdrawal');
                throw error;
            }
        },
        [accounts, addNotification, loadWithdrawals]
    );

    const getUserDonations = useCallback(
        (userId?: number) =>
            donations.filter(donation =>
                userId ? donation.userId === userId : true
            ),
        [donations]
    );

    const getUserTransactions = useCallback(
        (userId?: number) =>
            transactions.filter(transaction =>
                userId ? transaction.userId === userId : true
            ),
        [transactions]
    );

    const getMandatoryStatus = useCallback(
        (userId?: number): MandatoryContributionStatus => {
            if (!userId) {
                return {
                    requiredAmount: MANDATORY_CONTRIBUTION_AMOUNT,
                    contributedAmount: 0,
                    isCleared: false,
                };
            }

            // Compute from local donations synchronously to keep UI stable.
            const relevantDonations = donations.filter(
                donation => donation.userId === userId && donation.status === 'completed'
            );

            const contributedAmount = relevantDonations.reduce(
                (sum, donation) => sum + donation.amount,
                0
            );

            const lastContributionDate = relevantDonations[0]?.createdAt;

            return {
                requiredAmount: MANDATORY_CONTRIBUTION_AMOUNT,
                contributedAmount,
                isCleared: contributedAmount >= MANDATORY_CONTRIBUTION_AMOUNT,
                lastContributionDate,
            };
        },
        [donations]
    );

    const refreshTransactions = useCallback(async () => {
        await loadTransactions();
        await loadDonations();
    }, [loadTransactions, loadDonations]);

    const refreshAccounts = useCallback(async () => {
        await loadAccounts();
    }, [loadAccounts]);

    const refreshWithdrawals = useCallback(async () => {
        await loadWithdrawals();
    }, [loadWithdrawals]);

    const refreshTickets = useCallback(async () => {
        await loadTickets();
    }, [loadTickets]);

    const value: FinanceContextType = useMemo(
        () => ({
            accounts,
            accountTypes,
            accountSubtypes,
            donations,
            transactions,
            withdrawals,
            tickets,
            mpesaSessions,
            mandatoryContributionAmount: MANDATORY_CONTRIBUTION_AMOUNT,
            isLoading,
            initiateProjectContribution,
            recordManualDonation,
            getUserDonations,
            getUserTransactions,
            getMandatoryStatus,
            refreshTransactions,
            refreshAccounts,
            refreshWithdrawals,
            refreshTickets,
            initiateWithdrawal,
            checkMpesaStatus,
        }),
        [
            accounts,
            accountTypes,
            accountSubtypes,
            donations,
            transactions,
            withdrawals,
            tickets,
            mpesaSessions,
            isLoading,
            initiateProjectContribution,
            recordManualDonation,
            getUserDonations,
            getUserTransactions,
            getMandatoryStatus,
            refreshTransactions,
            refreshAccounts,
            refreshWithdrawals,
            refreshTickets,
            initiateWithdrawal,
            checkMpesaStatus,
        ]
    );

    return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
