// =========================================
// Sistema Ki Aikido - Calendar Module
// =========================================

// Calendar State
let currentCalendarDate = new Date();
let currentCalendarView = 'month';
let allEvents = [];
let filteredEvents = [];
let selectedEventId = null;

// =========================================
// Calendar Initialization
// =========================================

async function initializeCalendar() {
    // Load dojos for filter
    if (currentUser && currentUser.role === 'admin') {
        const dojoSelect = document.getElementById('filterDojo');
        const eventDojoSelect = document.getElementById('eventDojo');
        
        allDojos.forEach(dojo => {
            const option1 = document.createElement('option');
            option1.value = dojo.id;
            option1.textContent = dojo.name;
            dojoSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = dojo.id;
            option2.textContent = dojo.name;
            eventDojoSelect.appendChild(option2);
        });
    } else if (currentUser && currentUser.dojo_id) {
        // For dojo users, set their dojo as default
        document.getElementById('eventDojo').value = currentUser.dojo_id;
        document.getElementById('filterDojoDiv').style.display = 'none';
    }
    
    // Load events
    await loadEvents();
    
    // Load active reminders
    await loadActiveReminders();
    
    // Render calendar
    renderCalendar();
}

// =========================================
// Event Loading
// =========================================

async function loadEvents() {
    try {
        showLoading();
        
        // Build query parameters from filters
        const params = new URLSearchParams();
        
        const eventType = document.getElementById('filterEventType').value;
        const category = document.getElementById('filterCategory').value;
        const status = document.getElementById('filterStatus').value;
        const recurring = document.getElementById('filterRecurring').value;
        const dojo = document.getElementById('filterDojo')?.value;
        const search = document.getElementById('filterSearch').value;
        
        if (eventType) params.append('event_type', eventType);
        if (category) params.append('category', category);
        if (status) params.append('status', status);
        if (recurring) params.append('is_recurring', recurring);
        if (dojo) params.append('dojo_id', dojo);
        if (search) params.append('search', search);
        
        params.append('per_page', '500'); // Get lots of events for calendar view
        
        const data = await apiRequest(`/events?${params.toString()}`);
        allEvents = data.events || [];
        filteredEvents = allEvents;
        
        hideLoading();
    } catch (error) {
        console.error('Error loading events:', error);
        showNotification('Erro ao carregar eventos: ' + error.message, 'error');
        hideLoading();
    }
}

// =========================================
// Calendar Rendering
// =========================================

function renderCalendar() {
    switch (currentCalendarView) {
        case 'month':
            renderCalendarMonth();
            break;
        case 'week':
            renderCalendarWeek();
            break;
        case 'list':
            renderEventsList();
            break;
    }
    
    updateCalendarPeriodTitle();
}

function renderCalendarMonth() {
    document.getElementById('calendarMonthView').classList.remove('hidden');
    document.getElementById('calendarWeekView').classList.add('hidden');
    document.getElementById('calendarListView').classList.add('hidden');
    
    const grid = document.getElementById('monthCalendarGrid');
    grid.innerHTML = '';
    
    // Add day headers
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    dayNames.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Get month days
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Render 6 weeks
    for (let week = 0; week < 6; week++) {
        for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + (week * 7) + day);
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = currentDate.getTime() === today.getTime();
            
            if (!isCurrentMonth) {
                dayDiv.classList.add('other-month');
            }
            if (isToday) {
                dayDiv.classList.add('today');
            }
            
            // Day number
            const dayNumber = document.createElement('div');
            dayNumber.className = 'calendar-day-number';
            dayNumber.textContent = currentDate.getDate();
            dayDiv.appendChild(dayNumber);
            
            // Events for this day
            const dayEvents = getEventsForDate(currentDate);
            dayEvents.slice(0, 3).forEach(event => {
                const eventDiv = createCalendarEventElement(event);
                dayDiv.appendChild(eventDiv);
            });
            
            // More events indicator
            if (dayEvents.length > 3) {
                const moreDiv = document.createElement('div');
                moreDiv.className = 'more-events-indicator';
                moreDiv.textContent = `+${dayEvents.length - 3} mais`;
                moreDiv.onclick = (e) => {
                    e.stopPropagation();
                    showDayEvents(currentDate, dayEvents);
                };
                dayDiv.appendChild(moreDiv);
            }
            
            // Click to create event on this day
            dayDiv.onclick = () => openEventModal(currentDate);
            
            grid.appendChild(dayDiv);
        }
    }
}

