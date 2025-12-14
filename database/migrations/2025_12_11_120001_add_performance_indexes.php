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
    // Helper to create index if not exists (Postgres)
    private function createPgIndexIfNotExists($table, $indexes)
    {
        $columns = null;
        foreach ($indexes as $indexName => $indexData) {
            $sql = $indexData['sql'];
            $requiredColumns = $indexData['columns'];
            if ($columns === null) {
                $columns = Schema::hasTable($table) ? Schema::getColumnListing($table) : [];
            }
            $allColumnsExist = true;
            foreach ($requiredColumns as $col) {
                if (!in_array($col, $columns)) {
                    $allColumnsExist = false;
                    break;
                }
            }
            if (!$allColumnsExist) continue;
            $exists = \DB::select("SELECT 1 FROM pg_indexes WHERE tablename = ? AND indexname = ?", [$table, $indexName]);
            if (empty($exists)) {
                \DB::statement($sql);
            }
        }
    }

    // Helper to drop index if exists (Postgres)
    private function dropPgIndexIfExists($table, $indexes)
    {
        foreach ($indexes as $indexName => $indexData) {
            $exists = \DB::select("SELECT 1 FROM pg_indexes WHERE tablename = ? AND indexname = ?", [$table, $indexName]);
            if (!empty($exists)) {
                \DB::statement("DROP INDEX IF EXISTS \"$indexName\"");
            }
        }
    }

    public function up(): void
    {
        // Transactions table indexes
        $this->createPgIndexIfNotExists('transactions', [
                        'transactions_created_at_index' => [ 'sql' => 'CREATE INDEX transactions_created_at_index ON transactions (created_at)', 'columns' => ['created_at'] ],
                        'transactions_status_index' => [ 'sql' => 'CREATE INDEX transactions_status_index ON transactions (status)', 'columns' => ['status'] ],
                        'transactions_type_index' => [ 'sql' => 'CREATE INDEX transactions_type_index ON transactions (type)', 'columns' => ['type'] ],
                        'transactions_transaction_id_index' => [ 'sql' => 'CREATE INDEX transactions_transaction_id_index ON transactions (transaction_id)', 'columns' => ['transaction_id'] ],
                        'transactions_phone_number_index' => [ 'sql' => 'CREATE INDEX transactions_phone_number_index ON transactions (phone_number)', 'columns' => ['phone_number'] ],
                        'transactions_account_id_status_index' => [ 'sql' => 'CREATE INDEX transactions_account_id_status_index ON transactions (account_id, status)', 'columns' => ['account_id', 'status'] ],
                        'transactions_account_id_created_at_index' => [ 'sql' => 'CREATE INDEX transactions_account_id_created_at_index ON transactions (account_id, created_at)', 'columns' => ['account_id', 'created_at'] ],
                        'transactions_status_created_at_index' => [ 'sql' => 'CREATE INDEX transactions_status_created_at_index ON transactions (status, created_at)', 'columns' => ['status', 'created_at'] ],
                    ]);

                    // Users table indexes
                    $this->createPgIndexIfNotExists('users', [
                        'users_email_index' => [ 'sql' => 'CREATE INDEX users_email_index ON users (email)', 'columns' => ['email'] ],
                        'users_member_id_index' => [ 'sql' => 'CREATE INDEX users_member_id_index ON users (member_id)', 'columns' => ['member_id'] ],
                        'users_status_index' => [ 'sql' => 'CREATE INDEX users_status_index ON users (status)', 'columns' => ['status'] ],
                        'users_role_index' => [ 'sql' => 'CREATE INDEX users_role_index ON users (role)', 'columns' => ['role'] ],
                        'users_phone_number_index' => [ 'sql' => 'CREATE INDEX users_phone_number_index ON users (phone_number)', 'columns' => ['phone_number'] ],
                        'users_status_role_index' => [ 'sql' => 'CREATE INDEX users_status_role_index ON users (status, role)', 'columns' => ['status', 'role'] ],
                        'users_role_created_at_index' => [ 'sql' => 'CREATE INDEX users_role_created_at_index ON users (role, created_at)', 'columns' => ['role', 'created_at'] ],
                    ]);

                    // Projects table indexes
                    $this->createPgIndexIfNotExists('projects', [
                        'projects_status_index' => [ 'sql' => 'CREATE INDEX projects_status_index ON projects (status)', 'columns' => ['status'] ],
                        'projects_created_at_index' => [ 'sql' => 'CREATE INDEX projects_created_at_index ON projects (created_at)', 'columns' => ['created_at'] ],
                        'projects_end_date_index' => [ 'sql' => 'CREATE INDEX projects_end_date_index ON projects (end_date)', 'columns' => ['end_date'] ],
                        'projects_category_id_index' => [ 'sql' => 'CREATE INDEX projects_category_id_index ON projects (category_id)', 'columns' => ['category_id'] ],
                        'projects_category_id_status_index' => [ 'sql' => 'CREATE INDEX projects_category_id_status_index ON projects (category_id, status)', 'columns' => ['category_id', 'status'] ],
                        'projects_user_id_index' => [ 'sql' => 'CREATE INDEX projects_user_id_index ON projects (user_id)', 'columns' => ['user_id'] ],
                        'projects_status_created_at_index' => [ 'sql' => 'CREATE INDEX projects_status_created_at_index ON projects (status, created_at)', 'columns' => ['status', 'created_at'] ],
                    ]);

                    // Accounts table indexes
                    $this->createPgIndexIfNotExists('accounts', [
                        'accounts_status_index' => [ 'sql' => 'CREATE INDEX accounts_status_index ON accounts (status)', 'columns' => ['status'] ],
                        'accounts_account_number_index' => [ 'sql' => 'CREATE INDEX accounts_account_number_index ON accounts (account_number)', 'columns' => ['account_number'] ],
                        'accounts_account_type_id_index' => [ 'sql' => 'CREATE INDEX accounts_account_type_id_index ON accounts (account_type_id)', 'columns' => ['account_type_id'] ],
                        'accounts_created_at_index' => [ 'sql' => 'CREATE INDEX accounts_created_at_index ON accounts (created_at)', 'columns' => ['created_at'] ],
                        'accounts_status_account_type_id_index' => [ 'sql' => 'CREATE INDEX accounts_status_account_type_id_index ON accounts (status, account_type_id)', 'columns' => ['status', 'account_type_id'] ],
                    ]);

                    // News table indexes (if exists)
                    if (Schema::hasTable('news')) {
                        $this->createPgIndexIfNotExists('news', [
                            'news_created_at_index' => [ 'sql' => 'CREATE INDEX news_created_at_index ON news (created_at)', 'columns' => ['created_at'] ],
                            'news_published_at_index' => [ 'sql' => 'CREATE INDEX news_published_at_index ON news (published_at)', 'columns' => ['published_at'] ],
                            'news_status_index' => [ 'sql' => 'CREATE INDEX news_status_index ON news (status)', 'columns' => ['status'] ],
                            'news_category_index' => [ 'sql' => 'CREATE INDEX news_category_index ON news (category)', 'columns' => ['category'] ],
                            'news_status_published_at_index' => [ 'sql' => 'CREATE INDEX news_status_published_at_index ON news (status, published_at)', 'columns' => ['status', 'published_at'] ],
                        ]);
                    }

                    // Announcements table indexes (if exists)
                    if (Schema::hasTable('announcements')) {
                        $this->createPgIndexIfNotExists('announcements', [
                            'announcements_created_at_index' => [ 'sql' => 'CREATE INDEX announcements_created_at_index ON announcements (created_at)', 'columns' => ['created_at'] ],
                            'announcements_active_index' => [ 'sql' => 'CREATE INDEX announcements_active_index ON announcements (active)', 'columns' => ['active'] ],
                            'announcements_priority_index' => [ 'sql' => 'CREATE INDEX announcements_priority_index ON announcements (priority)', 'columns' => ['priority'] ],
                            'announcements_expires_at_index' => [ 'sql' => 'CREATE INDEX announcements_expires_at_index ON announcements (expires_at)', 'columns' => ['expires_at'] ],
                            'announcements_active_priority_index' => [ 'sql' => 'CREATE INDEX announcements_active_priority_index ON announcements (active, priority)', 'columns' => ['active', 'priority'] ],
                            'announcements_active_expires_at_index' => [ 'sql' => 'CREATE INDEX announcements_active_expires_at_index ON announcements (active, expires_at)', 'columns' => ['active', 'expires_at'] ],
                        ]);
                    }

                    // Withdrawals table indexes (if exists)
                    if (Schema::hasTable('withdrawals')) {
                        $this->createPgIndexIfNotExists('withdrawals', [
                            'withdrawals_status_index' => [ 'sql' => 'CREATE INDEX withdrawals_status_index ON withdrawals (status)', 'columns' => ['status'] ],
                            'withdrawals_created_at_index' => [ 'sql' => 'CREATE INDEX withdrawals_created_at_index ON withdrawals (created_at)', 'columns' => ['created_at'] ],
                            'withdrawals_account_id_index' => [ 'sql' => 'CREATE INDEX withdrawals_account_id_index ON withdrawals (account_id)', 'columns' => ['account_id'] ],
                            'withdrawals_phone_number_index' => [ 'sql' => 'CREATE INDEX withdrawals_phone_number_index ON withdrawals (phone_number)', 'columns' => ['phone_number'] ],
                            'withdrawals_status_created_at_index' => [ 'sql' => 'CREATE INDEX withdrawals_status_created_at_index ON withdrawals (status, created_at)', 'columns' => ['status', 'created_at'] ],
                            'withdrawals_account_id_status_index' => [ 'sql' => 'CREATE INDEX withdrawals_account_id_status_index ON withdrawals (account_id, status)', 'columns' => ['account_id', 'status'] ],
                        ]);
                    }

                    // M-Pesa transactions log indexes (if exists)
                    if (Schema::hasTable('mpesa_transaction_logs')) {
                        $this->createPgIndexIfNotExists('mpesa_transaction_logs', [
                            'mpesa_transaction_logs_checkout_request_id_index' => [ 'sql' => 'CREATE INDEX mpesa_transaction_logs_checkout_request_id_index ON mpesa_transaction_logs (checkout_request_id)', 'columns' => ['checkout_request_id'] ],
                            'mpesa_transaction_logs_merchant_request_id_index' => [ 'sql' => 'CREATE INDEX mpesa_transaction_logs_merchant_request_id_index ON mpesa_transaction_logs (merchant_request_id)', 'columns' => ['merchant_request_id'] ],
                            'mpesa_transaction_logs_status_index' => [ 'sql' => 'CREATE INDEX mpesa_transaction_logs_status_index ON mpesa_transaction_logs (status)', 'columns' => ['status'] ],
                            'mpesa_transaction_logs_phone_number_index' => [ 'sql' => 'CREATE INDEX mpesa_transaction_logs_phone_number_index ON mpesa_transaction_logs (phone_number)', 'columns' => ['phone_number'] ],
                            'mpesa_transaction_logs_account_number_index' => [ 'sql' => 'CREATE INDEX mpesa_transaction_logs_account_number_index ON mpesa_transaction_logs (account_number)', 'columns' => ['account_number'] ],
                            'mpesa_transaction_logs_created_at_index' => [ 'sql' => 'CREATE INDEX mpesa_transaction_logs_created_at_index ON mpesa_transaction_logs (created_at)', 'columns' => ['created_at'] ],
                            'mpesa_transaction_logs_status_created_at_index' => [ 'sql' => 'CREATE INDEX mpesa_transaction_logs_status_created_at_index ON mpesa_transaction_logs (status, created_at)', 'columns' => ['status', 'created_at'] ],
                            'mpesa_transaction_logs_phone_number_status_index' => [ 'sql' => 'CREATE INDEX mpesa_transaction_logs_phone_number_status_index ON mpesa_transaction_logs (phone_number, status)', 'columns' => ['phone_number', 'status'] ],
                        ]);
                    }

                    // Tickets table indexes (if exists)
                    if (Schema::hasTable('tickets')) {
                        $this->createPgIndexIfNotExists('tickets', [
                            'tickets_status_index' => [ 'sql' => 'CREATE INDEX tickets_status_index ON tickets (status)', 'columns' => ['status'] ],
                            'tickets_user_id_index' => [ 'sql' => 'CREATE INDEX tickets_user_id_index ON tickets (user_id)', 'columns' => ['user_id'] ],
                            'tickets_created_at_index' => [ 'sql' => 'CREATE INDEX tickets_created_at_index ON tickets (created_at)', 'columns' => ['created_at'] ],
                            'tickets_ticket_number_index' => [ 'sql' => 'CREATE INDEX tickets_ticket_number_index ON tickets (ticket_number)', 'columns' => ['ticket_number'] ],
                            'tickets_status_created_at_index' => [ 'sql' => 'CREATE INDEX tickets_status_created_at_index ON tickets (status, created_at)', 'columns' => ['status', 'created_at'] ],
                            'tickets_user_id_status_index' => [ 'sql' => 'CREATE INDEX tickets_user_id_status_index ON tickets (user_id, status)', 'columns' => ['user_id', 'status'] ],
                        ]);
                    }

                    // Orders table indexes (if exists)
                    if (Schema::hasTable('orders')) {
                        $this->createPgIndexIfNotExists('orders', [
                            'orders_status_index' => [ 'sql' => 'CREATE INDEX orders_status_index ON orders (status)', 'columns' => ['status'] ],
                            'orders_user_id_index' => [ 'sql' => 'CREATE INDEX orders_user_id_index ON orders (user_id)', 'columns' => ['user_id'] ],
                            'orders_created_at_index' => [ 'sql' => 'CREATE INDEX orders_created_at_index ON orders (created_at)', 'columns' => ['created_at'] ],
                            'orders_order_number_index' => [ 'sql' => 'CREATE INDEX orders_order_number_index ON orders (order_number)', 'columns' => ['order_number'] ],
                            'orders_status_created_at_index' => [ 'sql' => 'CREATE INDEX orders_status_created_at_index ON orders (status, created_at)', 'columns' => ['status', 'created_at'] ],
                            'orders_user_id_status_index' => [ 'sql' => 'CREATE INDEX orders_user_id_status_index ON orders (user_id, status)', 'columns' => ['user_id', 'status'] ],
                        ]);
                    }

                    // Merchandise table indexes (if exists)
                    if (Schema::hasTable('merchandise')) {
                        $this->createPgIndexIfNotExists('merchandise', [
                            'merchandise_status_index' => [ 'sql' => 'CREATE INDEX merchandise_status_index ON merchandise (status)', 'columns' => ['status'] ],
                            'merchandise_created_at_index' => [ 'sql' => 'CREATE INDEX merchandise_created_at_index ON merchandise (created_at)', 'columns' => ['created_at'] ],
                            'merchandise_category_index' => [ 'sql' => 'CREATE INDEX merchandise_category_index ON merchandise (category)', 'columns' => ['category'] ],
                            'merchandise_price_index' => [ 'sql' => 'CREATE INDEX merchandise_price_index ON merchandise (price)', 'columns' => ['price'] ],
                            'merchandise_status_category_index' => [ 'sql' => 'CREATE INDEX merchandise_status_category_index ON merchandise (status, category)', 'columns' => ['status', 'category'] ],
                        ]);
                    }
                }

                public function down(): void
                {
                    // Transactions table indexes
                    $this->dropPgIndexIfExists('transactions', [
                        'transactions_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                        'transactions_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                        'transactions_type_index' => [ 'sql' => '', 'columns' => ['type'] ],
                        'transactions_transaction_id_index' => [ 'sql' => '', 'columns' => ['transaction_id'] ],
                        'transactions_phone_number_index' => [ 'sql' => '', 'columns' => ['phone_number'] ],
                        'transactions_account_id_status_index' => [ 'sql' => '', 'columns' => ['account_id', 'status'] ],
                        'transactions_account_id_created_at_index' => [ 'sql' => '', 'columns' => ['account_id', 'created_at'] ],
                        'transactions_status_created_at_index' => [ 'sql' => '', 'columns' => ['status', 'created_at'] ],
                    ]);

                    // Users table indexes
                    $this->dropPgIndexIfExists('users', [
                        'users_email_index' => [ 'sql' => '', 'columns' => ['email'] ],
                        'users_member_id_index' => [ 'sql' => '', 'columns' => ['member_id'] ],
                        'users_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                        'users_role_index' => [ 'sql' => '', 'columns' => ['role'] ],
                        'users_phone_number_index' => [ 'sql' => '', 'columns' => ['phone_number'] ],
                        'users_status_role_index' => [ 'sql' => '', 'columns' => ['status', 'role'] ],
                        'users_role_created_at_index' => [ 'sql' => '', 'columns' => ['role', 'created_at'] ],
                    ]);

                    // Projects table indexes
                    $this->dropPgIndexIfExists('projects', [
                        'projects_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                        'projects_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                        'projects_end_date_index' => [ 'sql' => '', 'columns' => ['end_date'] ],
                        'projects_category_id_index' => [ 'sql' => '', 'columns' => ['category_id'] ],
                        'projects_category_id_status_index' => [ 'sql' => '', 'columns' => ['category_id', 'status'] ],
                        'projects_user_id_index' => [ 'sql' => '', 'columns' => ['user_id'] ],
                        'projects_status_created_at_index' => [ 'sql' => '', 'columns' => ['status', 'created_at'] ],
                    ]);

                    // Accounts table indexes
                    $this->dropPgIndexIfExists('accounts', [
                        'accounts_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                        'accounts_account_number_index' => [ 'sql' => '', 'columns' => ['account_number'] ],
                        'accounts_account_type_id_index' => [ 'sql' => '', 'columns' => ['account_type_id'] ],
                        'accounts_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                        'accounts_status_account_type_id_index' => [ 'sql' => '', 'columns' => ['status', 'account_type_id'] ],
                    ]);

                    // News table indexes (if exists)
                    if (Schema::hasTable('news')) {
                        $this->dropPgIndexIfExists('news', [
                            'news_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                            'news_published_at_index' => [ 'sql' => '', 'columns' => ['published_at'] ],
                            'news_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                            'news_category_index' => [ 'sql' => '', 'columns' => ['category'] ],
                            'news_status_published_at_index' => [ 'sql' => '', 'columns' => ['status', 'published_at'] ],
                        ]);
                    }

                    // Announcements table indexes (if exists)
                    if (Schema::hasTable('announcements')) {
                        $this->dropPgIndexIfExists('announcements', [
                            'announcements_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                            'announcements_active_index' => [ 'sql' => '', 'columns' => ['active'] ],
                            'announcements_priority_index' => [ 'sql' => '', 'columns' => ['priority'] ],
                            'announcements_expires_at_index' => [ 'sql' => '', 'columns' => ['expires_at'] ],
                            'announcements_active_priority_index' => [ 'sql' => '', 'columns' => ['active', 'priority'] ],
                            'announcements_active_expires_at_index' => [ 'sql' => '', 'columns' => ['active', 'expires_at'] ],
                        ]);
                    }

                    // Withdrawals table indexes (if exists)
                    if (Schema::hasTable('withdrawals')) {
                        $this->dropPgIndexIfExists('withdrawals', [
                            'withdrawals_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                            'withdrawals_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                            'withdrawals_account_id_index' => [ 'sql' => '', 'columns' => ['account_id'] ],
                            'withdrawals_phone_number_index' => [ 'sql' => '', 'columns' => ['phone_number'] ],
                            'withdrawals_status_created_at_index' => [ 'sql' => '', 'columns' => ['status', 'created_at'] ],
                            'withdrawals_account_id_status_index' => [ 'sql' => '', 'columns' => ['account_id', 'status'] ],
                        ]);
                    }

                    // M-Pesa transactions log indexes (if exists)
                    if (Schema::hasTable('mpesa_transaction_logs')) {
                        $this->dropPgIndexIfExists('mpesa_transaction_logs', [
                            'mpesa_transaction_logs_checkout_request_id_index' => [ 'sql' => '', 'columns' => ['checkout_request_id'] ],
                            'mpesa_transaction_logs_merchant_request_id_index' => [ 'sql' => '', 'columns' => ['merchant_request_id'] ],
                            'mpesa_transaction_logs_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                            'mpesa_transaction_logs_phone_number_index' => [ 'sql' => '', 'columns' => ['phone_number'] ],
                            'mpesa_transaction_logs_account_number_index' => [ 'sql' => '', 'columns' => ['account_number'] ],
                            'mpesa_transaction_logs_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                            'mpesa_transaction_logs_status_created_at_index' => [ 'sql' => '', 'columns' => ['status', 'created_at'] ],
                            'mpesa_transaction_logs_phone_number_status_index' => [ 'sql' => '', 'columns' => ['phone_number', 'status'] ],
                        ]);
                    }

                    // Tickets table indexes (if exists)
                    if (Schema::hasTable('tickets')) {
                        $this->dropPgIndexIfExists('tickets', [
                            'tickets_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                            'tickets_user_id_index' => [ 'sql' => '', 'columns' => ['user_id'] ],
                            'tickets_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                            'tickets_ticket_number_index' => [ 'sql' => '', 'columns' => ['ticket_number'] ],
                            'tickets_status_created_at_index' => [ 'sql' => '', 'columns' => ['status', 'created_at'] ],
                            'tickets_user_id_status_index' => [ 'sql' => '', 'columns' => ['user_id', 'status'] ],
                        ]);
                    }

                    // Orders table indexes (if exists)
                    if (Schema::hasTable('orders')) {
                        $this->dropPgIndexIfExists('orders', [
                            'orders_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                            'orders_user_id_index' => [ 'sql' => '', 'columns' => ['user_id'] ],
                            'orders_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                            'orders_order_number_index' => [ 'sql' => '', 'columns' => ['order_number'] ],
                            'orders_status_created_at_index' => [ 'sql' => '', 'columns' => ['status', 'created_at'] ],
                            'orders_user_id_status_index' => [ 'sql' => '', 'columns' => ['user_id', 'status'] ],
                        ]);
                    }

                    // Merchandise table indexes (if exists)
                    if (Schema::hasTable('merchandise')) {
                        $this->dropPgIndexIfExists('merchandise', [
                            'merchandise_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                            'merchandise_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                            'merchandise_category_index' => [ 'sql' => '', 'columns' => ['category'] ],
                            'merchandise_price_index' => [ 'sql' => '', 'columns' => ['price'] ],
                            'merchandise_status_category_index' => [ 'sql' => '', 'columns' => ['status', 'category'] ],
                        ]);
                    }
                }
            }
        }
    }
};
