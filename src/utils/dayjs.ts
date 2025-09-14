import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import updateLocale from 'dayjs/plugin/updateLocale';

// Load plugins
dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);

// Set Vietnamese locale
dayjs.locale('vi');

// Update locale to start week on Monday (1) instead of Sunday (0)
dayjs.updateLocale('vi', {
  weekStart: 1, // Monday = 1, Sunday = 0
});

export default dayjs;