function renderCalendarWeek() {
    document.getElementById('calendarMonthView').classList.add('hidden');
    document.getElementById('calendarWeekView').classList.remove('hidden');
    document.getElementById('calendarListView').classList.add('hidden');
    
    // Simplified week view - just show as list for now
    renderEventsList();
}

function renderEventsList() {
    document.getElementById('calendarMonthView').classList.add('hidden');
    document.getElementById('calendarWeekView').classList.add('hidden');
    document.getElementById('calendarListView').classList.remove('hidden');
    
    const container = document.getElementById('eventsListContainer');
    container.innerHTML = '';
    
    if (filteredEvents.length === 0) {
        container.innerHTML = `
            <div class="card p-8 text-center text-gray-500">
                <i class="fas fa-calendar-times text-4xl mb-3"></i>
                <p class="font-medium">Nenhum evento encontrado</p>
            </div>
        `;
        return;
    }
    
    // Sort events by date
    const sortedEvents = [...filteredEvents].sort((a, b) => 
        new Date(a.start_datetime) - new Date(b.start_datetime)
    );
    
    sortedEvents.forEach(event => {
        const eventDiv = createEventListItem(event);
        container.appendChild(eventDiv);
    });
}

// =========================================
// Helper Functions
// =========================================

function getEventsForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => {
        const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
        return eventDate === dateStr;
    });
}

function createCalendarEventElement(event) {
    const div = document.createElement('div');
    div.className = `calendar-event event-${event.category}`;
    
    if (event.status === 'suspended') {
        div.classList.add('event-suspended');
    } else if (event.status === 'cancelled') {
        div.classList.add('event-cancelled');
    }
    
    if (event.is_recurring) {
        div.classList.add('event-recurring');
    }
    
    const startTime = new Date(event.start_datetime).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    div.textContent = `${startTime} ${event.title}`;
    div.title = event.title;
    
    div.onclick = (e) => {
        e.stopPropagation();
        showEventDetails(event.id);
    };
    
    return div;
}

function createEventListItem(event) {
    const div = document.createElement('div');
    div.className = 'event-list-item';
    div.onclick = () => showEventDetails(event.id);
    
    const startDate = new Date(event.start_datetime);
    const endDate = new Date(event.end_datetime);
    
    div.innerHTML = `
        <div class="flex gap-4">
            <div class="event-list-date">
                <div class="event-list-day">${startDate.getDate()}</div>
                <div class="event-list-month">${startDate.toLocaleDateString('pt-BR', { month: 'short' })}</div>
            </div>
            <div class="flex-1">
                <div class="flex items-start justify-between mb-2">
                    <h4 class="text-lg font-bold text-gray-800">${event.title}</h4>
                    <div class="flex gap-2">
                        <span class="event-badge badge-${event.event_type}">${event.event_type === 'admin' ? 'Admin' : 'Dojo'}</span>
                        <span class="event-badge badge-${event.reminder_priority}">${getPriorityLabel(event.reminder_priority)}</span>
                        ${event.is_recurring ? '<span class="event-badge badge-recurring"><i class="fas fa-redo mr-1"></i>Recorrente</span>' : ''}
                        <span class="event-badge badge-${event.status}">${getStatusLabel(event.status)}</span>
                    </div>
                </div>
                <p class="text-sm text-gray-600 mb-2">${event.description || 'Sem descrição'}</p>
                <div class="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span><i class="fas fa-clock mr-1"></i>${startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    ${event.location ? `<span><i class="fas fa-map-marker-alt mr-1"></i>${event.location}</span>` : ''}
                    <span><i class="fas fa-tag mr-1"></i>${getCategoryLabel(event.category)}</span>
                    ${event.dojo_name ? `<span><i class="fas fa-building mr-1"></i>${event.dojo_name}</span>` : ''}
                </div>
            </div>
        </div>
    `;
    
    return div;
}

