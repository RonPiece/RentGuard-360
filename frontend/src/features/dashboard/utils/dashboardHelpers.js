export const getGreeting = (t) => {
    const hour = new Date().getHours();
    if (hour >= 21 || hour < 5) return t('dashboard.greeting.night', 'Good night');
    if (hour < 12) return t('dashboard.greeting.morning', 'Good morning');
    if (hour < 17) return t('dashboard.greeting.afternoon', 'Good afternoon');
    return t('dashboard.greeting.evening', 'Good evening');
};
