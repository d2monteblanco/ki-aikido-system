from flask import Blueprint, request, jsonify
from src.models import db, Event, EventReminder, EventOccurrence, User, Dojo
from src.routes.auth import login_required
from datetime import datetime, timedelta
import uuid

events_bp = Blueprint('events', __name__)


def generate_recurring_occurrences(event):
    """Gera as ocorrências de um evento recorrente"""
    if not event.is_recurring:
        return
    
    # Limpar ocorrências existentes
    EventOccurrence.query.filter_by(event_id=event.id).delete()
    
    occurrences = []
    current_date = event.start_datetime
    duration = event.end_datetime - event.start_datetime
    
    # Definir limite máximo de ocorrências se não houver recurrence_count
    max_occurrences = event.recurrence_count if event.recurrence_count else 100
    occurrence_counter = 0
    
    # Data limite
    end_limit = event.recurrence_end_date if event.recurrence_end_date else (current_date + timedelta(days=365))
    
    # Para recorrência semanal com dias específicos, precisamos de lógica especial
    if event.recurrence_pattern == 'weekly' and event.recurrence_days:
        allowed_days = [int(d) for d in event.recurrence_days.split(',')]
        
        # Começar da data inicial e iterar dia por dia
        current_date = event.start_datetime.replace(hour=event.start_datetime.hour, minute=event.start_datetime.minute)
        
        while occurrence_counter < max_occurrences and current_date <= end_limit:
            if current_date.weekday() in allowed_days:
                occurrence = EventOccurrence(
                    event_id=event.id,
                    series_id=event.series_id,
                    occurrence_date=current_date,
                    end_datetime=current_date + duration,
                    status='active'
                )
                occurrences.append(occurrence)
                occurrence_counter += 1
            
            # Avançar 1 dia
            current_date += timedelta(days=1)
            
            # Se já temos ocorrências suficientes ou passamos da data limite, parar
            if occurrence_counter >= max_occurrences or current_date > end_limit:
                break
    else:
        # Lógica para outros padrões de recorrência
        while occurrence_counter < max_occurrences and current_date <= end_limit:
            # Verificar se esta data deve ser incluída baseado no padrão
            should_include = False
            
            if event.recurrence_pattern == 'daily':
                should_include = True
            
            elif event.recurrence_pattern == 'weekly':
                # Sem dias específicos, usar o dia da semana do evento original
                if current_date.weekday() == event.start_datetime.weekday():
                    should_include = True
            
            elif event.recurrence_pattern == 'monthly':
                # Mesmo dia do mês
                if current_date.day == event.start_datetime.day:
                    should_include = True
            
            elif event.recurrence_pattern == 'yearly':
                # Mesmo dia e mês
                if current_date.month == event.start_datetime.month and current_date.day == event.start_datetime.day:
                    should_include = True
            
            if should_include:
                occurrence = EventOccurrence(
                    event_id=event.id,
                    series_id=event.series_id,
                    occurrence_date=current_date,
                    end_datetime=current_date + duration,
                    status='active'
                )
                occurrences.append(occurrence)
                occurrence_counter += 1
            
            # Avançar para próxima data baseado no intervalo e padrão
            if event.recurrence_pattern == 'daily':
                current_date += timedelta(days=event.recurrence_interval)
            elif event.recurrence_pattern == 'weekly':
                current_date += timedelta(weeks=event.recurrence_interval)
            elif event.recurrence_pattern == 'monthly':
                # Adicionar meses (aproximado)
                month = current_date.month + event.recurrence_interval
                year = current_date.year
                while month > 12:
                    month -= 12
                    year += 1
                try:
                    current_date = current_date.replace(year=year, month=month)
                except ValueError:
                    # Se o dia não existe no mês (ex: 31 de fevereiro), usar último dia do mês
                    import calendar
                    last_day = calendar.monthrange(year, month)[1]
                    current_date = current_date.replace(year=year, month=month, day=last_day)
            elif event.recurrence_pattern == 'yearly':
                current_date = current_date.replace(year=current_date.year + event.recurrence_interval)
    
    # Adicionar todas as ocorrências ao banco
    for occurrence in occurrences:
        db.session.add(occurrence)
    
    return len(occurrences)


