# 🔧 Debug PomodoroTimer - Dropdown "Chọn nhiệm vụ để tập trung"

## ❗ **Vấn đề hiện tại:**
- Dropdown "Chọn nhiệm vụ để tập trung" trong PomodoroTimer không thể click được
- Không hiển thị các task options

## ✅ **Đã sửa:**
### **1. Z-index issue (FIXED)**
```tsx
// Đã thêm comboboxProps cho cả 2 Select trong PomodoroTimer
<Select
  comboboxProps={{ zIndex: 1000 }}
  allowDeselect={true}
  // ... other props
/>
```

## 🔍 **Possible Root Causes:**

### **1. Không có task data**
- `getAvailableTasks()` trả về empty array
- Cần tạo một vài events trước để test

### **2. LocalStorage key mismatch**
- PomodoroTimer dùng `academic-planner-events`
- EventStore có thể dùng key khác

### **3. Event Store chưa sync với localStorage**
- IndexedDB vs localStorage sync issue

## 🧪 **Debug Steps:**

### **Bước 1: Kiểm tra có events không**
1. Truy cập http://localhost:5174/
2. Tạo 2-3 sự kiện mới qua Dashboard/FloatingButton
3. Đảm bảo status = 'todo' hoặc 'in-progress' (not 'done')

### **Bước 2: Open Browser Console**
1. F12 → Console tab
2. Chạy: `console.log(localStorage.getItem('academic-planner-events'))`
3. Kiểm tra có data không

### **Bước 3: Test PomodoroTimer**
1. Scroll xuống tìm PomodoroTimer component
2. Đảm bảo mode = "Tập trung" (blue mode)
3. Click dropdown "Chọn nhiệm vụ để tập trung"
4. Should see task list

### **Bước 4: Manual Test**
Console test:
```javascript
// Test integration service
const integrationService = window.integrationService;
console.log('Available tasks:', integrationService?.getAvailableTasks());
```

## 🔧 **Expected Behavior:**

### **Khi có tasks:**
- Dropdown hiển thị list tasks format: "Task Title (Course Name)"
- Có thể search và select
- Có thể clear selection

### **Khi không có tasks:**  
- Dropdown hiển thị placeholder
- Empty dropdown (no options)

## 📋 **Next Actions:**

### **If dropdown vẫn không hoạt động:**
1. ✅ Z-index fixed
2. ❓ Check localStorage data
3. ❓ Check EventStore → localStorage sync
4. ❓ Check component re-render

### **If dropdown hoạt động nhưng empty:**
1. ❓ Tạo test events
2. ❓ Check localStorage key consistency  
3. ❓ Check filter logic (status !== 'done')

---

**Current Status**: 🟡 **Z-INDEX FIXED** - Cần test với data

**URL**: http://localhost:5174/ → Scroll down to PomodoroTimer
