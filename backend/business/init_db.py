from core.database import Base, engine
from models.models import Organizer, Event, Order, Payment, Ticket

print("Creando tablas en la base de datos...")

Base.metadata.create_all(bind=engine)

print("¡Tablas creadas exitosamente!")

# Verificar que tablas se crearon
from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()

print(f"\nTablas creadas: {tables}")
