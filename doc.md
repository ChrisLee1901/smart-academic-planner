

# **Kế Hoạch Xây Dựng Toàn Diện: Giải Pháp Quản Lý Thời Gian Sinh Viên ("Smart Academic Planner")**

## **Giới thiệu: Định hình Giải pháp Chiến thắng \- "Smart Academic Planner"**

Để đáp ứng yêu cầu của NAVER Vietnam AI Hackathon, việc xây dựng một giải pháp quản lý thời gian cho sinh viên đòi hỏi một cách tiếp cận vượt ra ngoài một danh sách công việc (to-do list) thông thường. Thay vào đó, kế hoạch này đề xuất phát triển **"Smart Academic Planner"** — một ứng dụng lập kế hoạch học tập thông minh, được thiết kế để trở thành trung tâm điều phối toàn bộ hoạt động học thuật và cá nhân của sinh viên Việt Nam. Ứng dụng sẽ tích hợp một cách liền mạch lịch học trên lớp, các hạn chót (deadline) của bài tập lớn, lịch làm việc nhóm, và các khối thời gian dành cho việc tự học.

Điểm nhấn cốt lõi, tạo nên sự khác biệt và thể hiện sự sáng tạo, là tính năng **tạo sự kiện/nhiệm vụ bằng ngôn ngữ tự nhiên**. Bằng cách cho phép người dùng nhập các câu lệnh đơn giản như "Nộp bài tập Lịch sử Đảng vào 5 giờ chiều thứ Sáu", ứng dụng sẽ sử dụng AI để tự động phân tích và điền các thông tin cần thiết vào form tạo sự kiện. Tính năng này không chỉ giảm thiểu đáng kể các thao tác nhập liệu thủ công mà còn tăng tốc độ sử dụng, mang lại một trải nghiệm người dùng vượt trội.

Tầm nhìn của dự án là tạo ra một sản phẩm không chỉ đáp ứng đầy đủ các yêu cầu kỹ thuật tối thiểu mà còn thể hiện sự thấu hiểu sâu sắc về những thách thức thực tế mà sinh viên phải đối mặt hàng ngày. Trọng tâm sẽ được đặt vào việc xây dựng một giao diện người dùng (UI) sạch sẽ, trực quan và một trải nghiệm người dùng (UX) mượt mà. Cách tiếp cận này nhằm mục đích chứng minh năng lực xây dựng một sản phẩm hoàn chỉnh, tinh tế và sẵn sàng cho người dùng cuối, một yếu tố quan trọng để gây ấn tượng với ban giám khảo.

## **Phần I: Nền tảng và Kiến trúc Kỹ thuật**

Việc thiết lập một nền móng kỹ thuật vững chắc ngay từ đầu là yếu tố quyết định đến sự thành công của dự án, đặc biệt trong một cuộc thi có giới hạn thời gian. Phần này tập trung vào việc định hình một kiến trúc có tổ chức, dễ bảo trì và có khả năng mở rộng trong tương lai.

### **Cấu trúc Dự án và Tổ chức Thư mục Hiện đại**

Sau khi khởi tạo dự án bằng template React \+ Vite được cung cấp, bước đầu tiên và quan trọng nhất là tái cấu trúc lại thư mục src theo mô hình "feature-based" (dựa trên tính năng). Đây là một tiêu chuẩn ngành được công nhận rộng rãi, giúp quản lý sự phức tạp khi ứng dụng phát triển và được khuyến nghị trong nhiều tài liệu chuyên ngành.1 Việc áp dụng một cấu trúc chuyên nghiệp ngay từ đầu, dù cho một dự án hackathon ngắn ngày, là một tín hiệu mạnh mẽ về tư duy có tổ chức và tầm nhìn dài hạn. Nó cho thấy khả năng tư duy về bảo trì và mở rộng, một đặc điểm của các kỹ sư phần mềm có kinh nghiệm, thay vì chỉ đơn thuần code để hoàn thành yêu cầu.

Cấu trúc thư mục được đề xuất như sau:

/src

