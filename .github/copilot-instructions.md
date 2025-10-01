# Copilot Instructions - Sistema Ki Aikido

## Repository Overview

**Sistema Ki Aikido** is a complete management system for Ki Aikido academies in Brazil. It provides centralized control of students, dojos, and administrative processes.

- **Type**: Full-stack web application
- **Backend**: Python 3.8+ with Flask framework, SQLAlchemy ORM, SQLite database
- **Frontend**: Vanilla JavaScript with HTML/CSS (Tailwind CSS)
- **Size**: ~2,100 lines of Python code, minimal JS frontend
- **Architecture**: REST API backend with stateless frontend

## Critical Build & Run Instructions

### Installation Process (ALWAYS follow this order)

1. **Create virtual environment** (Python 3.8+):
```bash
cd backend
python3 -m venv venv
```

2. **Activate virtual environment** (ALWAYS activate before any Python operations):
```bash
source backend/venv/bin/activate  # or backend/venv/bin/activate on Linux/Mac
```

3. **Install dependencies**:
```bash
pip install -r backend/requirements.txt
```

4. **Initialize database** (creates SQLite DB with demo data):
```bash
cd backend
source venv/bin/activate
python3 -c "from src.main import app, init_database; app.app_context().push(); init_database()"
```

### Running the Application

**Backend** (runs on port 5000):
```bash
cd backend
source venv/bin/activate
python3 src/main.py
```

**Frontend** (runs on port 8080):
```bash
# From repository root
python3 -m http.server 8080 --directory frontend
```

Access at: http://localhost:8080/index.html

### Using Control Scripts

The repository has control scripts at the root:

- `./start.sh` - Starts both backend (port 5000) and frontend (port 8080)
- `./stop.sh` - Stops all processes
- `./status.sh` - Checks system status and database
- `./scripts/install.sh` - Full automated installation

**IMPORTANT**: Always run these scripts from the repository root directory.

### Common Issues & Solutions

**Port 5000 already in use:**
```bash
# Kill process on port 5000
pkill -f "python.*main.py"
# Or force kill
lsof -ti:5000 | xargs kill -9
```

**Database corruption:**
```bash
rm backend/src/database/app.db
cd backend && source venv/bin/activate
python3 -c "from src.main import app, init_database; app.app_context().push(); init_database()"
```

**Virtual environment missing:**
```bash
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
```

## Project Structure

### Root Directory
```
ki-aikido-system/
├── backend/              # Flask application
├── frontend/             # HTML/JS frontend
├── scripts/              # Installation & maintenance scripts
├── docs/                 # Documentation (API.md, INSTALACAO.md)
├── data/                 # Sample data (inscricoes.csv)
├── start.sh             # Start system script
├── stop.sh              # Stop system script
├── status.sh            # Status check script
└── README.md            # Main documentation
```

### Backend Structure
```
backend/
├── src/
│   ├── main.py                    # Flask app entry point, DB initialization
│   ├── models/                    # SQLAlchemy models
│   │   ├── __init__.py           # Exports all models
│   │   ├── user.py               # User model (db definition here)
│   │   ├── dojo.py               # Dojo (academy) model
│   │   ├── student.py            # Student model
│   │   ├── member_status.py      # Member status tracking
│   │   ├── member_graduation.py  # Graduations/belts
│   │   └── member_qualifications.py # Instructor qualifications
│   ├── routes/                   # API endpoints (blueprints)
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── students.py           # Student CRUD endpoints
│   │   ├── dojos.py              # Dojo endpoints
│   │   ├── member_status.py      # Member status endpoints
│   │   ├── member_graduations.py # Graduation endpoints
│   │   └── member_qualifications.py # Qualification endpoints
│   ├── database/                 # SQLite database location
│   │   └── app.db               # Database file (created on init)
│   └── migrations/              # Database migrations (optional)
├── requirements.txt             # Python dependencies
└── venv/                       # Virtual environment (not in git)
```

### Frontend Structure
```
frontend/
├── index.html        # Main application UI
├── app.js           # Application logic (~5800 lines)
└── constants.js     # Configuration constants
```

### Key Configuration Files

- `backend/requirements.txt` - Python dependencies (Flask 3.1.1, SQLAlchemy 2.0.41, flask-cors 6.0.0)
- `backend/src/main.py` - Flask app config (SECRET_KEY, database URI, CORS)
- `.gitignore` - Excludes venv/, *.pyc, database files, logs

## Database Schema

**Tables:**
- `user` - System users (admin or dojo-specific)
- `dojo` - Aikido academies/dojos
- `student` - Student records
- `member_status` - Member registration status
- `member_graduation` - Belt/rank graduations
- `member_qualification` - Instructor qualifications

**Key Relationships:**
- Users belong to a dojo (or null for admin)
- Students belong to a dojo
- Member status is 1:1 with student
- Graduations and qualifications are many:1 with member_status

