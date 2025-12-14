<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add comprehensive indexes for performance optimization
     */
    public function up(): void
    {
        // Transactions table indexes
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('created_at');
            $table->index('status');
            $table->index('type');
            $table->index('transaction_id');
            $table->index('phone_number');
            $table->index(['account_id', 'status']);
            $table->index(['account_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });

        // Users table indexes
        Schema::table('users', function (Blueprint $table) {
            $table->index('email');
            $table->index('member_id');
            $table->index('status');
            $table->index('role');
            $table->index('phone_number');
            $table->index(['status', 'role']);
            $table->index(['role', 'created_at']);
        });

        // Projects table indexes
        Schema::table('projects', function (Blueprint $table) {
            $table->index('status');
            $table->index('created_at');
            $table->index('end_date');
            if (Schema::hasColumn('projects', 'category_id')) {
                $table->index('category_id');
                $table->index(['category_id', 'status']);
            }
            if (Schema::hasColumn('projects', 'user_id')) {
                $table->index('user_id');
            }
            $table->index(['status', 'created_at']);
        });

        // Accounts table indexes
        Schema::table('accounts', function (Blueprint $table) {
            $table->index('status');
            $table->index('account_number');
            $table->index('account_type_id');
            $table->index('created_at');
            $table->index(['status', 'account_type_id']);
        });

        // News table indexes (if exists)
        // Helper for raw index creation
        function createPgIndexIfNotExists($table, $indexes) {
            foreach ($indexes as $indexName => $sql) {
                $exists = DB::select("SELECT 1 FROM pg_indexes WHERE tablename = ? AND indexname = ?", [$table, $indexName]);
                if (empty($exists)) {
                    DB::statement($sql);
                }
            }
        }

        // Transactions table indexes
        createPgIndexIfNotExists('transactions', [
            'transactions_created_at_index' => 'CREATE INDEX transactions_created_at_index ON transactions (created_at)',
            'transactions_status_index' => 'CREATE INDEX transactions_status_index ON transactions (status)',
            'transactions_type_index' => 'CREATE INDEX transactions_type_index ON transactions (type)',
            'transactions_transaction_id_index' => 'CREATE INDEX transactions_transaction_id_index ON transactions (transaction_id)',
            'transactions_phone_number_index' => 'CREATE INDEX transactions_phone_number_index ON transactions (phone_number)',
            'transactions_account_id_status_index' => 'CREATE INDEX transactions_account_id_status_index ON transactions (account_id, status)',
            'transactions_account_id_created_at_index' => 'CREATE INDEX transactions_account_id_created_at_index ON transactions (account_id, created_at)',
            'transactions_status_created_at_index' => 'CREATE INDEX transactions_status_created_at_index ON transactions (status, created_at)',
        ]);

        // Users table indexes
        createPgIndexIfNotExists('users', [
            'users_email_index' => 'CREATE INDEX users_email_index ON users (email)',
            'users_member_id_index' => 'CREATE INDEX users_member_id_index ON users (member_id)',
            'users_status_index' => 'CREATE INDEX users_status_index ON users (status)',
            'users_role_index' => 'CREATE INDEX users_role_index ON users (role)',
            'users_phone_number_index' => 'CREATE INDEX users_phone_number_index ON users (phone_number)',
            'users_status_role_index' => 'CREATE INDEX users_status_role_index ON users (status, role)',
            'users_role_created_at_index' => 'CREATE INDEX users_role_created_at_index ON users (role, created_at)',
        ]);

        // Projects table indexes
        createPgIndexIfNotExists('projects', [
            'projects_status_index' => 'CREATE INDEX projects_status_index ON projects (status)',
            'projects_created_at_index' => 'CREATE INDEX projects_created_at_index ON projects (created_at)',
            'projects_end_date_index' => 'CREATE INDEX projects_end_date_index ON projects (end_date)',
            'projects_category_id_index' => 'CREATE INDEX projects_category_id_index ON projects (category_id)',
            'projects_category_id_status_index' => 'CREATE INDEX projects_category_id_status_index ON projects (category_id, status)',
            'projects_user_id_index' => 'CREATE INDEX projects_user_id_index ON projects (user_id)',
            'projects_status_created_at_index' => 'CREATE INDEX projects_status_created_at_index ON projects (status, created_at)',
        ]);

        // Accounts table indexes
        createPgIndexIfNotExists('accounts', [
            'accounts_status_index' => 'CREATE INDEX accounts_status_index ON accounts (status)',
            'accounts_account_number_index' => 'CREATE INDEX accounts_account_number_index ON accounts (account_number)',
            'accounts_account_type_id_index' => 'CREATE INDEX accounts_account_type_id_index ON accounts (account_type_id)',
            'accounts_created_at_index' => 'CREATE INDEX accounts_created_at_index ON accounts (created_at)',
            'accounts_status_account_type_id_index' => 'CREATE INDEX accounts_status_account_type_id_index ON accounts (status, account_type_id)',
        ]);

        // News table indexes (if exists)
        if (Schema::hasTable('news')) {
            createPgIndexIfNotExists('news', [
                'news_created_at_index' => 'CREATE INDEX news_created_at_index ON news (created_at)',
                'news_published_at_index' => 'CREATE INDEX news_published_at_index ON news (published_at)',
                'news_status_index' => 'CREATE INDEX news_status_index ON news (status)',
                'news_category_index' => 'CREATE INDEX news_category_index ON news (category)',
                'news_status_published_at_index' => 'CREATE INDEX news_status_published_at_index ON news (status, published_at)',
            ]);
        }

        // Announcements table indexes (if exists)
        if (Schema::hasTable('announcements')) {
            createPgIndexIfNotExists('announcements', [
                'announcements_created_at_index' => 'CREATE INDEX announcements_created_at_index ON announcements (created_at)',
                'announcements_active_index' => 'CREATE INDEX announcements_active_index ON announcements (active)',
                'announcements_priority_index' => 'CREATE INDEX announcements_priority_index ON announcements (priority)',
                'announcements_expires_at_index' => 'CREATE INDEX announcements_expires_at_index ON announcements (expires_at)',
                'announcements_active_priority_index' => 'CREATE INDEX announcements_active_priority_index ON announcements (active, priority)',
                'announcements_active_expires_at_index' => 'CREATE INDEX announcements_active_expires_at_index ON announcements (active, expires_at)',
            ]);
        }

        // Withdrawals table indexes (if exists)
        if (Schema::hasTable('withdrawals')) {
            createPgIndexIfNotExists('withdrawals', [
                'withdrawals_status_index' => 'CREATE INDEX withdrawals_status_index ON withdrawals (status)',
                'withdrawals_created_at_index' => 'CREATE INDEX withdrawals_created_at_index ON withdrawals (created_at)',
                'withdrawals_account_id_index' => 'CREATE INDEX withdrawals_account_id_index ON withdrawals (account_id)',
                'withdrawals_phone_number_index' => 'CREATE INDEX withdrawals_phone_number_index ON withdrawals (phone_number)',
                'withdrawals_status_created_at_index' => 'CREATE INDEX withdrawals_status_created_at_index ON withdrawals (status, created_at)',
                'withdrawals_account_id_status_index' => 'CREATE INDEX withdrawals_account_id_status_index ON withdrawals (account_id, status)',
            ]);
        }

        // M-Pesa transactions log indexes (if exists)
        if (Schema::hasTable('mpesa_transaction_logs')) {
            createPgIndexIfNotExists('mpesa_transaction_logs', [
                'mpesa_transaction_logs_checkout_request_id_index' => 'CREATE INDEX mpesa_transaction_logs_checkout_request_id_index ON mpesa_transaction_logs (checkout_request_id)',
                'mpesa_transaction_logs_merchant_request_id_index' => 'CREATE INDEX mpesa_transaction_logs_merchant_request_id_index ON mpesa_transaction_logs (merchant_request_id)',
                'mpesa_transaction_logs_status_index' => 'CREATE INDEX mpesa_transaction_logs_status_index ON mpesa_transaction_logs (status)',
                'mpesa_transaction_logs_phone_number_index' => 'CREATE INDEX mpesa_transaction_logs_phone_number_index ON mpesa_transaction_logs (phone_number)',
                'mpesa_transaction_logs_account_number_index' => 'CREATE INDEX mpesa_transaction_logs_account_number_index ON mpesa_transaction_logs (account_number)',
                'mpesa_transaction_logs_created_at_index' => 'CREATE INDEX mpesa_transaction_logs_created_at_index ON mpesa_transaction_logs (created_at)',
                'mpesa_transaction_logs_status_created_at_index' => 'CREATE INDEX mpesa_transaction_logs_status_created_at_index ON mpesa_transaction_logs (status, created_at)',
                'mpesa_transaction_logs_phone_number_status_index' => 'CREATE INDEX mpesa_transaction_logs_phone_number_status_index ON mpesa_transaction_logs (phone_number, status)',
            ]);
        }

        // Tickets table indexes (if exists)
        if (Schema::hasTable('tickets')) {
            createPgIndexIfNotExists('tickets', [
                'tickets_status_index' => 'CREATE INDEX tickets_status_index ON tickets (status)',
                'tickets_user_id_index' => 'CREATE INDEX tickets_user_id_index ON tickets (user_id)',
                'tickets_created_at_index' => 'CREATE INDEX tickets_created_at_index ON tickets (created_at)',
                'tickets_ticket_number_index' => 'CREATE INDEX tickets_ticket_number_index ON tickets (ticket_number)',
                'tickets_status_created_at_index' => 'CREATE INDEX tickets_status_created_at_index ON tickets (status, created_at)',
                'tickets_user_id_status_index' => 'CREATE INDEX tickets_user_id_status_index ON tickets (user_id, status)',
            ]);
        }

        // Orders table indexes (if exists)
        if (Schema::hasTable('orders')) {
            createPgIndexIfNotExists('orders', [
                'orders_status_index' => 'CREATE INDEX orders_status_index ON orders (status)',
                'orders_user_id_index' => 'CREATE INDEX orders_user_id_index ON orders (user_id)',
                'orders_created_at_index' => 'CREATE INDEX orders_created_at_index ON orders (created_at)',
                'orders_order_number_index' => 'CREATE INDEX orders_order_number_index ON orders (order_number)',
                'orders_status_created_at_index' => 'CREATE INDEX orders_status_created_at_index ON orders (status, created_at)',
                'orders_user_id_status_index' => 'CREATE INDEX orders_user_id_status_index ON orders (user_id, status)',
            ]);
        }

        // Merchandise table indexes (if exists)
        if (Schema::hasTable('merchandise')) {
            createPgIndexIfNotExists('merchandise', [
                'merchandise_status_index' => 'CREATE INDEX merchandise_status_index ON merchandise (status)',
                'merchandise_created_at_index' => 'CREATE INDEX merchandise_created_at_index ON merchandise (created_at)',
                'merchandise_category_index' => 'CREATE INDEX merchandise_category_index ON merchandise (category)',
                'merchandise_price_index' => 'CREATE INDEX merchandise_price_index ON merchandise (price)',
                'merchandise_status_category_index' => 'CREATE INDEX merchandise_status_category_index ON merchandise (status, category)',
            ]);
        }

        // Accounts table
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['account_number']);
            $table->dropIndex(['account_type_id']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['status', 'account_type_id']);
        });

        // News table
        if (Schema::hasTable('news')) {
            Schema::table('news', function (Blueprint $table) {
                $table->dropIndex(['created_at']);
                $table->dropIndex(['published_at']);
                $table->dropIndex(['status']);
                $table->dropIndex(['category']);
                $table->dropIndex(['status', 'published_at']);
            });
        }

        // Announcements table
        if (Schema::hasTable('announcements')) {
            Schema::table('announcements', function (Blueprint $table) {
                $table->dropIndex(['created_at']);
                $table->dropIndex(['active']);
                $table->dropIndex(['priority']);
                $table->dropIndex(['expires_at']);
                $table->dropIndex(['active', 'priority']);
                $table->dropIndex(['active', 'expires_at']);
            });
        }

        // Withdrawals table
        if (Schema::hasTable('withdrawals')) {
            Schema::table('withdrawals', function (Blueprint $table) {
                $table->dropIndex(['status']);
                $table->dropIndex(['created_at']);
                $table->dropIndex(['account_id']);
                $table->dropIndex(['phone_number']);
                $table->dropIndex(['status', 'created_at']);
                $table->dropIndex(['account_id', 'status']);
            });
        }

        // M-Pesa transactions log
        if (Schema::hasTable('mpesa_transaction_logs')) {
            Schema::table('mpesa_transaction_logs', function (Blueprint $table) {
                $table->dropIndex(['checkout_request_id']);
                $table->dropIndex(['merchant_request_id']);
                $table->dropIndex(['status']);
                $table->dropIndex(['phone_number']);
                $table->dropIndex(['account_number']);
                $table->dropIndex(['created_at']);
                $table->dropIndex(['status', 'created_at']);
                $table->dropIndex(['phone_number', 'status']);
            });
        }

        // Tickets table
        if (Schema::hasTable('tickets')) {
            Schema::table('tickets', function (Blueprint $table) {
                $table->dropIndex(['status']);
                $table->dropIndex(['user_id']);
                $table->dropIndex(['created_at']);
                $table->dropIndex(['ticket_number']);
                $table->dropIndex(['status', 'created_at']);
                $table->dropIndex(['user_id', 'status']);
            });
        }

        // Orders table
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropIndex(['status']);
                $table->dropIndex(['user_id']);
                $table->dropIndex(['created_at']);
                $table->dropIndex(['order_number']);
                $table->dropIndex(['status', 'created_at']);
                $table->dropIndex(['user_id', 'status']);
            });
        }

        // Merchandise table
        if (Schema::hasTable('merchandise')) {
            Schema::table('merchandise', function (Blueprint $table) {
                $table->dropIndex(['status']);
                $table->dropIndex(['created_at']);
                $table->dropIndex(['category']);
                $table->dropIndex(['price']);
                $table->dropIndex(['status', 'category']);
            });
        }
    }
};
