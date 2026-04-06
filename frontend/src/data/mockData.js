export const USERS = [
  { id: 1, email: 'admin@gym.com', password: 'admin123', role: 'admin', name: 'Alex Johnson' },
  { id: 2, email: 'trainer@gym.com', password: 'trainer123', role: 'trainer', name: 'Sarah Williams', trainerId: 1 },
  { id: 3, email: 'member@gym.com', password: 'member123', role: 'member', name: 'Mike Davis', memberId: 1 },
];

export const MEMBERS = [
  { id: 1, name: 'Mike Davis', email: 'mike@example.com', phone: '555-0101', joinDate: '2024-01-15', subscriptionId: 1, trainerId: 1, status: 'active', avatar: 'MD', age: 28, address: '123 Main St' },
  { id: 2, name: 'Emma Wilson', email: 'emma@example.com', phone: '555-0102', joinDate: '2024-02-01', subscriptionId: 2, trainerId: 2, status: 'active', avatar: 'EW', age: 32, address: '456 Oak Ave' },
  { id: 3, name: 'James Brown', email: 'james@example.com', phone: '555-0103', joinDate: '2023-11-10', subscriptionId: 3, trainerId: 1, status: 'active', avatar: 'JB', age: 25, address: '789 Pine Rd' },
  { id: 4, name: 'Olivia Garcia', email: 'olivia@example.com', phone: '555-0104', joinDate: '2024-03-05', subscriptionId: 1, trainerId: 3, status: 'active', avatar: 'OG', age: 29, address: '321 Elm St' },
  { id: 5, name: 'Liam Martinez', email: 'liam@example.com', phone: '555-0105', joinDate: '2023-09-20', subscriptionId: 2, trainerId: 2, status: 'expired', avatar: 'LM', age: 35, address: '654 Maple Dr' },
  { id: 6, name: 'Sophia Lee', email: 'sophia@example.com', phone: '555-0106', joinDate: '2024-01-30', subscriptionId: 4, trainerId: 3, status: 'active', avatar: 'SL', age: 27, address: '987 Cedar Ln' },
  { id: 7, name: 'Noah Taylor', email: 'noah@example.com', phone: '555-0107', joinDate: '2024-02-14', subscriptionId: 1, trainerId: 1, status: 'pending', avatar: 'NT', age: 31, address: '147 Birch Blvd' },
  { id: 8, name: 'Ava Anderson', email: 'ava@example.com', phone: '555-0108', joinDate: '2023-12-01', subscriptionId: 3, trainerId: 2, status: 'active', avatar: 'AA', age: 24, address: '258 Walnut Way' },
];

export const TRAINERS = [
  { id: 1, name: 'Sarah Williams', email: 'sarah@gym.com', phone: '555-0201', specialization: 'Strength & Conditioning', experience: 6, status: 'active', avatar: 'SW', schedule: 'Mon-Fri 6AM-2PM', memberCount: 3, rating: 4.8 },
  { id: 2, name: 'Carlos Rivera', email: 'carlos@gym.com', phone: '555-0202', specialization: 'Yoga & Flexibility', experience: 8, status: 'active', avatar: 'CR', schedule: 'Mon-Sat 8AM-4PM', memberCount: 3, rating: 4.9 },
  { id: 3, name: 'Jessica Kim', email: 'jessica@gym.com', phone: '555-0203', specialization: 'Cardio & HIIT', experience: 4, status: 'active', avatar: 'JK', schedule: 'Tue-Sun 10AM-6PM', memberCount: 2, rating: 4.7 },
  { id: 4, name: 'David Chen', email: 'david@gym.com', phone: '555-0204', specialization: 'CrossFit & Olympic Lifting', experience: 10, status: 'inactive', avatar: 'DC', schedule: 'N/A', memberCount: 0, rating: 4.6 },
];

export const SUBSCRIPTION_PLANS = [
  { id: 1, name: 'Basic', price: 29, duration: 1, features: ['Gym Access', 'Locker Room', '2 Group Classes/month'], color: '#6366f1' },
  { id: 2, name: 'Standard', price: 59, duration: 1, features: ['Gym Access', 'Locker Room', 'Unlimited Group Classes', '1 PT Session/month'], color: '#8b5cf6' },
  { id: 3, name: 'Premium', price: 99, duration: 1, features: ['All Standard', '4 PT Sessions/month', 'Nutrition Consultation', 'Spa Access'], color: '#ec4899' },
  { id: 4, name: 'Annual', price: 799, duration: 12, features: ['All Premium', 'Priority Booking', 'Guest Passes x12', 'Free Merchandise'], color: '#f59e0b' },
];