## API Structure

**Base URL**: `http://localhost:5000/api`

**Authentication**: Session-based (cookies)

**Main Endpoints:**
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user
- `GET /api/students` - List students (with filters)
- `POST /api/students` - Create student
- `GET /api/students/{id}` - Get student details
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student
- `GET /api/dojos` - List dojos
- `GET /api/health` - Health check endpoint

Full API documentation in `docs/API.md`

## Development Workflow

### Testing Changes

**No formal test suite exists** - manual testing is required:

1. Start the backend server
2. Test API endpoints with curl or in browser
3. Test frontend by loading http://localhost:8080/index.html
4. Check database state with: `sqlite3 backend/src/database/app.db`

### Validating Your Changes

1. **Check backend starts without errors:**
```bash
cd backend && source venv/bin/activate && python3 src/main.py
# Should show: "Running on http://127.0.0.1:5000"
```

2. **Test health endpoint:**
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"OK","message":"API is running"}
```

3. **Test login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kiaikido.com","password":"123456"}' \
  -c cookies.txt
```

4. **Check for Python syntax errors:**
```bash
cd backend && source venv/bin/activate
python3 -m py_compile src/main.py src/models/*.py src/routes/*.py
```

### Demo Credentials

**Admin** (sees all dojos):
- Email: `admin@kiaikido.com`
- Password: `123456`

**Dojo Users** (see only their dojo):
- `florianopolis@kiaikido.com` / `123456` (Dojo Florianópolis)
- `cdki@kiaikido.com` / `123456` (Dojo CDKI)
- `bage@kiaikido.com` / `123456` (Dojo Bagé)
- `shukikan@kiaikido.com` / `123456` (Dojo Shukikan)
- `belohorizonte@kiaikido.com` / `123456` (Dojo Belo Horizonte)
- `rio@kiaikido.com` / `123456` (Dojo Rio de Janeiro)

## Code Style & Conventions

- **Python**: Follow PEP 8 (though no linter configured)
- **Imports**: Flask app has critical comment `# DON'T CHANGE THIS !!!` for sys.path modification
- **Database**: Always use `app.app_context()` when accessing DB outside request context
- **CORS**: Configured for localhost:8080, localhost:3000, and file:// protocol
- **Sessions**: Cookie-based authentication, not JWT tokens

## Critical Files - DO NOT BREAK

- `backend/src/main.py` - Contains both Flask app and DB initialization logic
- `backend/src/models/__init__.py` - Central export of all models
- `backend/src/models/user.py` - Contains SQLAlchemy `db` object definition
- `start.sh`, `stop.sh`, `status.sh` - Control scripts used in production

## Dependencies & Versions

**Python Packages** (from requirements.txt):
```
Flask==3.1.1
Flask-SQLAlchemy==3.1.1
flask-cors==6.0.0
SQLAlchemy==2.0.41
PyJWT==2.8.0
Werkzeug==3.1.3
```

**System Requirements:**
- Python 3.8+ (tested with 3.12)
- SQLite 3
- Git
- Linux/Mac (Ubuntu 18.04+ recommended)

## Common Tasks

### Adding a New Model

1. Create model file in `backend/src/models/`
2. Import and export in `backend/src/models/__init__.py`
3. Import in `backend/src/main.py`
4. Create migration if needed
5. Re-initialize database or add migration script

### Adding a New API Endpoint

1. Create/edit route file in `backend/src/routes/`
2. Create Flask blueprint
3. Register blueprint in `backend/src/main.py`
4. Ensure proper authentication/authorization

### Modifying Database Schema

1. Update model file
2. Delete database: `rm backend/src/database/app.db`
3. Reinitialize: Run init_database() function

## Trust These Instructions

These instructions are comprehensive and validated. When working on this repository:

1. **ALWAYS activate the virtual environment** before any Python command
2. **ALWAYS run from correct directory** (backend/ for Python, root for scripts)
3. **Test your changes** by starting the server and checking endpoints
4. Only search for additional information if these instructions are incomplete or you encounter an error not covered here
5. The backend MUST run on port 5000, frontend on port 8080 - these are hardcoded in frontend code

## Quick Reference Commands

```bash
# Full installation
./scripts/install.sh

# Start system (both backend + frontend)
./start.sh

# Stop system
./stop.sh

# Check status
./status.sh

# Manual backend start
cd backend && source venv/bin/activate && python3 src/main.py

# Manual frontend start
python3 -m http.server 8080 --directory frontend

# Reset database
rm backend/src/database/app.db
cd backend && source venv/bin/activate
python3 -c "from src.main import app, init_database; app.app_context().push(); init_database()"

# Check Python syntax
cd backend && source venv/bin/activate
python3 -m py_compile src/**/*.py
```