function updateCalendarPeriodTitle() {
    const titleEl = document.getElementById('calendarPeriodTitle');
    
    switch (currentCalendarView) {
        case 'month':
            const monthName = currentCalendarDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            titleEl.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            break;
        case 'week':
            titleEl.textContent = 'Semana';
            break;
        case 'list':
            titleEl.textContent = 'Lista de Eventos';
            break;
    }
}

// =========================================
// Calendar Navigation
// =========================================

function changeCalendarView() {
    currentCalendarView = document.getElementById('calendarView').value;
    renderCalendar();
}

function previousPeriod() {
    if (currentCalendarView === 'month') {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    } else if (currentCalendarView === 'week') {
        currentCalendarDate.setDate(currentCalendarDate.getDate() - 7);
    }
    renderCalendar();
}

function nextPeriod() {
    if (currentCalendarView === 'month') {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    } else if (currentCalendarView === 'week') {
        currentCalendarDate.setDate(currentCalendarDate.getDate() + 7);
    }
    renderCalendar();
}

// =========================================
// Filters
// =========================================

async function applyEventFilters() {
    await loadEvents();
    renderCalendar();
}

function clearEventFilters() {
    document.getElementById('filterEventType').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterRecurring').value = '';
    if (document.getElementById('filterDojo')) {
        document.getElementById('filterDojo').value = '';
    }
    document.getElementById('filterSearch').value = '';
    
    applyEventFilters();
}

// =========================================
// Event Modal
// =========================================

function openEventModal(date = null) {
    selectedEventId = null;
    document.getElementById('eventModalTitle').textContent = 'Novo Evento';
    document.getElementById('eventSaveButtonText').textContent = 'Salvar';
    document.getElementById('eventForm').reset();
    document.getElementById('eventId').value = '';
    
    // Set default date if provided
    if (date) {
        const dateStr = date.toISOString().slice(0, 16);
        document.getElementById('eventStartDate').value = dateStr;
        const endDate = new Date(date);
        endDate.setHours(date.getHours() + 2);
        document.getElementById('eventEndDate').value = endDate.toISOString().slice(0, 16);
    }
    
    // Set default type based on user
    if (currentUser) {
        if (currentUser.role === 'admin') {
            document.getElementById('eventType').value = '';
        } else {
            document.getElementById('eventType').value = 'dojo';
            document.getElementById('eventDojo').value = currentUser.dojo_id;
        }
    }
    
    toggleDojoField();
    toggleRecurrenceFields();
    
    document.getElementById('eventModal').classList.remove('hidden');
    document.getElementById('eventModal').classList.add('flex');
}

function closeEventModal() {
    document.getElementById('eventModal').classList.add('hidden');
    document.getElementById('eventModal').classList.remove('flex');
}

function toggleDojoField() {
    const eventType = document.getElementById('eventType').value;
    const dojoDiv = document.getElementById('eventDojoDiv');
    const dojoSelect = document.getElementById('eventDojo');
    
    if (eventType === 'dojo') {
        dojoDiv.classList.remove('hidden');
        dojoSelect.required = true;
    } else {
        dojoDiv.classList.add('hidden');
        dojoSelect.required = false;
        dojoSelect.value = '';
    }
}

function toggleRecurrenceFields() {
    const recurring = document.getElementById('eventRecurring').checked;
    const fields = document.getElementById('recurrenceFields');
    
    if (recurring) {
        fields.classList.remove('hidden');
    } else {
        fields.classList.add('hidden');
    }
}

// =========================================
// Event Form Submission
// =========================================

