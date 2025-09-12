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

| File | Chức Năng | Components Sử Dụng | Features |
|------|-----------|-------------------|----------|
| **`Dashboard.tsx`** | Trang chính - tổng quan sự kiện | KanbanColumn, EventCard, StudyTools | 3-column Kanban board, Quick stats |
| **`CalendarView.tsx`** 📅 | Xem lịch theo Month/Week/Day | EventForm, DatePicker, ViewSwitcher | Multi-view calendar, deadline collision detection |
| **`DoNowView.tsx`** 🤖 **[AI-POWERED]** | AI task prioritization view | TaskCard, Priority algorithms | AI urgency scoring, procrastination risk analysis |
| **`AnalyticsView.tsx`** 📊 **[AI-ENHANCED]** | Thống kê và báo cáo chi tiết | Charts, Progress bars, AI insights | Procrastination analytics, productivity patterns |
| **`AIAssistantView.tsx`** | AI tạo sự kiện bằng ngôn ngữ tự nhiên | AI service integration | Natural language processing |

**Deprecated/Testing Versions**: 
- `Dashboard-clean.tsx`, `Dashboard-new.tsx` - Experimental versions
- `AnalyticsView-fixed.tsx`, `AnalyticsView-new.tsx` - Development iterations
- `CalendarView-fixed.tsx` - Bug fix version

---

### **🧩 Components Library**

#### **Core Components**

##### **`EventCard.tsx`**
- **Công dụng**: Card component hiển thị thông tin sự kiện chi tiết
- **Features**: Priority badges, status indicators, action buttons
- **Props**: `event`, `onEdit`, `onDelete`, `onStatusChange`
- **Styling**: Mantine Card với responsive design

##### **`EventForm.tsx`** 🤖 **[AI-ENHANCED]**
- **Công dụng**: Form tạo/chỉnh sửa sự kiện với AI gợi ý
- **Features**: 
  - Real-time AI realistic deadline calculation
  - Priority-based procrastination analysis  
  - Color-coded urgency indicators
  - Vietnamese validation messages
- **AI Integration**: ProcrastinationAnalysisService
- **Props**: `event?`, `onSubmit`, `onCancel`, `defaultStatus`
- **New Fields**: `realisticDeadline`, `procrastinationCoefficient`

##### **`KanbanColumn.tsx`**
- **Công dụng**: Cột Kanban cho quản lý task theo status
- **Features**: Drag & drop support, task filtering
- **Props**: `title`, `events`, `status`, `onEventUpdate`

##### **`TaskCard.tsx`**
- **Công dụng**: Card hiển thị task nhỏ gọn trong Kanban
- **Features**: Quick status change, time tracking
- **Props**: `task`, `onUpdate`, `compact?`

#### **Study Tools Components**

##### **`PomodoroTimer.tsx`**
- **Công dụng**: Bộ đếm thời gian Pomodoro technique
- **Features**: 25-min work / 5-min break cycles, sound notifications
- **Integration**: Auto-link with current tasks
- **State**: Timer state, current session, break tracking

##### **`StudyScheduleGenerator.tsx`** 🤖
- **Công dụng**: AI tạo lịch học tự động
- **Features**: Smart time allocation, deadline consideration
- **Algorithm**: Priority-based scheduling với conflict resolution
- **Output**: Optimized study schedule

##### **`GoalTracker.tsx`**
- **Công dụng**: Theo dõi mục tiêu học tập dài hạn
- **Features**: Progress visualization, milestone tracking
- **Metrics**: Completion rate, time tracking, streak counting
- **UI**: Progress rings, achievement badges

##### **`HabitTracker.tsx`**
- **Công dụng**: Theo dõi thói quen học tập hàng ngày
- **Features**: Daily check-ins, habit streaks, pattern analysis
- **Data**: Frequency tracking, success rates
- **Visualization**: Calendar heatmap, trend charts

##### **`ProductivityAnalytics.tsx`** 📊
- **Công dụng**: Phân tích hiệu suất học tập chi tiết
- **Metrics**: Time efficiency, task completion rates, best working hours
- **Charts**: Line charts, bar charts, productivity heatmaps
- **AI Insights**: Performance predictions, optimization suggestions

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

