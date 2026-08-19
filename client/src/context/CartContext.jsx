import { createContext, useContext, useEffect, useState } from "react";
import { useConfirm } from "./ConfirmContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const confirm = useConfirm();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("shopsphere-cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Corrupted localStorage cart data detected, clearing:", error);
      localStorage.removeItem("shopsphere-cart");
      return [];
    }
  });

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem("shopsphere-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add product with stock limits
  const addToCart = (product, quantityToAdd = 1) => {
    const existingItem = cartItems.find((item) => item._id === product._id);
    const stock = product.stock !== undefined ? product.stock : 999;

    if (stock <= 0) {
      confirm.alert("Out of Stock", "Sorry, this item is currently out of stock.");
      return;
    }

    if (existingItem) {
      const potentialQty = existingItem.quantity + quantityToAdd;
      if (potentialQty > stock) {
        confirm.alert("Stock Limit Reached", `Cannot add more. Only ${stock} items available in stock.`);
        setCartItems((currentItems) =>
          currentItems.map((item) =>
            item._id === product._id ? { ...item, quantity: stock } : item
          )
        );
        return;
      }
      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        )
      );
      return;
    }

    const finalAddQty = Math.min(Math.max(1, quantityToAdd), stock);
    setCartItems((currentItems) => [
      ...currentItems,
      {
        ...product,
        quantity: finalAddQty,
      },
    ]);
  };

  // Increase quantity checking stock limits
  const increaseQuantity = (productId) => {
    const item = cartItems.find((i) => i._id === productId);
    if (!item) return;

    const stock = item.stock !== undefined ? item.stock : 999;
    if (item.quantity >= stock) {
      confirm.alert("Stock Limit Reached", `Cannot increase. Only ${stock} items available in stock.`);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((i) =>
        i._id === productId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  // Decrease quantity locking minimum of 1
  const decreaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  };

  // Remove product
  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item._id !== productId)
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Total items
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Total price
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};