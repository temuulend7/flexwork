import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  mn: {
    translation: {
      // Нүүр дэлгэц
      jobs: 'Ажлын зар',
      newJobs: 'Өнөөдөр {{count}} шинэ зар',
      search: 'Ажил, компани, байршил хайх...',
      map: '🗺️ Газрын зураг',
      noJobs: 'Зар олдсонгүй',
      noJobsSub: 'Өөр түлхүүр үгээр хайж үзээрэй',
      resultsCount: '{{count}} зар олдлоо',
      all: 'Бүгд',
      halfDay: 'Хагас өдөр',
      oneHour: '1 цагийн',
      weekend: 'Амралтын өдөр',
      fullDay: 'Бүтэн өдөр',
      // Чат
      chat: 'Чат',
      noChat: 'Одоогоор чат байхгүй байна',
      noChatSub: 'Зар дээр дарж чатлаарай 💬',
      // Зар нэмэх
      manageJobs: 'Зар удирдах',
      addJob: '➕ Зар нэмэх',
      myJobs: '📋 Миний зарууд',
      jobName: 'Ажлын нэр',
      company: 'Компани / Байгууллага',
      location: 'Байршил (хаяг)',
      salary: 'Цалин',
      schedule: 'Цагийн хуваарь',
      jobType: 'Ажлын төрөл',
      mapLocation: 'Байршил (Map дээр)',
      postJob: 'Зар нийтлэх',
      posting: 'Нийтэлж байна...',
      postSuccess: 'Зар нийтлэгдлээ! 🎉',
      // Профайл
      profile: 'Профайл',
      stats: 'Статистик',
      savedJobs: 'Хадгалсан зарууд',
      notifications: 'Мэдэгдлийн тохиргоо',
      changePassword: 'Нууц үг солих',
      help: 'Тусламж',
      logout: 'Гарах',
      employer: '🏢 Ажил олгогч',
      worker: '👷 Ажил хайгч',
      // Нэвтрэх
      login: 'Нэвтрэх',
      register: 'Бүртгүүлэх',
      email: 'И-мэйл',
      password: 'Нууц үг',
      forgotPassword: 'Нууц үг мартсан?',
      noAccount: 'Бүртгэлгүй юу? Бүртгүүлэх',
      hasAccount: 'Бүртгэлтэй юу? Нэвтрэх',
      iam: 'Би:',
    },
  },
  en: {
    translation: {
      // Home
      jobs: 'Job listings',
      newJobs: '{{count}} new jobs today',
      search: 'Search job, company, location...',
      map: '🗺️ Map',
      noJobs: 'No jobs found',
      noJobsSub: 'Try different keywords',
      resultsCount: '{{count}} jobs found',
      all: 'All',
      halfDay: 'Half day',
      oneHour: '1 hour',
      weekend: 'Weekend',
      fullDay: 'Full day',
      // Chat
      chat: 'Chat',
      noChat: 'No chats yet',
      noChatSub: 'Tap on a job to start chatting 💬',
      // Post
      manageJobs: 'Manage jobs',
      addJob: '➕ Add job',
      myJobs: '📋 My jobs',
      jobName: 'Job title',
      company: 'Company / Organization',
      location: 'Location (address)',
      salary: 'Salary',
      schedule: 'Schedule',
      jobType: 'Job type',
      mapLocation: 'Location (on Map)',
      postJob: 'Post job',
      posting: 'Posting...',
      postSuccess: 'Job posted! 🎉',
      // Profile
      profile: 'Profile',
      stats: 'Statistics',
      savedJobs: 'Saved jobs',
      notifications: 'Notification settings',
      changePassword: 'Change password',
      help: 'Help',
      logout: 'Logout',
      employer: '🏢 Employer',
      worker: '👷 Job seeker',
      // Auth
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      noAccount: 'No account? Register',
      hasAccount: 'Have account? Login',
      iam: 'I am:',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'mn',
    fallbackLng: 'mn',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;