document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        showLoading();
        
        const eventData = {
            title: document.getElementById('eventTitle').value,
            description: document.getElementById('eventDescription').value,
            event_type: document.getElementById('eventType').value,
            category: document.getElementById('eventCategory').value,
            start_datetime: document.getElementById('eventStartDate').value,
            end_datetime: document.getElementById('eventEndDate').value,
            location: document.getElementById('eventLocation').value,
            all_day: document.getElementById('eventAllDay').checked,
            reminder_priority: document.getElementById('eventPriority').value,
            create_default_reminders: document.getElementById('eventCreateReminders').checked
        };
        
        if (eventData.event_type === 'dojo') {
            eventData.dojo_id = parseInt(document.getElementById('eventDojo').value);
        }
        
        // Recurrence data
        if (document.getElementById('eventRecurring').checked) {
            eventData.is_recurring = true;
            eventData.recurrence_pattern = document.getElementById('recurrencePattern').value;
            eventData.recurrence_interval = parseInt(document.getElementById('recurrenceInterval').value);
            
            // Get selected days
            const selectedDays = Array.from(document.querySelectorAll('.recurrence-day:checked'))
                .map(cb => cb.value)
                .join(',');
            if (selectedDays) {
                eventData.recurrence_days = selectedDays;
            }
            
            const endDate = document.getElementById('recurrenceEndDate').value;
            if (endDate) {
                eventData.recurrence_end_date = endDate + 'T23:59:59';
            }
        }
        
        const eventId = document.getElementById('eventId').value;
        let result;
        
        if (eventId) {
            // Update
            result = await apiRequest(`/events/${eventId}`, {
                method: 'PUT',
                body: JSON.stringify(eventData)
            });
            showNotification('Evento atualizado com sucesso!', 'success');
        } else {
            // Create
            result = await apiRequest('/events', {
                method: 'POST',
                body: JSON.stringify(eventData)
            });
            showNotification('Evento criado com sucesso!', 'success');
        }
        
        closeEventModal();
        await loadEvents();
        renderCalendar();
        hideLoading();
    } catch (error) {
        console.error('Error saving event:', error);
        showNotification('Erro ao salvar evento: ' + error.message, 'error');
        hideLoading();
    }
});

// =========================================
// Event Details
// =========================================