|-- /assets        \# Chứa các file tĩnh như hình ảnh, icons, và fonts \[1, 2\]  
|-- /components    \# Các UI component chung, có khả năng tái sử dụng cao (ví dụ: Button, Modal, Card) \[1, 2, 3\]  
|-- /features      \# Logic và component cho từng tính năng cụ thể (ví dụ: /calendar, /dashboard, /tasks) \[1, 2\]  
|-- /hooks         \# Các custom hooks để đóng gói và tái sử dụng logic (ví dụ: useLocalStorage, useAuth) \[1, 2\]  
|-- /layouts       \# Các component bố cục chính của ứng dụng (ví dụ: MainLayout chứa Sidebar và Header) \[1, 3\]  
|-- /pages         \# Các component cấp cao nhất, tương ứng với mỗi route (trang) của ứng dụng \[2\]  
|-- /services      \# Chứa logic giao tiếp với các API bên ngoài (ví dụ: Gemini API) \[1\]  
|-- /store         \# Nơi định nghĩa và quản lý trạng thái toàn cục bằng Zustand \[1, 4\]  
|-- /styles        \# Chứa các file CSS/SCSS toàn cục, biến theme, và các cấu hình styling \[1, 2\]  
|-- /types         \# Nơi định nghĩa các interface và type của TypeScript để đảm bảo type-safety \[1\]  
|-- /utils         \# Các hàm tiện ích nhỏ, thuần túy, có thể tái sử dụng ở nhiều nơi (ví dụ: hàm định dạng ngày tháng) \[2, 5\]  
|-- App.tsx        \# Component gốc của ứng dụng, nơi chứa các thiết lập về router  
|-- main.tsx       \# Điểm vào (entry point) của ứng dụng React

Cấu trúc này tuân thủ nguyên tắc Tách biệt các Mối quan tâm (Separation of Concerns), giúp cho việc tìm kiếm, sửa đổi và mở rộng mã nguồn trở nên dễ dàng hơn. Khi cần phát triển một tính năng mới, nhà phát triển chỉ cần tạo một thư mục con mới trong /features mà không gây ảnh hưởng đến các phần còn lại của ứng dụng. Để cải thiện trải nghiệm phát triển, việc cấu hình alias path (ví dụ: @/components/Button thay vì ../../components/Button) trong file vite.config.ts sẽ được áp dụng, giúp các đường dẫn import trở nên ngắn gọn và dễ đọc hơn.2

### **Lựa chọn Công nghệ Chiến lược**

Với khung thời gian một tuần của hackathon, việc lựa chọn các công cụ và thư viện phù hợp là yếu tố sống còn. Các công nghệ được chọn phải giúp tối đa hóa tốc độ phát triển mà không làm ảnh hưởng đến chất lượng sản phẩm cuối cùng. Việc trình bày một ma trận so sánh các lựa chọn công nghệ trong tài liệu dự án (README.md) sẽ chứng minh một quy trình ra quyết định có cấu trúc và dựa trên phân tích, thể hiện tư duy giải quyết vấn đề một cách chuyên nghiệp.

* **UI Components \- Mantine**: So với các đối thủ như Chakra UI, Mantine được chọn làm thư viện component chính. Các tài liệu so sánh chỉ ra rằng Mantine cung cấp một bộ sưu tập component và hooks cực kỳ phong phú, với hơn 100 component và hơn 50 custom hooks.6 Điều này có nghĩa là các thành phần phức tạp như Date Pickers, Modals, và các hooks tiện ích như  
  useForm hay useHotkeys đều có sẵn, giúp giảm thiểu đáng kể thời gian xây dựng các thành phần giao diện cơ bản từ đầu và hạn chế việc phải cài đặt thêm nhiều thư viện phụ trợ.6  
* **State Management \- Zustand**: Để quản lý trạng thái toàn cục, Zustand là lựa chọn tối ưu. Các phân tích đều nhấn mạnh sự đơn giản, hiệu năng cao và cú pháp gọn nhẹ (ít boilerplate) của Zustand so với các giải pháp truyền thống như Redux hay thậm chí là Context API của React.4 Các số liệu cho thấy Zustand có thời gian cập nhật trạng thái nhanh hơn và tác động đến kích thước gói ứng dụng (bundle size) nhỏ hơn đáng kể.11 Trong bối cảnh của một hackathon, khả năng thiết lập một store quản lý trạng thái chỉ với vài dòng code là một lợi thế cạnh tranh khổng lồ, giúp tiết kiệm thời gian và giảm độ phức tạp của dự án.4  
* **Routing \- React Router DOM**: Đây là thư viện tiêu chuẩn của ngành cho việc định tuyến trong các ứng dụng React.13 Việc sử dụng React Router DOM là lựa chọn an toàn, hiệu quả và được cộng đồng hỗ trợ rộng rãi. Phiên bản mới nhất với API  
  createBrowserRouter sẽ được sử dụng để định nghĩa các routes một cách tường minh và hiện đại.15

#### **Bảng: Ma trận Quyết định Lựa chọn Công nghệ**

