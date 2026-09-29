import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

interface Item {
  _id?: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState<Item>({
    name: "",
    description: "",
    quantity: 0,
    price: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<Item[]>(`${API_URL}/items`);
      setItems(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch items");
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    if (!formData.name || formData.quantity < 0 || formData.price < 0) {
      setError("Please fill all fields with valid values");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/items/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/items`, formData);
      }

      setFormData({ name: "", description: "", quantity: 0, price: 0 });
      fetchItems();
      setError("");
    } catch (err) {
      setError("Failed to save item");
      console.error("Error saving item:", err);
    }
  };

  const handleEdit = (item: Item): void => {
    setFormData({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
    });
    setEditingId(item._id || null);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`${API_URL}/items/${id}`);
        fetchItems();
        setError("");
      } catch (err) {
        setError("Failed to delete item");
        console.error("Error deleting item:", err);
      }
    }
  };

  const handleCancel = (): void => {
    setFormData({ name: "", description: "", quantity: 0, price: 0 });
    setEditingId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "price" ? Number(value) : value,
    }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CRM Clients Connection Management System</h1>
      </header>

      <div className="container">
        {error && <div className="error-message">{error}</div>}

        <div className="form-section">
          <h2>{editingId ? "Edit Item" : "Add New Item"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Item name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Item description"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price ($):</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update Item" : "Add Item"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="items-section">
          <h2>Items List</h2>
          {loading ? (
            <p>Loading items...</p>
          ) : items.length === 0 ? (
            <p className="no-items">
              No items found. Add your first item above!
            </p>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item._id} className="item-card">
                  <h3>{item.name}</h3>
                  <p className="description">{item.description}</p>
                  <div className="item-details">
                    <span className="quantity">Qty: {item.quantity}</span>
                    <span className="price">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="item-actions">
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id!)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
