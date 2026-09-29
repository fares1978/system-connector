from pydantic import BaseModel


# Models
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float
    quantity: int


class ItemResponse(Item):
    id: str
