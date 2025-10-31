from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/chrome_comm"

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        print("✓ Database connected successfully!")
        print(f"PostgreSQL version: {result.fetchone()[0]}")
except Exception as e:
    print(f"✗ Database connection failed: {e}")