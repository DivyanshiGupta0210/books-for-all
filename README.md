<<<<<<< HEAD
# Books For All

Digital library: **FastAPI + PostgreSQL + SQLAlchemy** backend, plain HTML/CSS/JS frontend.
The backend also serves the website, so you run **one** command and open **one** address.

## Run it

1. **Create the database** (once) in pgAdmin or psql:
   `CREATE DATABASE booksforall;`
2. **Configure**: in `backend/`, copy `.env.example` to `.env`, then set your PostgreSQL password
   and a random `SECRET_KEY`.
3. **Install and start** (from the `backend/` folder):
   ```
   python -m venv venv
   venv\Scripts\activate          # Windows   (Mac/Linux: source venv/bin/activate)
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
4. Open **http://127.0.0.1:8000**  (API docs: http://127.0.0.1:8000/docs)

On first start the tables are created and the 122 books in `backend/data/books.json` are loaded automatically.

## Covers
Copy your cover images into `frontend/assets/images/` (file names are listed in `backend/seed_books.py`).
A missing cover falls back to a grey letter tile.

## Pages
Home, Login, Sign up, Explore, Book Info, Issue Book, Receipt, My Books, Wishlist, Profile

## API (all under /api)
| Area | Endpoints |
|---|---|
| Auth | POST `/auth/register`, POST `/auth/login`, GET `/auth/me`, PUT `/auth/profile` |
| Books | GET `/books?q=&genre=&language=&book_type=`, `/books/featured`, `/books/new-arrivals`, `/books/meta`, `/books/{id}` |
| Wishlist | GET `/wishlist`, POST `/wishlist/add/{book_id}`, DELETE `/wishlist/remove/{book_id}` |
| Issues | GET `/issues/plans`, POST `/issues`, GET `/issues/my-books`, GET `/issues/receipt/{txn}`, POST `/issues/return/{issue_id}` |

## Rules
Prices: 7 days Rs20, 15 days Rs35, 30 days Rs50, 2 months Rs80, 6 months Rs200. Late fee Rs10 per day after the due date.
Change them in `backend/config.py` (`ISSUE_PLANS`, `LATE_FEE_PER_DAY`); the website reads them from the API.

## Notes
- Passwords are hashed with bcrypt. Login uses JWT tokens (valid 24 h). Logout clears the token in the browser.
- If you created tables with an older version of the models, drop them once so they are recreated.
=======
# books-for-all
e-library platform. create account, explore books, issue for selected time period or add to wishlist
>>>>>>> 076527f633e6a495346b96aaebe6aa6c5843e521
