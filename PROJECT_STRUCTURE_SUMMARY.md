# 📋 Tổng Hợp Cấu Trúc Dự Án - Smart Academic Planner

## 🏗️ **Tổng Quan Kiến Trúc**

**Smart Academic Planner** là một ứng dụng web quản lý thời gian học tập dành cho sinh viên, được xây dựng với React + TypeScript + Vite và sử dụng Mantine UI framework.

### **Công Nghệ Chính**
- **Frontend**: React 19.1.1 + TypeScript
- **Build Tool**: Vite 7.1.2  
- **UI Framework**: Mantine 8.3.0
- **State Management**: Zustand 5.0.8
- **Database**: IndexedDB (client-side)
- **Routing**: React Router DOM 7.8.2
- **Icons**: Tabler Icons React

---

## 📁 **Cấu Trúc Thư Mục Chi Tiết**

### **🔧 Root Configuration Files**

| File | Công Dụng |
|------|-----------|
| `package.json` | Quản lý dependencies và scripts |
| `vite.config.ts` | Cấu hình build tool và development server |
| `tsconfig.json` | Cấu hình TypeScript compiler |
| `eslint.config.js` | Cấu hình linting rules |
| `postcss.config.cjs` | Cấu hình CSS processing |
| `index.html` | Entry point HTML |
| `vercel.json` / `netlify.toml` | Cấu hình deployment |

---

### **🎯 Core Application Files**

#### **`src/main.tsx`**
- **Công dụng**: Entry point của React application
- **Chức năng**: Mount React app vào DOM, setup StrictMode
- **Dependencies**: React DOM, App component

#### **`src/App.tsx`**
- **Công dụng**: Root component và router chính
- **Chức năng**: 
  - Setup Mantine theme và providers
  - Quản lý tab navigation
  - Initialize store và notification system
  - Routing logic giữa các trang
- **Dependencies**: Mantine, Zustand store, notification hooks

---

### **📄 Pages (Views)**

| File | Chức Năng | Components Sử Dụng |
|------|-----------|-------------------|
| `Dashboard.tsx` | Trang chính - tổng quan sự kiện | KanbanColumn, EventCard, StudyTools |
| `CalendarView.tsx` | Xem lịch theo ngày/tuần | EventForm, DatePicker components |
| `AnalyticsView.tsx` | Thống kê và báo cáo | Charts, Progress bars |
| `AIAssistantView.tsx` | AI tạo sự kiện bằng ngôn ngữ tự nhiên | AI service integration |

**Các phiên bản khác**: `Dashboard-clean.tsx`, `Dashboard-new.tsx` (các version thử nghiệm)

---

### **🧩 Components Library**

#### **Core Components**
- `EventCard.tsx` - Card hiển thị thông tin sự kiện
- `EventForm.tsx` - Form tạo/chỉnh sửa sự kiện  
- `KanbanColumn.tsx` - Cột Kanban cho quản lý task
- `TaskCard.tsx` - Card hiển thị task nhỏ gọn

#### **Study Tools Components**
- `PomodoroTimer.tsx` - Bộ đếm thời gian Pomodoro
- `StudyScheduleGenerator.tsx` - Tạo lịch học tự động
- `GoalTracker.tsx` - Theo dõi mục tiêu
- `HabitTracker.tsx` - Theo dõi thói quen
- `ProductivityAnalytics.tsx` - Phân tích hiệu suất

#### **AI & Advanced Components**
- `AIStudyAssistant.tsx` - Trợ lý AI học tập
- `IntegratedDashboard.tsx` - Dashboard tích hợp các tính năng
- `QuickAddTask.tsx` - Thêm task nhanh
- `FloatingActionButton.tsx` - Nút action floating

#### **Utility Components**
- `CRUDOperationsDemo.tsx` - Demo các thao tác CRUD
- `CRUDCompletionStatus.tsx` - Hiển thị trạng thái CRUD

---

### **🏗️ Layout**

#### **`layouts/MainLayout.tsx`**
- **Công dụng**: Layout chính với sidebar navigation
- **Chức năng**:
  - Header với logo và title
  - Sidebar navigation với 4 tab chính
  - Responsive design với hamburger menu
  - AppShell structure của Mantine

---

### **🗄️ State Management**

#### **`store/eventStore.ts`**
- **Công dụng**: Zustand store quản lý state toàn cục
- **Chức năng**:
  - CRUD operations cho AcademicEvent
  - Database synchronization 
  - Loading và error handling
  - Utility functions (filter, sort, search)