async function showEventDetails(eventId) {
    try {
        showLoading();
        const event = await apiRequest(`/events/${eventId}`);
        selectedEventId = eventId;
        
        document.getElementById('eventDetailsTitle').textContent = event.title;
        
        const content = document.getElementById('eventDetailsContent');
        const startDate = new Date(event.start_datetime);
        const endDate = new Date(event.end_datetime);
        
        content.innerHTML = `
            <div class="space-y-6">
                <div class="flex gap-2 flex-wrap">
                    <span class="event-badge badge-${event.event_type}">${event.event_type === 'admin' ? 'Administrativo' : 'Dojo'}</span>
                    <span class="event-badge badge-${event.reminder_priority}">${getPriorityLabel(event.reminder_priority)}</span>
                    <span class="event-badge badge-${event.status}">${getStatusLabel(event.status)}</span>
                    ${event.is_recurring ? '<span class="event-badge badge-recurring"><i class="fas fa-redo mr-1"></i>Recorrente</span>' : ''}
                </div>
                
                ${event.description ? `<div><p class="text-gray-700">${event.description}</p></div>` : ''}
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Categoria</p>
                        <p class="text-gray-800 font-medium">${getCategoryLabel(event.category)}</p>
                    </div>
                    
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Data/Hora</p>
                        <p class="text-gray-800">${startDate.toLocaleString('pt-BR')}</p>
                        <p class="text-gray-600 text-sm">até ${endDate.toLocaleString('pt-BR')}</p>
                    </div>
                    
                    ${event.location ? `
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Local</p>
                        <p class="text-gray-800">${event.location}</p>
                    </div>
                    ` : ''}
                    
                    ${event.dojo_name ? `
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Dojo</p>
                        <p class="text-gray-800">${event.dojo_name}</p>
                    </div>
                    ` : ''}
                    
                    ${event.suspension_reason ? `
                    <div class="md:col-span-2">
                        <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Motivo da Suspensão</p>
                        <p class="text-gray-800">${event.suspension_reason}</p>
                    </div>
                    ` : ''}
                </div>
                
                ${event.is_recurring ? `
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h4 class="font-bold text-gray-800 mb-2"><i class="fas fa-redo mr-2"></i>Recorrência</h4>
                    <p class="text-sm text-gray-700">
                        ${getRecurrenceDescription(event)}
                    </p>
                </div>
                ` : ''}
                
                ${event.reminders && event.reminders.length > 0 ? `
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-bold text-gray-800 mb-2"><i class="fas fa-bell mr-2"></i>Avisos Configurados</h4>
                    <div class="space-y-1">
                        ${event.reminders.map(r => `
                            <p class="text-sm text-gray-700">• ${r.days_before} dias antes - ${r.reminder_type}</p>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        // Update buttons based on status
        if (event.status === 'suspended') {
            document.getElementById('btnSuspendEvent').classList.add('hidden');
            document.getElementById('btnReactivateEvent').classList.remove('hidden');
        } else {
            document.getElementById('btnSuspendEvent').classList.remove('hidden');
            document.getElementById('btnReactivateEvent').classList.add('hidden');
        }
        
        document.getElementById('eventDetailsModal').classList.remove('hidden');
        document.getElementById('eventDetailsModal').classList.add('flex');
        hideLoading();
    } catch (error) {
        console.error('Error loading event details:', error);
        showNotification('Erro ao carregar detalhes do evento', 'error');
        hideLoading();
    }
}

function closeEventDetailsModal() {
    document.getElementById('eventDetailsModal').classList.add('hidden');
    document.getElementById('eventDetailsModal').classList.remove('flex');
}

async function editEventFromDetails() {
    if (!selectedEventId) return;
    
    try {
        showLoading();
        const event = await apiRequest(`/events/${selectedEventId}`);
        
        closeEventDetailsModal();
        
        // Populate form
        document.getElementById('eventModalTitle').textContent = 'Editar Evento';
        document.getElementById('eventSaveButtonText').textContent = 'Atualizar';
        document.getElementById('eventId').value = event.id;
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventType').value = event.event_type;
        document.getElementById('eventCategory').value = event.category;
        document.getElementById('eventPriority').value = event.reminder_priority;
        document.getElementById('eventStartDate').value = event.start_datetime.slice(0, 16);
        document.getElementById('eventEndDate').value = event.end_datetime.slice(0, 16);
        document.getElementById('eventLocation').value = event.location || '';
        document.getElementById('eventAllDay').checked = event.all_day;
        
        if (event.event_type === 'dojo' && event.dojo_id) {
            document.getElementById('eventDojo').value = event.dojo_id;
        }
        
        toggleDojoField();
        
        document.getElementById('eventModal').classList.remove('hidden');
        document.getElementById('eventModal').classList.add('flex');
        hideLoading();
    } catch (error) {
        console.error('Error loading event for edit:', error);
        showNotification('Erro ao carregar evento', 'error');
        hideLoading();
    }
}

async function deleteEventFromDetails() {
    if (!selectedEventId) return;
    
    if (!confirm('Tem certeza que deseja deletar este evento?')) {
        return;
    }
    
    try {
        showLoading();
        await apiRequest(`/events/${selectedEventId}`, { method: 'DELETE' });
        showNotification('Evento deletado com sucesso!', 'success');
        closeEventDetailsModal();
        await loadEvents();
        renderCalendar();
        hideLoading();
    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification('Erro ao deletar evento: ' + error.message, 'error');
        hideLoading();
    }
}

// =========================================
// Event Suspension
// =========================================

function suspendEventFromDetails() {
    if (!selectedEventId) return;
    
    document.getElementById('suspendEventId').value = selectedEventId;
    document.getElementById('suspendReason').value = '';
    
    closeEventDetailsModal();
    document.getElementById('suspendEventModal').classList.remove('hidden');
    document.getElementById('suspendEventModal').classList.add('flex');
}

function closeSuspendEventModal() {
    document.getElementById('suspendEventModal').classList.add('hidden');
    document.getElementById('suspendEventModal').classList.remove('flex');
}

document.getElementById('suspendEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const eventId = document.getElementById('suspendEventId').value;
    const reason = document.getElementById('suspendReason').value;
    
    try {
        showLoading();
        await apiRequest(`/events/${eventId}/suspend`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
        showNotification('Evento suspenso com sucesso!', 'success');
        closeSuspendEventModal();
        await loadEvents();
        renderCalendar();
        hideLoading();
    } catch (error) {
        console.error('Error suspending event:', error);
        showNotification('Erro ao suspender evento: ' + error.message, 'error');
        hideLoading();
    }
});

async function reactivateEventFromDetails() {
    if (!selectedEventId) return;
    
    try {
        showLoading();
        await apiRequest(`/events/${selectedEventId}/reactivate`, {
            method: 'POST'
        });
        showNotification('Evento reativado com sucesso!', 'success');
        closeEventDetailsModal();
        await loadEvents();
        renderCalendar();
        hideLoading();
    } catch (error) {
        console.error('Error reactivating event:', error);
        showNotification('Erro ao reativar evento: ' + error.message, 'error');
        hideLoading();
    }
}

// =========================================
// Reminders
// =========================================

async function loadActiveReminders() {
    try {
        const data = await apiRequest('/events/reminders/active');
        const reminders = data.reminders || [];
        
        updateReminderBadge(reminders.length);
        
        if (reminders.length > 0) {
            showReminderBanner(reminders);
        }
    } catch (error) {
        console.error('Error loading active reminders:', error);
    }
}

function updateReminderBadge(count) {
    const badge = document.getElementById('calendarBadge');
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function showReminderBanner(reminders) {
    const banner = document.getElementById('reminderBanner');
    const content = document.getElementById('reminderBannerContent');
    
    if (reminders.length === 0) {
        banner.classList.add('hidden');
        return;
    }
    
    const firstReminder = reminders[0];
    const event = firstReminder.event;
    
    content.innerHTML = `
        <div>
            <p class="font-bold">${firstReminder.message || 'Lembrete de Evento'}</p>
            <p class="text-sm">${event.title} - ${new Date(event.start_datetime).toLocaleDateString('pt-BR')}</p>
        </div>
    `;
    
    banner.classList.remove('hidden');
}

function hideReminderBanner() {
    document.getElementById('reminderBanner').classList.add('hidden');
}

// =========================================
// Helper Functions
// =========================================

function getCategoryLabel(category) {
    const labels = {
        'exame': 'Exame',
        'seminario': 'Seminário',
        'aula_especial': 'Aula Especial',
        'aula_regular': 'Aula Regular',
        'evento_social': 'Evento Social',
        'aviso': 'Aviso',
        'outro': 'Outro'
    };
    return labels[category] || category;
}

function getStatusLabel(status) {
    const labels = {
        'active': 'Ativo',
        'suspended': 'Suspenso',
        'cancelled': 'Cancelado',
        'completed': 'Concluído'
    };
    return labels[status] || status;
}

function getPriorityLabel(priority) {
    const labels = {
        'high': 'Alta',
        'medium': 'Média',
        'low': 'Baixa'
    };
    return labels[priority] || priority;
}

function getRecurrenceDescription(event) {
    const patterns = {
        'daily': 'Diariamente',
        'weekly': 'Semanalmente',
        'monthly': 'Mensalmente',
        'yearly': 'Anualmente'
    };
    
    let desc = patterns[event.recurrence_pattern] || event.recurrence_pattern;
    
    if (event.recurrence_interval > 1) {
        desc += ` a cada ${event.recurrence_interval} período(s)`;
    }
    
    if (event.recurrence_days) {
        const dayNames = { '0': 'Dom', '1': 'Seg', '2': 'Ter', '3': 'Qua', '4': 'Qui', '5': 'Sex', '6': 'Sáb' };
        const days = event.recurrence_days.split(',').map(d => dayNames[d]).join(', ');
        desc += ` - ${days}`;
    }
    
    if (event.recurrence_end_date) {
        desc += ` até ${new Date(event.recurrence_end_date).toLocaleDateString('pt-BR')}`;
    }
    
    return desc;
}

function showDayEvents(date, events) {
    // For now, just show in list view
    // Could create a modal with day events in the future
    alert(`${events.length} eventos em ${date.toLocaleDateString('pt-BR')}`);
}
