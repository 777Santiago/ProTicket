# Proticket Python-Backend

Backend API for managing events, orders, tickets, payments, and organizers.  
Built with **FastAPI**, **SQLAlchemy**, and **PostgreSQL**.

---

## Requirements

- Python 3.11+
- PostgreSQL 15+
- pip (or pipenv/poetry)
- Git

---

## Project Setup

1. **Clone the repository**

```bash
git clone <REPOSITORY_URL>
cd proticket/app/backend/business
```
2. **Create and activate a virtual environment**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux / Mac
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
BUSINESS_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/proticket_business_logic
```

5. **Create the database**
```sql
-- Connect to PostgreSQL and create the DB
CREATE DATABASE proticket_business_logic;
```

## Initialize the database
```bash
python
>>> from core.database import Base, engine
>>> Base.metadata.create_all(bind=engine)
>>> exit()
```

## Run the server
```bash
uvicorn main:app --reload
```
- API available at: http://127.0.0.1:8000

- Swagger docs: http://127.0.0.1:8000/docs

- ReDoc docs: http://127.0.0.1:8000/redoc

## Running Tests
```bash
pytest -v
```

## Main Endpoints
### Organizers
- **POST** `/organizers/` -> Create an organizer
- **GET** `/organizers/{id}` -> Get organizer by ID
- **PUT** `/organizers{id}` -> Update organizer
- **DELETE** `/organizers/{id}` -> Delete organizer
- **GET** `/organizers/` -> List all organizers

### Tickets
- **POST** `/tickets/` -> Create a ticket
- **GET** `/tickets/{id}` -> Get ticket by ID
- **GET** `/tickets/order/{order_id}` -> Get tickets for an order
- **GET** `/tickets/code/{ticket_code}` -> Get ticket by code

### Payments
- **POST** `/payments/` -> Create a payment
- **GET** `/payments/{id}` -> Get payment by ID
- **PUT** `/payments/{id}/status` -> Update payment status

### Orders
- **POST** `/orders/` -> Create order
- **GET** `/orders/{order_id}` -> Get order by ID
- **GET** `/orders/users/{buyer_id}` -> Get orders by User
- **PUT** `/orders/{order_id}/status` -> Update order status

### Events
- **POST** `/events/` -> Create event
- **GET** `/events/` -> Get all events
- **GET** `/events/{event_id}` -> Get event by ID
- **DELETE** `/events/{event_id}` -> Delete event by ID


All endpoints accept and return JSON