- **Key Methods**:
  - `initializeStore()` - Khởi tạo database
  - `addEvent()`, `updateEvent()`, `deleteEvent()` - CRUD
  - `getEventsByType()`, `getEventsByStatus()` - Filtering
  - `getUpcomingEvents()` - Query events sắp tới

---

### **🔧 Services Layer**

| Service | Chức Năng |
|---------|-----------|
| `databaseService.ts` | Quản lý IndexedDB operations |
| `aiService.ts` | Tích hợp AI Gemini cho natural language processing |
| `analyticsService.ts` | Tính toán metrics và statistics |
| `calendarService.ts` | Logic xử lý calendar và date operations |
| `integrationService.ts` | Tích hợp giữa các component (Pomodoro ↔ Tasks) |
| `migrationService.ts` | Migration từ localStorage sang IndexedDB |

---

### **🔗 Hooks**

#### **`hooks/useLocalStorage.ts`**
- **Công dụng**: Custom hook để persist data trong localStorage
- **Chức năng**: Auto sync state với localStorage

#### **`hooks/useNotificationSystem.ts`**
- **Công dụng**: System thông báo tự động
- **Chức năng**: 
  - Deadline reminders
  - Overdue alerts
  - Daily digest
  - Motivational messages

---

### **📝 Types & Utilities**

#### **`types/index.ts`**
- **Định nghĩa**: 
  - `AcademicEvent` interface (core data model)
  - `EventFormData` interface (form handling)
  - Type definitions cho toàn bộ app

#### **`utils/dateUtils.ts`**
- **Công dụng**: Utility functions cho date operations
- **Functions**: Format date, calculate days until, generate IDs

---

### **🎨 Styling**

#### **`src/index.css`**
- **Công dụng**: Global styles và CSS variables
- **Content**: Reset styles, utility classes

#### **`src/App.css`**
- **Công dụng**: Component-specific styles
- **Content**: Custom styling cho App component

---

## 🌐 **Deployment & Build**

### **Build Configuration**
- **Output**: `dist/` folder
- **Optimization**: Code splitting (vendor, mantine, icons chunks)
- **Assets**: Optimized bundling với Rollup

### **Deployment Targets**
- **Vercel**: `vercel.json` configuration
- **Netlify**: `netlify.toml` configuration  
- **Static hosting**: Generic static file serving

---

## 🚀 **Development Workflow**

### **Available Scripts**
```bash
npm run dev       # Development server (Vite)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint checking
npm run deploy    # Deploy to GitHub Pages
```

### **Key Development URLs**
- **Local**: http://localhost:5173/
- **Preview**: http://localhost:3000/

---

## 📊 **Tính Năng Chính**

### **1. Quản Lý Sự Kiện (CRUD)**
- ✅ Tạo, đọc, cập nhật, xóa events
- ✅ Phân loại theo type: deadline, class, project, personal
- ✅ Status tracking: todo, in-progress, done
- ✅ Priority levels: low, medium, high

### **2. Dashboard & Analytics**
- ✅ Kanban board interface
- ✅ Progress tracking và completion rates
- ✅ Upcoming events preview
- ✅ Study productivity metrics

### **3. Study Tools**
- ✅ Pomodoro Timer với task integration
- ✅ Study Schedule Generator
- ✅ Goal & Habit Tracking
- ✅ AI Study Assistant (natural language)

### **4. Advanced Features**
- ✅ IndexedDB persistence
- ✅ Real-time notifications
- ✅ Responsive design
- ✅ Component integration system

---

## 🔄 **Data Flow Architecture**

```
User Input → Components → Event Store (Zustand) → Database Service → IndexedDB
                ↓
        Integration Service → Cross-component Updates → UI Re-render
```

---

## 📱 **Responsive Design**

- **Mobile-first** approach với Mantine breakpoints
- **Sidebar navigation** transforms to hamburger menu
- **Grid layouts** adapt từ 1 column (mobile) đến 4 columns (desktop)
- **Cards và components** responsive sizing

---

## 🔐 **Data Persistence**

- **Primary**: IndexedDB (client-side database)
- **Backup**: localStorage (migration support)
- **Migration**: Automatic từ localStorage → IndexedDB
- **Offline**: Full offline functionality

---

*Tài liệu này tóm tắt toàn bộ cấu trúc và chức năng của Smart Academic Planner. Mỗi file đều có vai trò cụ thể trong việc xây dựng một ứng dụng quản lý thời gian học tập hiện đại và hiệu quả.*