#### **`store/eventStore.ts`** 🤖 **[AI-ENHANCED]**
- **Công dụng**: Zustand store quản lý state toàn cục với AI integration
- **Chức năng**:
  - CRUD operations cho AcademicEvent với realistic deadline calculation
  - Database synchronization với IndexedDB
  - Loading và error handling với TypeScript safety
  - Utility functions (filter, sort, search) với performance optimization
  - AI pattern learning khi complete tasks
- **Key Methods**:
  - `initializeStore()` - Khởi tạo database và migration
  - `addEvent()` - Thêm event với AI realistic deadline calculation
  - `updateEvent()` - Cập nhật event và update procrastination patterns
  - `deleteEvent()` - Xóa event với cleanup
  - `getEventsByType()`, `getEventsByStatus()` - Advanced filtering
  - `getUpcomingEvents()` - Query events sắp tới với urgency scoring
- **State Structure**:
  ```typescript
  interface EventStore {
    events: AcademicEvent[];
    isLoading: boolean;
    error: string | null;
    // ... CRUD methods
  }
  ```

---

### **🔧 Services Layer**

| Service | Chức Năng | Methods | Features |
|---------|-----------|---------|----------|
| **`databaseService.ts`** | Quản lý IndexedDB operations | `initDB()`, `addEvent()`, `updateEvent()`, `deleteEvent()`, `getAllEvents()` | Async operations, error handling, data validation |
| **`aiService.ts`** | Tích hợp AI Gemini cho NLP | `parseNaturalLanguage()`, `generateSuggestions()`, `processUserInput()` | Natural language processing, smart event creation |
| **`procrastinationService.ts`** 🤖 **[NEW]** | AI phân tích procrastination patterns | `calculateProcrastinationCoefficient()`, `calculateRealisticDeadline()`, `getProcrastinationInsights()` | Machine learning algorithms, behavioral analysis |
| **`analyticsService.ts`** | Tính toán metrics và statistics | `calculateProductivityMetrics()`, `generateReports()`, `trackProgress()` | Statistical analysis, trend detection |
| **`calendarService.ts`** | Logic xử lý calendar và date | `getEventsForDate()`, `detectConflicts()`, `generateCalendarData()` | Date calculations, conflict detection |
| **`integrationService.ts`** | Tích hợp giữa các component | `linkPomodoroToTask()`, `syncTimers()`, `updateCrossComponents()` | Cross-component communication |
| **`migrationService.ts`** | Migration từ localStorage sang IndexedDB | `migrateData()`, `checkOldFormat()`, `preserveUserData()` | Data migration, backward compatibility |

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

#### **`types/index.ts`** 🤖 **[AI-ENHANCED]**
- **Định nghĩa Core Types**: 
  ```typescript
  interface AcademicEvent {
    id: string;
    title: string;
    type: 'deadline' | 'class' | 'project' | 'personal';
    course?: string;
    startTime: Date;
    endTime?: Date;
    status: 'todo' | 'in-progress' | 'done';
    priority?: 'low' | 'medium' | 'high';
    estimatedTime?: number;        // Thời gian ước tính (giờ)
    actualTime?: number;           // Thời gian thực tế (giờ)
    realisticDeadline?: Date;      // AI-calculated realistic deadline
    procrastinationCoefficient?: number; // AI procrastination factor
    description?: string;
    tags?: string[];
  }
  
  interface EventFormData {
    // Form-specific interface cho EventForm
    title: string;
    type: AcademicEvent['type'];
    // ... other form fields
  }
  
  interface ProcrastinationPattern {
    userId: string;
    overallCoefficient: number;
    typeCoefficients: Record<string, number>;
    priorityCoefficients: Record<string, number>;
    dayOfWeekPattern: Record<number, number>;
    timeOfDayPattern: Record<number, number>;
    lastUpdated: Date;
  }
  ```
- **AI-Specific Types**: Procrastination analysis, realistic deadline calculation
- **Form Validation**: TypeScript-safe form handling

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

### **1. Quản Lý Sự Kiện (CRUD)** ✅
- ✅ **Create**: Tạo events với AI realistic deadline suggestions
- ✅ **Read**: Hiển thị events theo multiple views (Dashboard, Calendar, DoNow)
- ✅ **Update**: Chỉnh sửa events với procrastination pattern learning
- ✅ **Delete**: Xóa events với confirmation và cleanup
- **Event Types**: deadline, class, project, personal
- **Status Tracking**: todo, in-progress, done
- **Priority Levels**: low (2.5x procrastination), medium (1.8x), high (1.1x)