| Thư viện | Lĩnh vực | Lựa chọn | Đối thủ | Tiêu chí 1: Tốc độ phát triển | Tiêu chí 2: Hiệu năng/Bundle Size | Tiêu chí 3: Mức độ phức tạp | Lý do chọn |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| UI Components | Giao diện người dùng | **Mantine** | Chakra UI | ★★★★★ (Nhiều component & hooks có sẵn) | ★★★★☆ | ★★★☆☆ | Tích hợp sẵn bộ hooks phong phú 6, giảm thiểu dependency, đẩy nhanh quá trình code. |
| State Management | Quản lý trạng thái | **Zustand** | Redux, Context API | ★★★★★ (Boilerplate tối thiểu) | ★★★★★ (Rất nhẹ và nhanh) | ★☆☆☆☆ (Cực kỳ đơn giản) | Thiết lập nhanh, API trực quan, hiệu năng vượt trội cho các cập nhật thường xuyên.11 |
| Routing | Định tuyến | **React Router** | \- | ★★★★★ (Tiêu chuẩn ngành) | ★★★★☆ | ★★☆☆☆ | Thư viện mạnh mẽ, đáng tin cậy và phổ biến nhất cho routing trong React.14 |

## **Phần II: Quản lý Dữ liệu và Trạng thái Cốt lõi**

Đây là phần thiết kế và triển khai "bộ não" của ứng dụng, nơi dữ liệu được định nghĩa, lưu trữ và quản lý một cách nhất quán và hiệu quả.

### **Thiết kế Mô hình Dữ liệu Cốt lõi**

Để đáp ứng yêu cầu "full CRUD operations on at least one data type", một mô hình dữ liệu linh hoạt và toàn diện là cần thiết. Thay vì một "task" đơn giản, mô hình dữ liệu AcademicEvent được đề xuất để bao quát tất cả các loại hoạt động mà một sinh viên cần quản lý: từ lịch học, deadline, dự án nhóm cho đến các kế hoạch cá nhân. Việc định nghĩa rõ ràng cấu trúc dữ liệu trung tâm này ngay từ đầu giúp việc triển khai store và các component trở nên nhất quán, đồng thời là tài liệu tham khảo nhanh cho cả logic nghiệp vụ và hiển thị trên giao diện người dùng.

#### **Bảng: Định nghĩa Mô hình Dữ liệu AcademicEvent**

| Tên trường | Kiểu dữ liệu | Mô tả | Ví dụ |
| :---- | :---- | :---- | :---- |
| id | string | ID duy nhất cho mỗi sự kiện (sử dụng crypto.randomUUID()) | a1b2c3d4-e5f6-7890-1234-56789abcdef0 |
| title | string | Tên của sự kiện/nhiệm vụ | "Nộp báo cáo Lịch sử Đảng" |
| type | 'deadline' | 'class' | 'project' | 'personal' | Phân loại sự kiện để lọc và hiển thị màu sắc khác nhau trên lịch | deadline |
| course | string (optional) | Tên môn học liên quan đến sự kiện | "Lịch sử Đảng" |
| startTime | Date | Thời gian bắt đầu của sự kiện/lịch học | new Date('2024-09-20T08:00:00') |
| endTime | Date | Thời gian kết thúc (quan trọng cho lịch học và các sự kiện có khoảng thời gian) | new Date('2024-09-20T17:00:00') |
| status | 'todo' | 'in-progress' | 'done' | Trạng thái của nhiệm vụ, dùng cho bảng Kanban | todo |
| estimatedTime | number (optional) | Thời gian dự kiến hoàn thành (tính bằng giờ), dùng cho phân tích năng suất | 5 |
| actualTime | number (optional) | Thời gian thực tế hoàn thành (tính bằng giờ), dùng cho phân tích năng suất | 8 |

### **Triển khai Zustand Store cho các hoạt động CRUD**

Toàn bộ logic nghiệp vụ liên quan đến việc quản lý dữ liệu AcademicEvent sẽ được tập trung tại một nơi duy nhất: src/store/eventStore.ts. Việc sử dụng Zustand cho phép tạo ra một "nguồn chân lý duy nhất" (Single Source of Truth), giúp các component có thể truy cập và thay đổi dữ liệu một cách nhất quán mà không cần thông qua cơ chế "prop drilling" phức tạp.10 Cách tiếp cận này giúp các UI component trở nên đơn giản hơn, chỉ chịu trách nhiệm hiển thị dữ liệu và gọi các action từ store, làm cho việc gỡ lỗi và bảo trì trở nên dễ dàng hơn rất nhiều, đặc biệt quý giá trong môi trường hackathon có áp lực thời gian.

Store sẽ bao gồm trạng thái (một mảng các AcademicEvent) và các action để thực hiện đầy đủ các hoạt động CRUD 17:

* events: AcademicEvent: Mảng chứa tất cả các sự kiện.  
* addEvent(newEvent: AcademicEvent): Thêm một sự kiện mới vào mảng.  
* updateEvent(eventId: string, updatedData: Partial\<AcademicEvent\>): Tìm một sự kiện theo id và cập nhật các thuộc tính của nó.  
* deleteEvent(eventId: string): Lọc và loại bỏ một sự kiện ra khỏi mảng dựa trên id.  
* getEvents(): Trả về toàn bộ danh sách sự kiện (đây là phần "Read" của CRUD).  
* setEvents(events: AcademicEvent): Một action đặc biệt dùng để khởi tạo hoặc ghi đè toàn bộ trạng thái, rất hữu ích khi tải dữ liệu từ localStorage.

