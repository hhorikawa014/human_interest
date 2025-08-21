# HSA Web Application

**This is a simple web application for HSA (Health Saving Account) with 4 fundamental functionalities:**

- **Register account**
- **Deposite funds**
- **Issue a card**
- **Make a transaction with validation based on MCC number**

The app runs locally with a **FastAPI backend**, **SQLite database**, and a **React + TypeScript (Vite) frontend**.

## Tech Stack

- **Backend**: FastAPI (Python 3.12), SQLAlchemy ORM, SQLite (`init.sql`)
- **Frontend**: React + TypeScript, TailwindCSS, Vite
- **Database**: SQLite (local, file-based)
- **API Client**: Axios for frontend ↔ backend calls

## Reproduction Step:

1. Clone repo by running following command in your terminal:

```
cd path/to/preferred/parent/folder
git clone https://github.com/hhorikawa014/human_interest.git
cd human_interest
```

2. Initialize SQLite database by:  
   '''
   sqlite3 hsa.db < database/init.sql
   sqlite3 hsa.db "SELECT name FROM sqlite_master WHERE type='table';"
   '''

3. Backend setup by:  
   Mac/Linux

```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Windows

```
cd backend
python3 -m venv .venv
source .venv\Scripts\activate
pip install -r requirements.txt
```

5. Frontend setup by:

```
cd path/to/root/folder
cd frontend
npm install
```

6. Open two terminals in total.
   Start backend in one of them by:

```
cd path/to/root/folder
cd backend
uvicorn app.main:app --reload
```

Start frontend in the other by:

```
npm run dev
```

Backend is now running at http://127.0.0.1:8000 and Frontend is now running at http://127.0.0.1:5173.

## Future Improvement

- Modify card-number generating method for safety
- PostgreSQL for scalability instead of SQLite
- Validate if the person is eligible for HSA by reviewing their health plan
- Login (obviously necessary)
- Modern web design
- Admin dashboard with data export and reporting tools
- Automatic merchant & MCC information input using a transaction API (if there is one)

## Resources

- https://resource.payrix.com/docs/fsa-and-hsa-card-acceptance
- https://www.irs.gov/publications/p969