### **2. Three Core Views (Assignment Requirement)** ✅

#### **📋 DoNowView - AI Task Prioritization**
- **AI Priority Scoring**: Urgency + Importance + Procrastination Risk
- **4-Tier System**: Critical (🔴), High (🟠), Medium (🟡), Low (🔵)
- **Dual Deadline Display**: Official deadline vs AI realistic deadline
- **Procrastination Risk Analysis**: Real-time risk assessment
- **Smart Sorting**: AI-powered task ordering

#### **📅 CalendarView - Multi-View Calendar**
- **3 View Modes**: Month, Week, Day views
- **Deadline Collision Detection**: Visual conflict identification
- **Interactive Navigation**: Smooth view switching
- **Event Management**: Quick create/edit from calendar
- **Responsive Design**: Mobile-optimized calendar interface

#### **📊 AnalyticsView - Productivity Intelligence**
- **30-Day Analysis**: Completion rates, productivity patterns
- **Best Working Hours**: AI-detected optimal productivity times
- **Procrastination Insights**: Trend analysis với AI recommendations
- **Task Type Performance**: Success rates by category
- **Weekly Patterns**: Productivity by day of week
- **AI Recommendations**: Personalized improvement suggestions

### **3. Time Handling (Assignment Requirement)** ✅

#### **⏱️ Estimated vs Actual Time Tracking**
- **Time Input**: Estimated time for all tasks
- **Actual Time Logging**: Track real completion time
- **Variance Analysis**: Compare estimated vs actual
- **Learning Algorithm**: Improve estimation accuracy over time

#### **🤖 Realistic Deadline vs Official Deadline** 
- **AI Calculation**: Procrastination coefficient analysis
- **Priority-Based Logic**: High priority = less buffer, Low priority = more buffer
- **Type-Based Patterns**: Projects need 2.2x buffer, Classes 1.1x
- **Time-Based Factors**: Day of week và hour of day productivity patterns
- **Real-Time Suggestions**: Live deadline recommendations in EventForm
- **Visual Indicators**: Color-coded urgency levels

### **4. Advanced AI Features** 🤖

#### **Procrastination Analysis Engine**
- **Pattern Recognition**: Learn from user behavior
- **Coefficient Calculation**: Priority, type, time-based factors
- **Realistic Timeline**: Smart deadline calculation
- **Behavioral Insights**: Trend analysis và recommendations
- **Continuous Learning**: Updates patterns when tasks completed

#### **Smart Notifications System**
- **Deadline Reminders**: Based on realistic vs official deadlines
- **Procrastination Alerts**: Early warning system
- **Productivity Insights**: Daily/weekly summary
- **Motivational Messages**: AI-generated encouragement

### **5. Study Tools Integration** 📚
- **Pomodoro Timer**: 25-min work cycles với task linking
- **Study Schedule Generator**: AI-optimized time allocation
- **Goal & Habit Tracking**: Progress monitoring
- **Cross-Component Integration**: Seamless tool interaction

### **6. Technical Excellence** 🔧
- **IndexedDB Persistence**: Offline-first data storage
- **Real-time Sync**: Instant updates across components
- **TypeScript Safety**: Full type coverage
- **Responsive Design**: Mobile-first approach
- **Performance Optimization**: Efficient rendering và state management

---

## 🔄 **Data Flow Architecture**

### **Primary Data Flow**
```
User Input → EventForm (AI Analysis) → Event Store (Zustand) → Database Service → IndexedDB
                     ↓
    ProcrastinationService → AI Calculations → Realistic Deadline → UI Updates
                     ↓
             Integration Service → Cross-component Updates → Real-time Sync
```

### **AI Processing Pipeline**
```
User Task Input → Procrastination Analysis → Type/Priority/Time Coefficients → 
Realistic Deadline Calculation → Real-time UI Suggestions → Pattern Learning (on completion)
```