Mã nguồn triển khai store sẽ có dạng như sau:

TypeScript

import { create } from 'zustand';  
import { AcademicEvent } from '@/types';

interface EventStoreState {  
  events: AcademicEvent;  
  addEvent: (event: AcademicEvent) \=\> void;  
  updateEvent: (id: string, updates: Partial\<AcademicEvent\>) \=\> void;  
  deleteEvent: (id: string) \=\> void;  
  setEvents: (events: AcademicEvent) \=\> void;  
}

export const useEventStore \= create\<EventStoreState\>((set) \=\> ({  
  events:,  
  addEvent: (event) \=\> set((state) \=\> ({ events: \[...state.events, event\] })),  
  updateEvent: (id, updates) \=\> set((state) \=\> ({  
    events: state.events.map((event) \=\>  
      event.id \=== id? {...event,...updates } : event  
    ),  
  })),  
  deleteEvent: (id) \=\> set((state) \=\> ({  
    events: state.events.filter((event) \=\> event.id\!== id),  
  })),  
  setEvents: (events) \=\> set({ events }),  
}));

### **Đảm bảo Dữ liệu Bền vững với localStorage**

Để đáp ứng yêu cầu về "persistent storage", localStorage là giải pháp đơn giản và hiệu quả nhất cho một ứng dụng phía client.19 Thay vì gọi

localStorage.setItem một cách thủ công bên trong mỗi action của Zustand, một cơ chế đồng bộ hóa tự động sẽ được thiết lập. Cách tiếp cận này đóng gói toàn bộ logic liên quan đến localStorage, giúp hệ thống trở nên mạnh mẽ, dễ quản lý và ít xảy ra lỗi hơn.

Luồng hoạt động của cơ chế đồng bộ hóa như sau:

1. **Hydration (Nạp dữ liệu)**: Khi ứng dụng được tải lần đầu tiên, một useEffect trong component gốc (ví dụ: App.tsx) sẽ được kích hoạt. Nó sẽ đọc dữ liệu từ localStorage bằng một key định sẵn (ví dụ: "academic-events").20  
2. Nếu có dữ liệu, chuỗi JSON sẽ được phân tích cú pháp (JSON.parse) để chuyển đổi thành một mảng các đối tượng AcademicEvent.21  
3. Action setEvents của Zustand store sẽ được gọi để "hydrate" (làm đầy) trạng thái toàn cục với dữ liệu vừa được khôi phục.  
4. **Persistence (Lưu trữ)**: Một useEffect khác sẽ được sử dụng để "lắng nghe" sự thay đổi của store.events. Bất cứ khi nào mảng này thay đổi (do thêm, sửa, hoặc xóa một sự kiện), trạng thái mới sẽ được chuyển đổi thành chuỗi JSON (JSON.stringify) và được lưu lại vào localStorage, ghi đè lên dữ liệu cũ.21

Cơ chế này đảm bảo rằng mọi thay đổi đối với trạng thái ứng dụng đều được tự động lưu lại, giúp người dùng không bị mất dữ liệu khi làm mới trang hoặc đóng trình duyệt.

## **Phần III: Xây dựng Giao diện Người dùng và các View Bắt buộc**

Phần này tập trung vào việc hiện thực hóa các yêu cầu về giao diện, kết nối lớp dữ liệu đã được thiết kế với một giao diện người dùng phong phú, tương tác và đáp ứng đủ 3 view khác nhau của cùng một bộ dữ liệu.

### **Thiết lập Bố cục và Định tuyến Ứng dụng**

Sử dụng thư viện react-router-dom, hệ thống định tuyến của ứng dụng sẽ được thiết lập trong file App.tsx. Một component MainLayout sẽ được tạo ra để chứa các thành phần giao diện chung như thanh điều hướng (Sidebar) và thanh tiêu đề (Header). Component này sẽ sử dụng \<Outlet /\> của React Router để render nội dung của từng trang con một cách linh hoạt.23

Ba route chính sẽ được định nghĩa, tương ứng với ba view bắt buộc của đề bài:

* /: Route gốc, trỏ đến View 1 (Dashboard).  
* /calendar: Route cho View 2 (Lịch).  
* /analytics: Route cho View 3 (Phân tích).

Cấu trúc router trong App.tsx sẽ tương tự như sau:

JavaScript

