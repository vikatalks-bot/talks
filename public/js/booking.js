// Booking system

// Generate calendar for a month
const generateCalendar = (year, month, availableDates = []) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendar = document.getElementById('calendar');
  if (!calendar) return;

  calendar.innerHTML = '';

  // Day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = day;
    header.style.fontWeight = 'bold';
    calendar.appendChild(header);
  });

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    calendar.appendChild(empty);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.textContent = day;
    dayDiv.dataset.date = date.toISOString().split('T')[0];

    // Disable past dates
    if (date < today) {
      dayDiv.classList.add('disabled');
    } else {
      dayDiv.addEventListener('click', () => selectDate(date));
    }

    calendar.appendChild(dayDiv);
  }
};

// Select a date
let selectedDate = null;
const selectDate = (date) => {
  // Remove previous selection
  document.querySelectorAll('.calendar-day.selected').forEach(day => {
    day.classList.remove('selected');
  });

  // Add selection to clicked day
  const dateStr = date.toISOString().split('T')[0];
  const dayDiv = document.querySelector(`[data-date="${dateStr}"]`);
  if (dayDiv && !dayDiv.classList.contains('disabled')) {
    dayDiv.classList.add('selected');
    selectedDate = date;
    loadTimeSlots(date);
  }
};

// Load available time slots for a date
const loadTimeSlots = async (date) => {
  // Default time slots (you can customize these)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const slotsContainer = document.getElementById('time-slots');
  if (!slotsContainer) return;

  slotsContainer.innerHTML = '';

  timeSlots.forEach(time => {
    const slotDiv = document.createElement('div');
    slotDiv.className = 'time-slot';
    slotDiv.textContent = time;
    slotDiv.dataset.time = time;
    slotDiv.addEventListener('click', () => selectTime(time));
    slotsContainer.appendChild(slotDiv);
  });
};

// Select a time slot
let selectedTime = null;
const selectTime = (time) => {
  // Remove previous selection
  document.querySelectorAll('.time-slot.selected').forEach(slot => {
    slot.classList.remove('selected');
  });

  // Add selection to clicked slot
  const slotDiv = document.querySelector(`[data-time="${time}"]`);
  if (slotDiv) {
    slotDiv.classList.add('selected');
    selectedTime = time;
  }
};

// Create booking
const createBooking = async (subscriptionId) => {
  if (!selectedDate || !selectedTime) {
    showError('Please select a date and time');
    return;
  }

  try {
    const classDate = selectedDate.toISOString().split('T')[0];
    await bookingsAPI.create(subscriptionId, classDate, selectedTime);
    showSuccess('Booking created successfully!');
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1500);
  } catch (error) {
    showError(error.message || 'Failed to create booking');
  }
};

// Initialize calendar for current month
const initCalendar = () => {
  const now = new Date();
  generateCalendar(now.getFullYear(), now.getMonth());
};

// Show error message
const showError = (message) => {
  alert(message); // You can replace with a better UI
};

// Show success message
const showSuccess = (message) => {
  alert(message); // You can replace with a better UI
};

// Make functions globally available
window.createBooking = createBooking;
window.initCalendar = initCalendar;