export const SUBSCRIPTIONS = [
  { id: 1, memberId: 1, planId: 1, startDate: '2024-03-01', endDate: '2024-04-01', status: 'active', amountPaid: 29 },
  { id: 2, memberId: 2, planId: 2, startDate: '2024-02-01', endDate: '2024-03-01', status: 'active', amountPaid: 59 },
  { id: 3, memberId: 3, planId: 3, startDate: '2024-01-01', endDate: '2024-04-01', status: 'active', amountPaid: 99 },
  { id: 4, memberId: 4, planId: 1, startDate: '2024-03-05', endDate: '2024-04-05', status: 'active', amountPaid: 29 },
  { id: 5, memberId: 5, planId: 2, startDate: '2023-09-20', endDate: '2023-10-20', status: 'expired', amountPaid: 59 },
  { id: 6, memberId: 6, planId: 4, startDate: '2024-01-30', endDate: '2025-01-30', status: 'active', amountPaid: 799 },
  { id: 7, memberId: 7, planId: 1, startDate: '2024-02-14', endDate: '2024-03-14', status: 'pending', amountPaid: 0 },
  { id: 8, memberId: 8, planId: 3, startDate: '2023-12-01', endDate: '2024-03-01', status: 'active', amountPaid: 99 },
];

export const ATTENDANCE = [
  { id: 1, memberId: 1, date: '2024-03-25', checkIn: '08:30', checkOut: '10:00' },
  { id: 2, memberId: 2, date: '2024-03-25', checkIn: '09:15', checkOut: '10:45' },
  { id: 3, memberId: 3, date: '2024-03-25', checkIn: '07:00', checkOut: '08:30' },
  { id: 4, memberId: 1, date: '2024-03-24', checkIn: '08:45', checkOut: '10:15' },
  { id: 5, memberId: 4, date: '2024-03-24', checkIn: '10:00', checkOut: '11:30' },
  { id: 6, memberId: 6, date: '2024-03-24', checkIn: '06:30', checkOut: '08:00' },
  { id: 7, memberId: 2, date: '2024-03-23', checkIn: '09:00', checkOut: '10:30' },
  { id: 8, memberId: 8, date: '2024-03-23', checkIn: '17:30', checkOut: '19:00' },
  { id: 9, memberId: 3, date: '2024-03-22', checkIn: '07:15', checkOut: '08:45' },
  { id: 10, memberId: 1, date: '2024-03-22', checkIn: '08:30', checkOut: '10:00' },
];

export const NOTIFICATIONS = [
  { id: 1, type: 'renewal', title: 'Subscription Expiring Soon', message: 'Liam Martinez\'s subscription expires in 3 days.', date: '2024-03-25', read: false, priority: 'high' },
  { id: 2, type: 'payment', title: 'Payment Pending', message: 'Noah Taylor has a pending payment of $29.', date: '2024-03-24', read: false, priority: 'high' },
  { id: 3, type: 'announcement', title: 'New Equipment Arrived', message: 'We\'ve installed 5 new treadmills on floor 2.', date: '2024-03-23', read: true, priority: 'low' },
  { id: 4, type: 'renewal', title: 'Subscription Expired', message: 'Ava Anderson\'s subscription expired yesterday.', date: '2024-03-22', read: false, priority: 'medium' },
  { id: 5, type: 'announcement', title: 'Holiday Hours', message: 'Gym will operate from 8AM-6PM on Easter Sunday.', date: '2024-03-21', read: true, priority: 'low' },
  { id: 6, type: 'trainer', title: 'Trainer Schedule Update', message: 'David Chen is on leave until April 10th.', date: '2024-03-20', read: true, priority: 'medium' },
];

export const REVENUE_DATA = [
  { month: 'Oct', revenue: 4200, expenses: 1800, members: 35 },
  { month: 'Nov', revenue: 4800, expenses: 1900, members: 38 },
  { month: 'Dec', revenue: 5200, expenses: 2100, members: 42 },
  { month: 'Jan', revenue: 6100, expenses: 2000, members: 48 },
  { month: 'Feb', revenue: 5800, expenses: 2200, members: 52 },
  { month: 'Mar', revenue: 6500, expenses: 2100, members: 58 },
];

export const ATTENDANCE_WEEKLY = [
  { day: 'Mon', count: 42 },
  { day: 'Tue', count: 38 },
  { day: 'Wed', count: 55 },
  { day: 'Thu', count: 48 },
  { day: 'Fri', count: 62 },
  { day: 'Sat', count: 71 },
  { day: 'Sun', count: 35 },
];