import { createBrowserRouter, RouterProvider } from 'react-router-dom';  
import MainLayout from '@/layouts/MainLayout';  
import DashboardPage from '@/pages/DashboardPage';  
import CalendarPage from '@/pages/CalendarPage';  
import AnalyticsPage from '@/pages/AnalyticsPage';

const router \= createBrowserRouter(,  
  },  
\]);

function App() {  
  // Component để hydrate store từ localStorage sẽ được đặt ở đây  
  return \<RouterProvider router\={router} /\>;  
}

### **View 1 \- Dashboard Động (Kanban Board)**

Đây là màn hình chính của ứng dụng, được thiết kế để cung cấp một cái nhìn tổng quan, trực quan và dễ hành động về các công việc của sinh viên. Giao diện sẽ được triển khai dưới dạng một bảng Kanban với ba cột rõ ràng: "Cần làm" (todo), "Đang làm" (in-progress), và "Đã xong" (done).

**Triển khai:**

1. Component DashboardPage sẽ lấy toàn bộ danh sách events từ useEventStore.  
2. Dữ liệu này sẽ được lọc thành ba mảng riêng biệt dựa trên thuộc tính status của mỗi AcademicEvent.  
3. Giao diện sẽ render ba cột, mỗi cột hiển thị danh sách các thẻ công việc (TaskCard) tương ứng.  
4. Để tăng tính tương tác, một thư viện kéo-thả (drag-and-drop) như dnd-kit có thể được tích hợp. Khi người dùng kéo một thẻ công việc từ cột này sang cột khác, action updateEvent sẽ được gọi để cập nhật status của công việc đó trong store, và thay đổi sẽ được tự động lưu vào localStorage.

### **View 2 \- Lịch Tương tác**

View này đáp ứng trực tiếp yêu cầu về "time/date handling" bằng cách cung cấp một lịch biểu đầy đủ, trực quan hóa tất cả các sự kiện, lịch học, và deadline. Để xây dựng một giao diện lịch mạnh mẽ, thư viện react-big-calendar là một lựa chọn phù hợp hơn so với các thư viện date-picker đơn giản, vì nó được thiết kế để xử lý các ứng dụng hiển thị sự kiện phức tạp, tương tự như Google Calendar.24

**Triển khai:**

1. Cài đặt react-big-calendar và các thư viện phụ thuộc cần thiết (ví dụ: moment hoặc date-fns).  
2. Trong component CalendarPage, lấy danh sách events từ Zustand store.  
3. Viết một hàm để chuyển đổi (map) mảng events từ định dạng của ứng dụng sang định dạng mà react-big-calendar yêu cầu (thường là một object với các thuộc tính title, start, và end).  
4. Render component \<Calendar /\> và truyền vào dữ liệu đã được định dạng.  
5. Để tăng tính trực quan, màu sắc của các sự kiện hiển thị trên lịch sẽ được tùy chỉnh dựa trên thuộc tính type (deadline, class, project, personal) của mỗi AcademicEvent.

### **View 3 \- View Phân tích Năng suất**

Đây là view tạo nên sự khác biệt và chiều sâu cho ứng dụng, cung cấp cho sinh viên những thông tin chi tiết về thói quen và hiệu suất học tập của họ. Thay vì chỉ liệt kê công việc, view này giúp người dùng tự phản ánh và cải thiện.

**Triển khai:**

1. Trong component AnalyticsPage, lấy danh sách các events đã hoàn thành (status \=== 'done') từ store.  
2. Tính toán các chỉ số phân tích quan trọng từ dữ liệu này:  
   * **So sánh thời gian dự kiến và thực tế:** Tính tổng estimatedTime và actualTime của các công việc đã hoàn thành. Dữ liệu này sẽ được hiển thị dưới dạng biểu đồ cột để người dùng thấy được họ có xu hướng đánh giá thấp hay cao thời gian cần thiết cho một công việc.  
   * **Phân bổ thời gian theo môn học:** Tính tổng thời gian đã dành cho mỗi course và hiển thị bằng biểu đồ tròn, giúp sinh viên nhận ra môn học nào đang chiếm nhiều thời gian nhất.  
   * **Xu hướng hoàn thành công việc:** Vẽ một biểu đồ đường thể hiện số lượng công việc hoàn thành mỗi ngày trong tuần hoặc tháng qua, giúp xác định các giai đoạn năng suất cao hoặc thấp.  
3. Sử dụng một thư viện biểu đồ nhẹ và dễ sử dụng như Recharts 13 hoặc  
   Chart.js để trực quan hóa các dữ liệu phân tích một cách sinh động.

### **Xây dựng các UI Component Tái sử dụng**

Việc chia nhỏ giao diện thành các component độc lập, có thể tái sử dụng là một chiến lược quan trọng để tăng tốc độ phát triển và đảm bảo tính nhất quán trong một dự án hackathon. Thay vì lặp lại mã giao diện ở nhiều nơi, việc tạo ra các component chung giúp việc sửa đổi và bảo trì trở nên hiệu quả hơn rất nhiều. Các component này sẽ được đặt trong thư mục /components và được xây dựng dựa trên các primitive từ thư viện Mantine.

