from sqlalchemy import create_engine, Column, String, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func as sql_func

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/chrome_comm"

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    google_id = Column(String, unique=True, index=True, nullable=False)
    picture = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=sql_func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=sql_func.now())

# Create engine and tables
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)

print("✓ Database tables created successfully!")
print("Tables created:")
for table in Base.metadata.tables:
    print(f"  - {table}")