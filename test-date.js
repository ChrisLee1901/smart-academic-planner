import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(weekday);
dayjs.extend(updateLocale);
dayjs.locale('vi');

// Cấu hình tuần bắt đầu từ thứ 2
dayjs.updateLocale('vi', { weekStart: 1 });

// Ngày hiện tại: 14/09/2025 (Thứ 7)
const today = dayjs('2025-09-14');
console.log('=== THÔNG TIN HIỆN TẠI ===');
console.log('Hôm nay:', today.format('dddd, DD/MM/YYYY'));
console.log('Ngày trong tuần:', today.day(), '(0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7)');

console.log('\n=== TÍNH TOÁN TUẦN ===');
// Đầu tuần này (Thứ 2 tuần này)
const startOfThisWeek = today.startOf('week');
console.log('Đầu tuần này (T2):', startOfThisWeek.format('dddd, DD/MM/YYYY'));

// Đầu tuần sau (Thứ 2 tuần sau)
const startOfNextWeek = today.add(1, 'week').startOf('week');
console.log('Đầu tuần sau (T2):', startOfNextWeek.format('dddd, DD/MM/YYYY'));

console.log('\n=== KẾT QUẢ ===');
console.log('Nếu tạo task "đầu tuần sau", task sẽ được đặt vào:', startOfNextWeek.format('DD/MM/YYYY'));