**Danh sách các component cần thiết:**

* TaskCard.tsx: Một thẻ component để hiển thị thông tin tóm tắt của một AcademicEvent. Component này sẽ được sử dụng trong các cột của bảng Kanban trên Dashboard.  
* EventModal.tsx: Một modal (sử dụng Mantine Modals) chứa form để thêm mới hoặc chỉnh sửa một AcademicEvent. Form bên trong sẽ sử dụng các component của Mantine như TextInput, DatePicker, Select để đảm bảo trải nghiệm người dùng tốt và nhất quán.  
* ColorBadge.tsx: Một component nhỏ hiển thị một badge màu, tương ứng với thuộc tính type của sự kiện, giúp người dùng nhanh chóng phân loại công việc.

## **Phần IV: Tính năng Nâng cao và Chuẩn bị Nộp bài**

Phần cuối cùng này tập trung vào việc tạo ra "yếu tố bất ngờ" để gây ấn tượng với ban giám khảo và đảm bảo dự án được chuẩn bị một cách chuyên nghiệp nhất cho việc nộp bài.

### **Tích hợp AI Sáng tạo: Tạo Nhiệm vụ bằng Ngôn ngữ Tự nhiên**

Đây là tính năng "bonus" giúp dự án thực sự nổi bật và đáp ứng tiêu chí sáng tạo trong việc sử dụng AI. Thay vì bắt người dùng phải điền vào một form dài, họ có thể nhập một câu lệnh tự nhiên, và AI sẽ tự động phân tích và điền thông tin vào các trường tương ứng. Để đảm bảo tính tin cậy và cấu trúc của dữ liệu trả về từ AI, tính năng "Function Calling" của Gemini API sẽ được tận dụng.27 Cách tiếp cận này biến một tác vụ AI có thể không chắc chắn thành một lời gọi API có thể dự đoán được, loại bỏ nhu cầu viết code phân tích chuỗi phức tạp ở phía client.

**Luồng triển khai:**

1. Tạo một ô nhập liệu (TextInput) trong giao diện người dùng để người dùng nhập câu lệnh, ví dụ: *"Nộp báo cáo Triết học vào thứ Sáu tuần này lúc 5 giờ chiều cho môn TRI101"*.  
2. Khi người dùng nhấn nút "Phân tích", ứng dụng sẽ gửi một yêu cầu đến Gemini API. Yêu cầu này bao gồm câu lệnh của người dùng và một định nghĩa về một "hàm" mà chúng ta muốn AI gọi.  
3. Gemini sẽ phân tích câu lệnh và trả về một đối tượng JSON có cấu trúc, chứa tên hàm và các đối số đã được trích xuất.

#### **Bảng: Hợp đồng API Gemini Function Calling**

| Loại | Mô tả |
| :---- | :---- |
| **Function Definition (Gửi đến Gemini)** | {"name": "createAcademicEvent", "description": "Tạo một sự kiện học tập mới từ văn bản", "parameters": {"type": "OBJECT", "properties": {"title": {"type": "STRING", "description": "Tên nhiệm vụ"}, "dueDate": {"type": "STRING", "description": "Ngày hết hạn theo định dạng ISO 8601"}, "course": {"type": "STRING", "description": "Mã hoặc tên môn học"}}, "required":}} |
| **Gemini Response (Dự kiến nhận về)** | {"functionCall": {"name": "createAcademicEvent", "args": {"title": "Nộp báo cáo Triết học", "dueDate": "2024-09-20T17:00:00.000Z", "course": "TRI101"}}} |

4. Khi nhận được phản hồi JSON này, ứng dụng chỉ cần lấy đối tượng args và sử dụng các giá trị của nó để tự động điền vào form trong EventModal hoặc trực tiếp tạo một sự kiện mới bằng cách gọi action addEvent của Zustand.

### **Đảm bảo Hiệu năng và Khả năng Mở rộng**

Yêu cầu của đề bài là ứng dụng phải "hỗ trợ 20+ items mà không bị hỏng". Với các công nghệ hiện đại như React, việc xử lý 20 mục là một nhiệm vụ đơn giản. Tuy nhiên, để thể hiện tư duy kỹ thuật hướng đến khả năng mở rộng và xử lý các trường hợp thực tế với hàng trăm hoặc hàng nghìn mục, kỹ thuật "list virtualization" (ảo hóa danh sách) có thể được áp dụng. Bằng cách sử dụng một thư viện như react-window hoặc react-virtual, ứng dụng sẽ chỉ render các TaskCard đang thực sự hiển thị trong khung nhìn (viewport) của người dùng. Điều này giúp duy trì hiệu suất mượt mà, giảm tải cho trình duyệt và là một điểm cộng kỹ thuật đáng giá, thể hiện sự chuẩn bị cho quy mô lớn hơn.