### **Component Communication**
```
EventStore (Central State) ↔ EventForm (Input/Validation)
         ↕                           ↕
DoNowView (AI Prioritization) ↔ CalendarView (Multi-View)
         ↕                           ↕
AnalyticsView (Insights) ↔ ProcrastinationService (AI Engine)
```

---

## 📱 **Responsive Design**

- **Mobile-first** approach với Mantine breakpoints
- **Sidebar navigation** transforms to hamburger menu
- **Grid layouts** adapt từ 1 column (mobile) đến 4 columns (desktop)
- **Cards và components** responsive sizing

---

## 🏆 **NAVER Vietnam AI Hackathon Assignment Compliance**

### **✅ 100% Assignment Requirements Met**

#### **1. Calendar View** ✅ **COMPLETE**
- **Implementation**: `CalendarView.tsx` với Month/Week/Day views
- **Features**: Multi-view navigation, event management, responsive design
- **Compliance**: Full calendar functionality với advanced view switching

#### **2. Event Management (CRUD)** ✅ **COMPLETE**  
- **Implementation**: Complete CRUD operations trong `eventStore.ts` và `databaseService.ts`
- **Features**: Create, Read, Update, Delete với validation và error handling
- **Compliance**: Full CRUD với IndexedDB persistence

#### **3. Three Views** ✅ **COMPLETE**
- **DoNowView**: AI-powered task prioritization với urgency scoring
- **CalendarView**: Multi-modal calendar với deadline collision detection  
- **AnalyticsView**: Comprehensive productivity analysis với AI insights
- **Compliance**: 3 distinct views như yêu cầu assignment

#### **4. Time Handling** ✅ **COMPLETE**
- **Estimated vs Actual Time**: Full tracking với variance analysis
- **Realistic Deadline vs Official Deadline**: AI-powered procrastination analysis
- **Compliance**: Both time handling requirements hoàn thành

### **🤖 AI Enhancement Beyond Requirements**
- **Procrastination Analysis Engine**: Machine learning algorithms
- **Smart Deadline Prediction**: Behavioral pattern recognition
- **Real-time AI Suggestions**: Live deadline recommendations
- **Productivity Insights**: AI-generated improvement recommendations

### **🚀 Technical Excellence**
- **Performance**: Optimized rendering với code splitting
- **Type Safety**: 100% TypeScript coverage
- **User Experience**: Vietnamese localization, responsive design
- **Data Persistence**: Robust IndexedDB với migration support

## 🔐 **Data Persistence & Storage**

### **Storage Architecture**
- **Primary Database**: IndexedDB (client-side, 50MB+ capacity)
- **Backup Storage**: localStorage (migration support, 5-10MB)
- **Migration System**: Automatic upgrade từ localStorage → IndexedDB
- **Offline Support**: Full offline functionality với data sync

### **Data Models**
```typescript
// Core Event Model với AI enhancements
AcademicEvent {
  // Basic fields
  id, title, type, startTime, status, priority
  // Time tracking  
  estimatedTime, actualTime
  // AI-enhanced fields
  realisticDeadline, procrastinationCoefficient
}

// AI Pattern Storage
ProcrastinationPattern {
  overallCoefficient, typeCoefficients, priorityCoefficients,
  dayOfWeekPattern, timeOfDayPattern, lastUpdated
}
```

### **Performance Optimization**
- **Lazy Loading**: Components load on demand
- **Code Splitting**: Vendor, Mantine, và Icons bundles
- **Efficient Queries**: Indexed database operations
- **State Management**: Optimistic updates với rollback support

---

## 🚧 **Development Files**

### **Debug & Testing Tools**
- **`debug-procrastination.js`**: Console debugging script cho AI algorithms
- **Multiple Component Versions**: `-new`, `-fixed`, `-clean` variants cho testing
- **Error Boundaries**: Production-ready error handling

### **Build Optimization**
```javascript
// vite.config.ts highlights
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mantine: ['@mantine/core', '@mantine/hooks'],
          icons: ['@tabler/icons-react']
        }
      }
    }
  }
});
```

---

*📝 Smart Academic Planner - Một ứng dụng quản lý thời gian học tập với AI intelligence, 100% tuân thủ NAVER Vietnam AI Hackathon requirements và vượt trội với advanced features như procrastination analysis, realistic deadline prediction, và comprehensive productivity insights.*
