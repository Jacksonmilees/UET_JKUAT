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
            $columns = null;
            // Helper to drop index if it exists (Postgres)
            function dropPgIndexIfExists($table, $indexes) {
                foreach ($indexes as $indexName => $indexData) {
                    // $indexData: ['sql' => ..., 'columns' => [...]]
                    $exists = DB::select("SELECT 1 FROM pg_indexes WHERE tablename = ? AND indexname = ?", [$table, $indexName]);
                    if (!empty($exists)) {
                        DB::statement("DROP INDEX IF EXISTS \"$indexName\"");
                    }
                }
            }

            // Transactions table indexes
            dropPgIndexIfExists('transactions', [
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
            dropPgIndexIfExists('users', [
                'users_email_index' => [ 'sql' => '', 'columns' => ['email'] ],
                'users_member_id_index' => [ 'sql' => '', 'columns' => ['member_id'] ],
                'users_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                'users_role_index' => [ 'sql' => '', 'columns' => ['role'] ],
                'users_phone_number_index' => [ 'sql' => '', 'columns' => ['phone_number'] ],
                'users_status_role_index' => [ 'sql' => '', 'columns' => ['status', 'role'] ],
                'users_role_created_at_index' => [ 'sql' => '', 'columns' => ['role', 'created_at'] ],
            ]);

            // Projects table indexes
            dropPgIndexIfExists('projects', [
                'projects_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                'projects_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                'projects_end_date_index' => [ 'sql' => '', 'columns' => ['end_date'] ],
                'projects_category_id_index' => [ 'sql' => '', 'columns' => ['category_id'] ],
                'projects_category_id_status_index' => [ 'sql' => '', 'columns' => ['category_id', 'status'] ],
                'projects_user_id_index' => [ 'sql' => '', 'columns' => ['user_id'] ],
                'projects_status_created_at_index' => [ 'sql' => '', 'columns' => ['status', 'created_at'] ],
            ]);

            // Accounts table indexes
            dropPgIndexIfExists('accounts', [
                'accounts_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                'accounts_account_number_index' => [ 'sql' => '', 'columns' => ['account_number'] ],
                'accounts_account_type_id_index' => [ 'sql' => '', 'columns' => ['account_type_id'] ],
                'accounts_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                'accounts_status_account_type_id_index' => [ 'sql' => '', 'columns' => ['status', 'account_type_id'] ],
            ]);

            // News table indexes (if exists)
            if (Schema::hasTable('news')) {
                dropPgIndexIfExists('news', [
                    'news_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                    'news_published_at_index' => [ 'sql' => '', 'columns' => ['published_at'] ],
                    'news_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                    'news_category_index' => [ 'sql' => '', 'columns' => ['category'] ],
                    'news_status_published_at_index' => [ 'sql' => '', 'columns' => ['status', 'published_at'] ],
                ]);
            }

            // Announcements table indexes (if exists)
            if (Schema::hasTable('announcements')) {
                dropPgIndexIfExists('announcements', [
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
                dropPgIndexIfExists('withdrawals', [
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
                dropPgIndexIfExists('mpesa_transaction_logs', [
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
                dropPgIndexIfExists('tickets', [
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
                dropPgIndexIfExists('orders', [
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
                dropPgIndexIfExists('merchandise', [
                    'merchandise_status_index' => [ 'sql' => '', 'columns' => ['status'] ],
                    'merchandise_created_at_index' => [ 'sql' => '', 'columns' => ['created_at'] ],
                    'merchandise_category_index' => [ 'sql' => '', 'columns' => ['category'] ],
                    'merchandise_price_index' => [ 'sql' => '', 'columns' => ['price'] ],
                    'merchandise_status_category_index' => [ 'sql' => '', 'columns' => ['status', 'category'] ],
                ]);
            }

        // Tickets table indexes (if exists)
        if (Schema::hasTable('tickets')) {
            createPgIndexIfNotExists('tickets', [
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
            createPgIndexIfNotExists('orders', [
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
            createPgIndexIfNotExists('merchandise', [
                'merchandise_status_index' => [ 'sql' => 'CREATE INDEX merchandise_status_index ON merchandise (status)', 'columns' => ['status'] ],
                'merchandise_created_at_index' => [ 'sql' => 'CREATE INDEX merchandise_created_at_index ON merchandise (created_at)', 'columns' => ['created_at'] ],
                'merchandise_category_index' => [ 'sql' => 'CREATE INDEX merchandise_category_index ON merchandise (category)', 'columns' => ['category'] ],
                'merchandise_price_index' => [ 'sql' => 'CREATE INDEX merchandise_price_index ON merchandise (price)', 'columns' => ['price'] ],
                'merchandise_status_category_index' => [ 'sql' => 'CREATE INDEX merchandise_status_category_index ON merchandise (status, category)', 'columns' => ['status', 'category'] ],
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