### **Tài liệu và Triển khai: Danh sách kiểm tra khi nộp bài**

Một sản phẩm tốt cần đi kèm với một gói nộp bài chuyên nghiệp. Đây là bước cuối cùng nhưng không kém phần quan trọng để đảm bảo công sức của cả tuần được trình bày một cách tốt nhất.

* **Tài liệu README.md**:  
  * Soạn thảo một file README chi tiết, rõ ràng theo mẫu được cung cấp.  
  * Bao gồm các phần: Tên dự án, mô tả chi tiết, danh sách các tính năng chính.  
  * **Thêm mục "Lựa chọn Công nghệ"**: Chèn "Ma trận Quyết định" đã tạo ở Phần I và giải thích ngắn gọn lý do chiến lược đằng sau việc chọn Mantine và Zustand.  
  * Cung cấp hướng dẫn cài đặt và chạy dự án ở môi trường local.  
  * Đính kèm liên kết đến bản demo đã được triển khai.  
* **Video Demo**:  
  * Quay một video ngắn gọn (khoảng 1-2 phút) để trình bày các tính năng cốt lõi của ứng dụng.  
  * Bắt đầu bằng tính năng ấn tượng nhất: Tạo nhiệm vụ bằng ngôn ngữ tự nhiên để thu hút sự chú ý ngay từ đầu.  
  * Lần lượt giới thiệu qua 3 view chính: Dashboard (Kanban), Calendar, và Analytics.  
  * Trình diễn các hoạt động CRUD cơ bản: thêm, sửa, xóa và kéo-thả một công việc.  
* **Triển khai (Deployment)**:  
  * Triển khai ứng dụng lên một dịch vụ lưu trữ miễn phí và phổ biến như Vercel hoặc Netlify.  
  * Kiểm tra kỹ lưỡng để đảm bảo liên kết đến bản demo hoạt động ổn định và có thể truy cập công khai.  
  * Rà soát lại tất cả các liên kết trong file README một lần cuối trước khi đến hạn chót nộp bài.

#### **Nguồn trích dẫn**

