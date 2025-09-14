import dayjs from './src/utils/dayjs.js';

const today = dayjs('2025-09-14'); // Thứ 7
console.log('=== TEST LOGIC MỚI ===');
console.log('Hôm nay:', today.format('dddd, DD/MM/YYYY'));

// Test logic mới cho "đầu tuần sau"
const nextMonday = today.add(1, 'week').startOf('week');
console.log('Đầu tuần sau (T2):', nextMonday.format('dddd, DD/MM/YYYY'));

// So sánh với logic cũ 
const nextWeekOld = today.add(7, 'day');
console.log('Logic cũ (+ 7 ngày):', nextWeekOld.format('dddd, DD/MM/YYYY'));

console.log('\n=== KẾT QUẢ ===');
console.log('✅ Logic mới "đầu tuần sau":', nextMonday.format('DD/MM/YYYY'));
console.log('❌ Logic cũ "tuần sau":', nextWeekOld.format('DD/MM/YYYY'));