def can_edit_event(user, event):
    """Verifica se o usuário pode editar o evento"""
    # Admin pode editar tudo
    if user.role == 'admin':
        return True
    
    # Eventos admin só podem ser editados por admin
    if event.event_type == 'admin':
        return False
    
    # Dojo pode editar seus próprios eventos
    if event.event_type == 'dojo' and user.dojo_id == event.dojo_id:
        return True
    
    return False


@events_bp.route('/events', methods=['GET'])
@login_required
def get_events():
    """Lista eventos com filtros"""
    try:
        user_id = request.current_user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Construir query base
        query = Event.query
        
        # Filtros
        event_type = request.args.get('event_type')
        dojo_id = request.args.get('dojo_id')
        category = request.args.get('category')
        status = request.args.get('status')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        is_recurring = request.args.get('is_recurring')
        search = request.args.get('search')
        
        # Aplicar filtros
        if event_type:
            query = query.filter(Event.event_type == event_type)
        
        if dojo_id:
            query = query.filter(Event.dojo_id == dojo_id)
        
        if category:
            query = query.filter(Event.category == category)
        
        if status:
            query = query.filter(Event.status == status)
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(Event.start_datetime >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(Event.end_datetime <= end_dt)
        
        if is_recurring is not None:
            is_rec = is_recurring.lower() == 'true'
            query = query.filter(Event.is_recurring == is_rec)
        
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                db.or_(
                    Event.title.ilike(search_pattern),
                    Event.description.ilike(search_pattern)
                )
            )
        
        # Ordenação
        sort_by = request.args.get('sort_by', 'start_datetime')
        sort_order = request.args.get('sort_order', 'asc')
        
        if sort_by == 'start_datetime':
            query = query.order_by(Event.start_datetime.asc() if sort_order == 'asc' else Event.start_datetime.desc())
        elif sort_by == 'title':
            query = query.order_by(Event.title.asc() if sort_order == 'asc' else Event.title.desc())
        elif sort_by == 'event_type':
            query = query.order_by(Event.event_type.asc() if sort_order == 'asc' else Event.event_type.desc())
        
        # Paginação
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        events = pagination.items
        
        # Se solicitado, expandir eventos recorrentes com suas ocorrências
        expand_occurrences = request.args.get('expand_occurrences', 'false').lower() == 'true'
        
        events_data = []
        for event in events:
            event_dict = event.to_dict()
            
            if expand_occurrences and event.is_recurring:
                # Buscar ocorrências futuras (próximos 90 dias)
                today = datetime.utcnow()
                future_limit = today + timedelta(days=90)
                
                occurrences = EventOccurrence.query.filter(
                    EventOccurrence.event_id == event.id,
                    EventOccurrence.occurrence_date >= today,
                    EventOccurrence.occurrence_date <= future_limit
                ).order_by(EventOccurrence.occurrence_date.asc()).limit(20).all()
                
                event_dict['upcoming_occurrences'] = [occ.to_dict() for occ in occurrences]
            
            events_data.append(event_dict)
        
        return jsonify({
            'events': events_data,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@events_bp.route('/events/<int:event_id>', methods=['GET'])
@login_required
def get_event(event_id):
    """Obtém detalhes de um evento específico"""
    try:
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({'error': 'Evento não encontrado'}), 404
        
        event_dict = event.to_dict()
        
        # Incluir avisos
        event_dict['reminders'] = [reminder.to_dict() for reminder in event.reminders]
        
        return jsonify(event_dict), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@events_bp.route('/events', methods=['POST'])
@login_required
def create_event():
    """Cria um novo evento"""
    try:
        user_id = request.current_user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        data = request.get_json()
        
        # Validações
        if not data.get('title'):
            return jsonify({'error': 'Título é obrigatório'}), 400
        
        if not data.get('category'):
            return jsonify({'error': 'Categoria é obrigatória'}), 400
        
        if not data.get('event_type'):
            return jsonify({'error': 'Tipo de evento é obrigatório'}), 400
        
        if not data.get('start_datetime'):
            return jsonify({'error': 'Data/hora de início é obrigatória'}), 400
        
        if not data.get('end_datetime'):
            return jsonify({'error': 'Data/hora de término é obrigatória'}), 400
        
        # Verificar permissões
        event_type = data.get('event_type')
        
        if event_type == 'admin' and user.role != 'admin':
            return jsonify({'error': 'Apenas administradores podem criar eventos administrativos'}), 403
        
        if event_type == 'dojo':
            dojo_id = data.get('dojo_id')
            if not dojo_id:
                return jsonify({'error': 'dojo_id é obrigatório para eventos de dojo'}), 400
            
            # Verificar se é admin ou se é do próprio dojo
            if user.role != 'admin' and user.dojo_id != dojo_id:
                return jsonify({'error': 'Você só pode criar eventos para seu próprio dojo'}), 403
        
        # Criar evento
        event = Event(
            title=data.get('title'),
            description=data.get('description'),
            category=data.get('category'),
            event_type=event_type,
            dojo_id=data.get('dojo_id'),
            start_datetime=datetime.fromisoformat(data.get('start_datetime')),
            end_datetime=datetime.fromisoformat(data.get('end_datetime')),
            all_day=data.get('all_day', False),
            location=data.get('location'),
            reminder_priority=data.get('reminder_priority', 'medium'),
            created_by=user_id
        )
        
        # Recorrência
        if data.get('is_recurring'):
            event.is_recurring = True
            event.recurrence_pattern = data.get('recurrence_pattern')
            event.recurrence_interval = data.get('recurrence_interval', 1)
            event.recurrence_days = data.get('recurrence_days')
            event.recurrence_end_date = datetime.fromisoformat(data['recurrence_end_date']) if data.get('recurrence_end_date') else None
            event.recurrence_count = data.get('recurrence_count')
            event.series_id = str(uuid.uuid4())
        
        db.session.add(event)
        db.session.flush()  # Para obter o ID
        
        # Criar avisos padrão se solicitado
        if data.get('create_default_reminders'):
            default_days = [7, 3, 1, 0]  # 1 semana, 3 dias, 1 dia, no dia
            for days in default_days:
                reminder = EventReminder(
                    event_id=event.id,
                    days_before=days,
                    reminder_type='banner',
                    is_active=True
                )
                db.session.add(reminder)
        
        # Gerar ocorrências para eventos recorrentes
        occurrences_count = 0
        if event.is_recurring:
            occurrences_count = generate_recurring_occurrences(event)
        
        db.session.commit()
        
        response_data = {
            'message': 'Evento criado com sucesso',
            'event': event.to_dict()
        }
        
        if occurrences_count > 0:
            response_data['message'] += f' ({occurrences_count} ocorrências geradas)'
            response_data['occurrences_count'] = occurrences_count
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@events_bp.route('/events/<int:event_id>', methods=['PUT'])
@login_required
def update_event(event_id):
    """Atualiza um evento"""
    try:
        user_id = request.current_user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({'error': 'Evento não encontrado'}), 404
        
        # Verificar permissões
        if not can_edit_event(user, event):
            return jsonify({'error': 'Você não tem permissão para editar este evento'}), 403
        
        data = request.get_json()
        
        # Atualizar campos
        if 'title' in data:
            event.title = data['title']
        if 'description' in data:
            event.description = data['description']
        if 'category' in data:
            event.category = data['category']
        if 'start_datetime' in data:
            event.start_datetime = datetime.fromisoformat(data['start_datetime'])
        if 'end_datetime' in data:
            event.end_datetime = datetime.fromisoformat(data['end_datetime'])
        if 'all_day' in data:
            event.all_day = data['all_day']
        if 'location' in data:
            event.location = data['location']
        if 'reminder_priority' in data:
            event.reminder_priority = data['reminder_priority']
        if 'status' in data:
            event.status = data['status']
        if 'suspension_reason' in data:
            event.suspension_reason = data['suspension_reason']
        
        # Atualizar recorrência se necessário
        recurrence_changed = False
        if 'recurrence_pattern' in data:
            event.recurrence_pattern = data['recurrence_pattern']
            recurrence_changed = True
        if 'recurrence_interval' in data:
            event.recurrence_interval = data['recurrence_interval']
            recurrence_changed = True
        if 'recurrence_days' in data:
            event.recurrence_days = data['recurrence_days']
            recurrence_changed = True
        if 'recurrence_end_date' in data:
            event.recurrence_end_date = datetime.fromisoformat(data['recurrence_end_date']) if data['recurrence_end_date'] else None
            recurrence_changed = True
        if 'recurrence_count' in data:
            event.recurrence_count = data['recurrence_count']
            recurrence_changed = True
        
        event.updated_at = datetime.utcnow()
        
        # Regenerar ocorrências se evento recorrente foi modificado
        occurrences_count = 0
        if event.is_recurring and (recurrence_changed or 'start_datetime' in data or 'end_datetime' in data):
            occurrences_count = generate_recurring_occurrences(event)
        
        db.session.commit()
        
        response_data = {
            'message': 'Evento atualizado com sucesso',
            'event': event.to_dict()
        }
        
        if occurrences_count > 0:
            response_data['message'] += f' ({occurrences_count} ocorrências regeneradas)'
            response_data['occurrences_count'] = occurrences_count
        
        return jsonify(response_data), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@events_bp.route('/events/<int:event_id>', methods=['DELETE'])
@login_required
def delete_event(event_id):
    """Deleta um evento"""
    try:
        user_id = request.current_user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({'error': 'Evento não encontrado'}), 404
        
        # Verificar permissões
        if not can_edit_event(user, event):
            return jsonify({'error': 'Você não tem permissão para deletar este evento'}), 403
        
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({'message': 'Evento deletado com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@events_bp.route('/events/<int:event_id>/suspend', methods=['POST'])
@login_required
def suspend_event(event_id):
    """Suspende um evento"""
    try:
        user_id = request.current_user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({'error': 'Evento não encontrado'}), 404
        
        # Verificar permissões
        if not can_edit_event(user, event):
            return jsonify({'error': 'Você não tem permissão para suspender este evento'}), 403
        
        data = request.get_json()
        
        event.status = 'suspended'
        event.suspension_reason = data.get('reason', '')
        event.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Evento suspenso com sucesso',
            'event': event.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@events_bp.route('/events/<int:event_id>/reactivate', methods=['POST'])
@login_required
def reactivate_event(event_id):
    """Reativa um evento suspenso"""
    try:
        user_id = request.current_user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({'error': 'Evento não encontrado'}), 404
        
        # Verificar permissões
        if not can_edit_event(user, event):
            return jsonify({'error': 'Você não tem permissão para reativar este evento'}), 403
        
        event.status = 'active'
        event.suspension_reason = None
        event.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Evento reativado com sucesso',
            'event': event.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@events_bp.route('/events/<int:event_id>/reminders', methods=['POST'])
@login_required
def create_reminder(event_id):
    """Cria um aviso para um evento"""
    try:
        user_id = request.current_user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({'error': 'Evento não encontrado'}), 404
        
        # Verificar permissões
        if not can_edit_event(user, event):
            return jsonify({'error': 'Você não tem permissão para configurar avisos deste evento'}), 403
        
        data = request.get_json()
        
        if 'days_before' not in data:
            return jsonify({'error': 'days_before é obrigatório'}), 400
        
        if 'reminder_type' not in data:
            return jsonify({'error': 'reminder_type é obrigatório'}), 400
        
        reminder = EventReminder(
            event_id=event_id,
            days_before=data.get('days_before'),
            reminder_type=data.get('reminder_type'),
            message=data.get('message'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(reminder)
        db.session.commit()
        
        return jsonify({
            'message': 'Aviso criado com sucesso',
            'reminder': reminder.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@events_bp.route('/events/<int:event_id>/occurrences', methods=['GET'])
@login_required
def get_event_occurrences(event_id):
    """Lista as ocorrências de um evento recorrente"""
    try:
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({'error': 'Evento não encontrado'}), 404
        
        if not event.is_recurring:
            return jsonify({'error': 'Este evento não é recorrente'}), 400
        
        # Filtros opcionais
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        status = request.args.get('status')
        
        query = EventOccurrence.query.filter_by(event_id=event_id)
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(EventOccurrence.occurrence_date >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(EventOccurrence.occurrence_date <= end_dt)
        
        if status:
            query = query.filter(EventOccurrence.status == status)
        
        query = query.order_by(EventOccurrence.occurrence_date.asc())
        
        occurrences = query.all()
        
        # Combinar dados do evento pai com cada ocorrência
        occurrences_data = []
        for occ in occurrences:
            occ_dict = occ.to_dict()
            occ_dict['event'] = event.to_dict()
            occurrences_data.append(occ_dict)
        
        return jsonify({
            'event_id': event_id,
            'event_title': event.title,
            'total_occurrences': len(occurrences),
            'occurrences': occurrences_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@events_bp.route('/events/reminders/active', methods=['GET'])
@login_required
def get_active_reminders():
    """Obtém avisos ativos para os próximos dias"""
    try:
        # Buscar eventos com avisos ativos nos próximos 7 dias
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        week_later = today + timedelta(days=7)
        
        events = Event.query.filter(
            Event.start_datetime >= today,
            Event.start_datetime <= week_later,
            Event.status == 'active'
        ).all()
        
        active_reminders = []
        
        for event in events:
            for reminder in event.reminders:
                if not reminder.is_active:
                    continue
                
                # Calcular quando o aviso deve ser mostrado
                reminder_date = event.start_datetime - timedelta(days=reminder.days_before)
                
                # Se a data do aviso é hoje ou passou, incluir
                if reminder_date <= datetime.utcnow():
                    reminder_dict = reminder.to_dict()
                    reminder_dict['event'] = event.to_dict()
                    active_reminders.append(reminder_dict)
        
        return jsonify({
            'reminders': active_reminders,
            'count': len(active_reminders)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@events_bp.route('/events/statistics', methods=['GET'])
@login_required
def get_statistics():
    """Obtém estatísticas de eventos"""
    try:
        user_id = request.current_user_id
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Contar eventos por status
        total_events = Event.query.count()
        active_events = Event.query.filter_by(status='active').count()
        suspended_events = Event.query.filter_by(status='suspended').count()
        cancelled_events = Event.query.filter_by(status='cancelled').count()
        
        # Eventos por tipo
        admin_events = Event.query.filter_by(event_type='admin').count()
        dojo_events = Event.query.filter_by(event_type='dojo').count()
        
        # Eventos recorrentes
        recurring_events = Event.query.filter_by(is_recurring=True).count()
        
        # Eventos por categoria
        categories = db.session.query(
            Event.category,
            db.func.count(Event.id)
        ).group_by(Event.category).all()
        
        return jsonify({
            'total_events': total_events,
            'by_status': {
                'active': active_events,
                'suspended': suspended_events,
                'cancelled': cancelled_events
            },
            'by_type': {
                'admin': admin_events,
                'dojo': dojo_events
            },
            'recurring_events': recurring_events,
            'by_category': {cat: count for cat, count in categories}
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
