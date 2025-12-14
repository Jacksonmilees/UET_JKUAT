<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Helper to create index if not exists (Postgres)
     */
    private function createPgIndexIfNotExists($table, $indexes)
    {
        $columns = null;

        foreach ($indexes as $indexName => $indexData) {
            $sql = $indexData['sql'];
            $requiredColumns = $indexData['columns'];

            if ($columns === null) {
                $columns = Schema::hasTable($table)
                    ? Schema::getColumnListing($table)
                    : [];
            }

            foreach ($requiredColumns as $col) {
                if (!in_array($col, $columns)) {
                    continue 2;
                }
            }

            $exists = DB::select(
                "SELECT 1 FROM pg_indexes WHERE tablename = ? AND indexname = ?",
                [$table, $indexName]
            );

            if (empty($exists)) {
                DB::statement($sql);
            }
        }
    }

    /**
     * Helper to drop index if exists (Postgres)
     */
    private function dropPgIndexIfExists($table, $indexes)
    {
        foreach ($indexes as $indexName => $indexData) {
            $exists = DB::select(
                "SELECT 1 FROM pg_indexes WHERE tablename = ? AND indexname = ?",
                [$table, $indexName]
            );

            if (!empty($exists)) {
                DB::statement("DROP INDEX IF EXISTS \"$indexName\"");
            }
        }
    }

    public function up(): void
    {
        // Transactions
        $this->createPgIndexIfNotExists('transactions', [
            'transactions_created_at_index' => ['sql' => 'CREATE INDEX transactions_created_at_index ON transactions (created_at)', 'columns' => ['created_at']],
            'transactions_status_index' => ['sql' => 'CREATE INDEX transactions_status_index ON transactions (status)', 'columns' => ['status']],
            'transactions_type_index' => ['sql' => 'CREATE INDEX transactions_type_index ON transactions (type)', 'columns' => ['type']],
            'transactions_transaction_id_index' => ['sql' => 'CREATE INDEX transactions_transaction_id_index ON transactions (transaction_id)', 'columns' => ['transaction_id']],
            'transactions_phone_number_index' => ['sql' => 'CREATE INDEX transactions_phone_number_index ON transactions (phone_number)', 'columns' => ['phone_number']],
            'transactions_account_id_status_index' => ['sql' => 'CREATE INDEX transactions_account_id_status_index ON transactions (account_id, status)', 'columns' => ['account_id', 'status']],
            'transactions_account_id_created_at_index' => ['sql' => 'CREATE INDEX transactions_account_id_created_at_index ON transactions (account_id, created_at)', 'columns' => ['account_id', 'created_at']],
            'transactions_status_created_at_index' => ['sql' => 'CREATE INDEX transactions_status_created_at_index ON transactions (status, created_at)', 'columns' => ['status', 'created_at']],
        ]);

        // Users
        $this->createPgIndexIfNotExists('users', [
            'users_email_index' => ['sql' => 'CREATE INDEX users_email_index ON users (email)', 'columns' => ['email']],
            'users_member_id_index' => ['sql' => 'CREATE INDEX users_member_id_index ON users (member_id)', 'columns' => ['member_id']],
            'users_status_index' => ['sql' => 'CREATE INDEX users_status_index ON users (status)', 'columns' => ['status']],
            'users_role_index' => ['sql' => 'CREATE INDEX users_role_index ON users (role)', 'columns' => ['role']],
            'users_phone_number_index' => ['sql' => 'CREATE INDEX users_phone_number_index ON users (phone_number)', 'columns' => ['phone_number']],
            'users_status_role_index' => ['sql' => 'CREATE INDEX users_status_role_index ON users (status, role)', 'columns' => ['status', 'role']],
            'users_role_created_at_index' => ['sql' => 'CREATE INDEX users_role_created_at_index ON users (role, created_at)', 'columns' => ['role', 'created_at']],
        ]);

        // Projects
        $this->createPgIndexIfNotExists('projects', [
            'projects_status_index' => ['sql' => 'CREATE INDEX projects_status_index ON projects (status)', 'columns' => ['status']],
            'projects_created_at_index' => ['sql' => 'CREATE INDEX projects_created_at_index ON projects (created_at)', 'columns' => ['created_at']],
            'projects_end_date_index' => ['sql' => 'CREATE INDEX projects_end_date_index ON projects (end_date)', 'columns' => ['end_date']],
            'projects_category_id_index' => ['sql' => 'CREATE INDEX projects_category_id_index ON projects (category_id)', 'columns' => ['category_id']],
            'projects_category_id_status_index' => ['sql' => 'CREATE INDEX projects_category_id_status_index ON projects (category_id, status)', 'columns' => ['category_id', 'status']],
            'projects_user_id_index' => ['sql' => 'CREATE INDEX projects_user_id_index ON projects (user_id)', 'columns' => ['user_id']],
            'projects_status_created_at_index' => ['sql' => 'CREATE INDEX projects_status_created_at_index ON projects (status, created_at)', 'columns' => ['status', 'created_at']],
        ]);
    }

    public function down(): void
    {
        $this->dropPgIndexIfExists('transactions', [
            'transactions_created_at_index' => [],
            'transactions_status_index' => [],
            'transactions_type_index' => [],
            'transactions_transaction_id_index' => [],
            'transactions_phone_number_index' => [],
            'transactions_account_id_status_index' => [],
            'transactions_account_id_created_at_index' => [],
            'transactions_status_created_at_index' => [],
        ]);

        $this->dropPgIndexIfExists('users', [
            'users_email_index' => [],
            'users_member_id_index' => [],
            'users_status_index' => [],
            'users_role_index' => [],
            'users_phone_number_index' => [],
            'users_status_role_index' => [],
            'users_role_created_at_index' => [],
        ]);

        $this->dropPgIndexIfExists('projects', [
            'projects_status_index' => [],
            'projects_created_at_index' => [],
            'projects_end_date_index' => [],
            'projects_category_id_index' => [],
            'projects_category_id_status_index' => [],
            'projects_user_id_index' => [],
            'projects_status_created_at_index' => [],
        ]);
    }
};
