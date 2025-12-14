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
        if (Schema::hasTable('news')) {
            Schema::table('news', function (Blueprint $table) {
                $table->index('created_at');
                $table->index('published_at');
                $table->index('status');
                $table->index('category');
                $table->index(['status', 'published_at']);
            });
        }

        // Announcements table indexes (if exists)
        if (Schema::hasTable('announcements')) {
            Schema::table('announcements', function (Blueprint $table) {
                $table->index('created_at');
                $table->index('active');
                $table->index('priority');
                $table->index('expires_at');
                $table->index(['active', 'priority']);
                $table->index(['active', 'expires_at']);
            });
        }

        // Withdrawals table indexes (if exists)
        if (Schema::hasTable('withdrawals')) {
            Schema::table('withdrawals', function (Blueprint $table) {
                $sm = Schema::getConnection()->getDoctrineSchemaManager();
                $indexes = $sm->listTableIndexes('withdrawals');
                // Use raw SQL to create indexes only if they do not exist (Postgres compatible)
                $indexes = [
                    'withdrawals_status_index' => 'CREATE INDEX withdrawals_status_index ON withdrawals (status)',
                    'withdrawals_created_at_index' => 'CREATE INDEX withdrawals_created_at_index ON withdrawals (created_at)',
                    'withdrawals_account_id_index' => 'CREATE INDEX withdrawals_account_id_index ON withdrawals (account_id)',
                    'withdrawals_phone_number_index' => 'CREATE INDEX withdrawals_phone_number_index ON withdrawals (phone_number)',
                    'withdrawals_status_created_at_index' => 'CREATE INDEX withdrawals_status_created_at_index ON withdrawals (status, created_at)',
                    'withdrawals_account_id_status_index' => 'CREATE INDEX withdrawals_account_id_status_index ON withdrawals (account_id, status)',
                ];
                foreach ($indexes as $indexName => $sql) {
                    $exists = DB::select("SELECT 1 FROM pg_indexes WHERE tablename = 'withdrawals' AND indexname = ?", [$indexName]);
                    if (empty($exists)) {
                        DB::statement($sql);
                    }
                }
            });
        }

        // M-Pesa transactions log indexes (if exists)
        if (Schema::hasTable('mpesa_transaction_logs')) {
            Schema::table('mpesa_transaction_logs', function (Blueprint $table) {
                $table->index('checkout_request_id');
                $table->index('merchant_request_id');
                $table->index('status');
                $table->index('phone_number');
                $table->index('account_number');
                $table->index('created_at');
                $table->index(['status', 'created_at']);
                $table->index(['phone_number', 'status']);
            });
        }

        // Tickets table indexes (if exists)
        if (Schema::hasTable('tickets')) {
            Schema::table('tickets', function (Blueprint $table) {
                $table->index('status');
                $table->index('user_id');
                $table->index('created_at');
                $table->index('ticket_number');
                $table->index(['status', 'created_at']);
                $table->index(['user_id', 'status']);
            });
        }

        // Orders table indexes (if exists)
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->index('status');
                $table->index('user_id');
                $table->index('created_at');
                $table->index('order_number');
                $table->index(['status', 'created_at']);
                $table->index(['user_id', 'status']);
            });
        }

        // Merchandise table indexes (if exists)
        if (Schema::hasTable('merchandise')) {
            Schema::table('merchandise', function (Blueprint $table) {
                $table->index('status');
                $table->index('created_at');
                $table->index('category');
                $table->index('price');
                $table->index(['status', 'category']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Transactions table
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['status']);
            $table->dropIndex(['type']);
            $table->dropIndex(['transaction_id']);
            $table->dropIndex(['phone_number']);
            $table->dropIndex(['account_id', 'status']);
            $table->dropIndex(['account_id', 'created_at']);
            $table->dropIndex(['status', 'created_at']);
        });

        // Users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropIndex(['member_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['role']);
            $table->dropIndex(['phone_number']);
            $table->dropIndex(['status', 'role']);
            $table->dropIndex(['role', 'created_at']);
        });

        // Projects table
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['end_date']);
            if (Schema::hasColumn('projects', 'category_id')) {
                $table->dropIndex(['category_id']);
                $table->dropIndex(['category_id', 'status']);
            }
            if (Schema::hasColumn('projects', 'user_id')) {
                $table->dropIndex(['user_id']);
            }
            $table->dropIndex(['status', 'created_at']);
        });

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
