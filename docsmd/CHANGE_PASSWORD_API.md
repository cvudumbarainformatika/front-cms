# Change Password API Integration

## Overview
Implementasi change password yang terhubung dengan backend Go endpoint `/api/v1/auth/profile/change-password`.

---

## Frontend Implementation

### 1. useAuth Composable

**File:** `app/composables/useAuth.ts`

**Type Definition:**
```typescript
export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
```

**Function:**
```typescript
const changePassword = async (data: ChangePasswordData) => {
  // Validate input
  if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
    throw new Error('Semua field wajib diisi')
  }

  if (data.newPassword !== data.confirmPassword) {
    throw new Error('Password baru tidak cocok dengan konfirmasi')
  }

  if (data.newPassword.length < 6) {
    throw new Error('Password baru minimal 6 karakter')
  }

  // Call backend API
  const res = await $apiFetch<ApiResponse<{ message: string }>>('/auth/profile/change-password', {
    method: 'POST',
    body: {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    }
  })

  return res?.data
}
```

**Export:**
```typescript
return {
  // ... other functions
  changePassword
}
```

---

### 2. Security Page

**File:** `app/pages/dashboard/profil/security.vue`

**Form Schema:**
```typescript
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini diperlukan'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password diperlukan')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword']
})
```

**Form Handler:**
```typescript
async function onChangePassword(event: FormSubmitEvent<PasswordSchema>) {
  loading.value = true
  try {
    const result = await changePassword(event.data)
    
    toast.add({
      title: 'Password Berhasil Diubah',
      description: result?.message || 'Password Anda telah diperbarui',
      icon: 'i-lucide-check',
      color: 'success'
    })
    
    // Reset form
    passwordState.currentPassword = ''
    passwordState.newPassword = ''
    passwordState.confirmPassword = ''
  } catch (error: any) {
    toast.add({
      title: 'Gagal Mengubah Password',
      description: error.message || 'Terjadi kesalahan saat mengubah password',
      icon: 'i-lucide-alert-circle',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}
```

---

## Backend API Requirement

### Endpoint Specification

**URL:** `POST /api/v1/auth/profile/change-password`

**Request Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Password berhasil diubah"
  },
  "message": "Password updated successfully"
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "message": "Token tidak valid atau expired"
  }
}
```

**400 Bad Request - Current password wrong:**
```json
{
  "success": false,
  "error": {
    "message": "Password saat ini tidak sesuai"
  }
}
```

**400 Bad Request - Invalid input:**
```json
{
  "success": false,
  "error": {
    "message": "Password baru minimal 6 karakter"
  }
}
```

---

## Flow Diagram

```
User Input Password
    ↓
Form Validation (Frontend)
    ├─ Check: current, new, confirm filled? ✓
    ├─ Check: new === confirm? ✓
    ├─ Check: length >= 6? ✓
    ↓
POST /auth/profile/change-password
    ↓
Backend Validation
    ├─ Check: token valid? ✓
    ├─ Check: current password correct? ✓
    ├─ Check: password != current password?
    ├─ Validate password strength
    ↓
Update Password in Database
    ↓
Return Success Response
    ↓
Frontend: Show Success Toast
Frontend: Reset Form
Frontend: User dapat login dengan password baru
```

---

## Testing

### Manual Testing Checklist

- [ ] Open `/dashboard/profil/security`
- [ ] Fill form:
  - Current Password: `admin123`
  - New Password: `newpass456`
  - Confirm Password: `newpass456`
- [ ] Click "Ganti Password"
- [ ] Check response:
  - [ ] Success toast appears
  - [ ] Form is reset
  - [ ] No error messages

### Error Cases

- [ ] Current password wrong → Error toast
- [ ] New password too short → Error message
- [ ] Passwords don't match → Error message
- [ ] Token expired → Redirect to login
- [ ] Backend error → Error toast with message

---

## Backend Go Implementation Example

```go
// Handler untuk change password
func (h *AuthHandler) ChangePassword(c *gin.Context) {
    // Get user dari token
    userID, _ := c.Get("user_id")
    
    var req struct {
        CurrentPassword string `json:"currentPassword" binding:"required,min=1"`
        NewPassword     string `json:"newPassword" binding:"required,min=6"`
    }
    
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    // Get user dari database
    user, err := h.userService.GetByID(userID)
    if err != nil {
        c.JSON(400, gin.H{"error": "User not found"})
        return
    }
    
    // Verify current password
    if !bcrypt.CheckPasswordHash(req.CurrentPassword, user.PasswordHash) {
        c.JSON(400, gin.H{"error": "Password saat ini tidak sesuai"})
        return
    }
    
    // Validate new password != current
    if req.CurrentPassword == req.NewPassword {
        c.JSON(400, gin.H{"error": "Password baru harus berbeda"})
        return
    }
    
    // Hash new password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 10)
    if err != nil {
        c.JSON(500, gin.H{"error": "Gagal mengubah password"})
        return
    }
    
    // Update password di database
    err = h.userService.UpdatePassword(userID, string(hashedPassword))
    if err != nil {
        c.JSON(500, gin.H{"error": "Gagal update password"})
        return
    }
    
    c.JSON(200, gin.H{
        "success": true,
        "data": gin.H{
            "message": "Password berhasil diubah",
        },
        "message": "Password updated successfully",
    })
}
```

---

## Security Considerations

✅ **Frontend Validation:**
- Check password length
- Check password match
- Show clear error messages

✅ **Backend Validation:**
- Verify token is valid
- Verify current password is correct
- Hash new password with bcrypt
- Check new password != current password
- Rate limit change password endpoint
- Log password change events

✅ **Best Practices:**
- Use HTTPS only in production
- Don't log passwords
- Add delay after failed attempts
- Consider requiring re-authentication for sensitive operations
- Add email notification when password changed

---

## Files Modified

- ✅ `app/composables/useAuth.ts` - Added `changePassword()` function
- ✅ `app/pages/dashboard/profil/security.vue` - Integrated with backend

---

## Status

**Frontend:** ✅ READY  
**Backend:** ⏳ TODO - Implement endpoint

**Next Step:** Implement endpoint di backend Go sesuai spesifikasi di atas
