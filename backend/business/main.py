from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from routes import events, organizers, orders, payments, tickets

app = FastAPI(title="ProTicket Business API")

# CONFIGURACIÓN CORS CRÍTICA - DEBE ESTAR ANTES DE LOS ROUTERS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler global para asegurar que los errores incluyan headers CORS
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    import traceback
    print(f"❌ Error no manejado: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Error interno del servidor: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

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