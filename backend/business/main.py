from fastapi import FastAPI
from routes import events, organizers, orders, payments, tickets

app = FastAPI(title="ProTicket Business API")
app.include_router(events.router)
app.include_router(organizers.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(tickets.router)

@app.get("/")
def root():
    return {"message": "Business Logic API running!"}