from app.db.session import get_db
from app.models.user import User
from datetime import datetime

db = next(get_db())

existing_user = db.query(User).filter(User.google_id == "108572540737925944755").first()
if not existing_user:
    new_user = User(
        id="108572540737925944755",
        email="rajpreet2206@gmail.com",
        name="Rajpreet",
        google_id="108572540737925944755",
        picture=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        gmail_access_token=None,
        gmail_refresh_token=None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print("User inserted:", new_user.id)
else:
    print("User already exists:", existing_user.id)

user = db.query(User).filter(User.google_id == "108572540737925944755").first()
print(user)