1. Recommended Folder Structure for React 2025 \- DEV Community, truy cập vào tháng 9 8, 2025, [https://dev.to/pramod\_boda/recommended-folder-structure-for-react-2025-48mc](https://dev.to/pramod_boda/recommended-folder-structure-for-react-2025-48mc)  
2. Creating a Good Folder Structure For Your Vite App \- ThatSoftwareDude.com, truy cập vào tháng 9 8, 2025, [https://www.thatsoftwaredude.com/content/14110/creating-a-good-folder-structure-for-your-vite-app](https://www.thatsoftwaredude.com/content/14110/creating-a-good-folder-structure-for-your-vite-app)  
3. Crafting the Perfect React Project: A Comprehensive Guide to Directory Structure and Essential Libraries | by Sudeep Gumaste | Stackademic, truy cập vào tháng 9 8, 2025, [https://blog.stackademic.com/crafting-the-perfect-react-project-a-comprehensive-guide-to-directory-structure-and-essential-9bb0e32ba7aa](https://blog.stackademic.com/crafting-the-perfect-react-project-a-comprehensive-guide-to-directory-structure-and-essential-9bb0e32ba7aa)  
4. Zustand \- A lightweight state-management solution for React applications \- Younode, truy cập vào tháng 9 8, 2025, [https://younode.com/articles/zustand](https://younode.com/articles/zustand)  
5. Mantine Vs Chakra UI \- By SW Habitation, truy cập vào tháng 9 8, 2025, [https://www.swhabitation.com/comparison/mantine-vs-chakra-ui](https://www.swhabitation.com/comparison/mantine-vs-chakra-ui)  
6. Compare Chakra UI vs. Mantine in 2025 \- Slashdot, truy cập vào tháng 9 8, 2025, [https://slashdot.org/software/comparison/Chakra-UI-vs-Mantine/](https://slashdot.org/software/comparison/Chakra-UI-vs-Mantine/)  
7. Why I Chose Mantine as My Component Library \- In Plain English, truy cập vào tháng 9 8, 2025, [https://plainenglish.io/blog/why-i-chose-mantine-as-my-component-library](https://plainenglish.io/blog/why-i-chose-mantine-as-my-component-library)  
8. React | Context API vs Zustand \- DEV Community, truy cập vào tháng 9 8, 2025, [https://dev.to/shubhamtiwari909/react-context-api-vs-zustand-pki](https://dev.to/shubhamtiwari909/react-context-api-vs-zustand-pki)  
9. React: Context API vs Zustand vs Redux | by Codenova \- Medium, truy cập vào tháng 9 8, 2025, [https://medium.com/@codenova/react-context-api-vs-zustand-vs-redux-472d05afb6ee](https://medium.com/@codenova/react-context-api-vs-zustand-vs-redux-472d05afb6ee)  
10. State Management in 2025: When to Use Context, Redux, Zustand, or Jotai, truy cập vào tháng 9 8, 2025, [https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)  
11. Zustand: Introduction, truy cập vào tháng 9 8, 2025, [https://zustand.docs.pmnd.rs/](https://zustand.docs.pmnd.rs/)  
12. Top 10 React Libraries to Use in 2025 \- Strapi, truy cập vào tháng 9 8, 2025, [https://strapi.io/blog/top-react-libraries](https://strapi.io/blog/top-react-libraries)  
13. Installation | React Router, truy cập vào tháng 9 8, 2025, [https://reactrouter.com/start/library/installation](https://reactrouter.com/start/library/installation)  
14. Simplifying Routing in React with Vite and File-based Routing \- DEV Community, truy cập vào tháng 9 8, 2025, [https://dev.to/franciscomendes10866/file-based-routing-using-vite-and-react-router-3fdo](https://dev.to/franciscomendes10866/file-based-routing-using-vite-and-react-router-3fdo)  
15. Creating Dynamic Routes Using React Router \- Chisom Nnenna's Blog, truy cập vào tháng 9 8, 2025, [https://devzibah.hashnode.dev/creating-dynamic-routes-using-react-router](https://devzibah.hashnode.dev/creating-dynamic-routes-using-react-router)  
16. Simplifying State Management: Implementing CRUD in React JS Using Zustand, truy cập vào tháng 9 8, 2025, [https://www.ninjamonk.in/blog/simplifying-state-management-implementing-crud-in-react-js-using-zustand/](https://www.ninjamonk.in/blog/simplifying-state-management-implementing-crud-in-react-js-using-zustand/)  
17. Build a Full CRUD App Using Zustand \+ Next.js \+ JSON Server \- Tutorial Rays, truy cập vào tháng 9 8, 2025, [https://tutorialrays.in/build-a-full-crud-app-using-zustand-next-js-json-server/](https://tutorialrays.in/build-a-full-crud-app-using-zustand-next-js-json-server/)  
18. Window: localStorage property \- Web APIs \- MDN, truy cập vào tháng 9 8, 2025, [https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)  
19. How to persist state with Local or Session Storage in React ? \- GeeksforGeeks, truy cập vào tháng 9 8, 2025, [https://www.geeksforgeeks.org/reactjs/how-to-persist-state-with-local-or-session-storage-in-react/](https://www.geeksforgeeks.org/reactjs/how-to-persist-state-with-local-or-session-storage-in-react/)  
20. Persisting React State in localStorage Introducing the “useStickyState” hook \- Josh Comeau, truy cập vào tháng 9 8, 2025, [https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/)  
21. Using localStorage with React Hooks \- LogRocket Blog, truy cập vào tháng 9 8, 2025, [https://blog.logrocket.com/using-localstorage-react-hooks/](https://blog.logrocket.com/using-localstorage-react-hooks/)  
22. Vite-React \+ React-Router-Dom: The latest way\!\! | by Galo Hernandez | Medium, truy cập vào tháng 9 8, 2025, [https://medium.com/@galohernandez/vite-react-react-router-dom-the-latest-way-312ee887197e](https://medium.com/@galohernandez/vite-react-react-router-dom-the-latest-way-312ee887197e)  
23. React calendar components: 6 best libraries 2025 \- Builder.io, truy cập vào tháng 9 8, 2025, [https://www.builder.io/blog/best-react-calendar-component-ai](https://www.builder.io/blog/best-react-calendar-component-ai)  
24. Top React calendar component libraries \- Retool Blog, truy cập vào tháng 9 8, 2025, [https://retool.com/blog/best-react-calendar-components](https://retool.com/blog/best-react-calendar-components)  
25. Top React calendar components \- Choosing the best library for your UI \- DronaHQ, truy cập vào tháng 9 8, 2025, [https://www.dronahq.com/top-react-calendar-components/](https://www.dronahq.com/top-react-calendar-components/)  
26. AI Event Scheduler | Gemini API Developer Competition, truy cập vào tháng 9 8, 2025, [https://ai.google.dev/competition/projects/ai-event-scheduler](https://ai.google.dev/competition/projects/ai-event-scheduler)  
27. Function calling with the Gemini API \- YouTube, truy cập vào tháng 9 8, 2025, [https://www.youtube.com/watch?v=mVXrdvXplj0](https://www.youtube.com/watch?v=mVXrdvXplj0)