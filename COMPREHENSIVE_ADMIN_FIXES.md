# Comprehensive Admin Dashboard Fixes

**Date:** 2025-12-12
**Status:** 🔧 FIXING ALL REPORTED ISSUES

---

## 🐛 Issues Identified

### 1. **News & Announcements - Showing 0 items in admin**
**Root Cause:** Backend filters by `published=true` and `active=true` by default. Admin needs to see ALL items including drafts.

**Backend Code (NewsController.php line 21-25):**
```php
if ($request->has('published')) {
    $query->where('published', $request->boolean('published'));
} else {
    $query->where('published', true); // ❌ Problem: Filters out drafts!
}
```

**Fix:** Admin endpoints should NOT filter by default, or accept `?all=true` parameter.

### 2. **Projects - Same issue**
Backend likely filters by status, admin can't see all projects.

### 3. **Image Upload - Not implemented**
No image upload functionality in news/projects forms.

### 4. **Merchandise Categories - Missing**
No UI to manage merchandise categories.

### 5. **Semesters - Can't create**
Validation or API endpoint issue.

### 6. **Finance Modules - Not fully functional**
Accounts, transactions, withdrawals need fixes.

### 7. **Frontend DataTable TypeError**
```
TypeError: Cannot read properties of undefined (reading 'charAt')
```
Data type safety issue in table rendering.

---

## 🔧 Fixes Being Applied

