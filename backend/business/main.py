from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import events, organizers, orders, payments, tickets

app = FastAPI(title="ProTicket Business API")

# IMPORTANTE: Configurar CORS para permitir requests desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes temporalmente
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#app.add_middleware(
#    CORSMiddleware,
#    allow_origins=[
#        "http://localhost:5173",  # Puerto por defecto de Vite
#        "http://localhost:3000",
#        "http://127.0.0.1:5173",
#        "http://127.0.0.1:3000",
#    ],
#    allow_credentials=True,
#    allow_methods=["*"],
#    allow_headers=["*"],
#)

app.include_router(events.router)
app.include_router(organizers.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(tickets.router)

@app.get("/")
def root():
    return {"message": "Business Logic API running!"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ProTicket Business API",
        "version": "1.0.0"
    }
