# seed script: loads data/books.json into the books table
#
# Runs automatically on startup (only adds books that are missing), or by hand:
#   python seed_books.py
import json
from pathlib import Path

from database import Base, SessionLocal, engine
from models import Book

DATA_FILE = Path(__file__).resolve().parent / "data" / "books.json"

# Cover images that live in  frontend/assets/images/
# (book_id -> file name). Books not listed here use a letter placeholder.
COVER_FILES = {
    1042: "to kill a mockingbird.png",
    1043: "pride and prejudice.png",
    1044: "rashmirathi.png",
    1045: "gitanjali.png",
    1046: "norwegian wood.png",
    1047: "the kite runner.png",
    1048: "the journey to the west.png",
    1049: "dream of the red chamber.png",
    1050: "the hobbit.png",
    1051: "les miserables.png",
    1052: "the selfish gene.png",
    1053: "a journey to the center of the earth.png",
    1054: "ignited minds.png",
    1055: "wings of fire.png",
    1056: "harry potter and the chamber of secrets.png",
    1057: "the art of war.png",
    1058: "brave new world.png",
    1059: "silent spring.png",
    1060: "the blue umbrella.png",
    1061: "around the world in 80 days.png",
    1062: "harry potter and the half-blood prince.png",
    1063: "harry potter and the prosoner of azkaban.png",
}


def seed_books() -> int:
    Base.metadata.create_all(bind=engine)

    if not DATA_FILE.exists():
        print(f"[seed] {DATA_FILE} not found - skipping.")
        return 0

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        items = json.load(file)

    db = SessionLocal()
    inserted = 0
    try:
        existing_ids = {row[0] for row in db.query(Book.book_id).all()}

        for item in items:
            cover_file = COVER_FILES.get(item["book_id"])
            cover_url = item.get("cover_url") or (
                f"assets/images/{cover_file}" if cover_file else None
            )

            if item["book_id"] in existing_ids:
                continue

            db.add(
                Book(
                    book_id=item["book_id"],
                    title=item["title"],
                    author=item["author"],
                    genre=item["genre"],
                    language=item["language"],
                    book_type=item["book_type"],
                    publishing_year=item["publishing_year"],
                    copies_available=item["copies_available"],
                    isbn=item["isbn"],
                    summary=item["summary"],
                    has_cover=bool(item.get("has_cover", False)),
                    cover_url=cover_url,
                    is_featured=bool(item.get("is_featured", False)),
                    is_new_arrival=bool(item.get("is_new_arrival", False)),
                )
            )
            inserted += 1

        db.commit()
    finally:
        db.close()

    if inserted:
        print(f"[seed] {inserted} books added.")
    return inserted


if __name__ == "__main__":
    seed_books()
