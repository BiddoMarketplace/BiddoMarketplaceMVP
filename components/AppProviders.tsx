'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product, products as seedProducts } from '@/lib/data';

type CartItem = { productId: string; quantity: number };
type Role = 'consumer' | 'seller';
type AppContextValue = {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  followed: string[];
  role: Role;
  toast: string | null;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  toggleFollow: (sellerId: string) => void;
  publishProduct: (product: Product) => void;
  setRole: (role: Role) => void;
  showToast: (message: string) => void;
};
const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY = 'biddo-mvp-state-v2';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['rengoku', 'nb9060']);
  const [followed, setFollowed] = useState<string[]>(['seller-kicks', 'seller-anime']);
  const [role, setRole] = useState<Role>('consumer');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.cart) setCart(saved.cart);
      if (saved?.wishlist) setWishlist(saved.wishlist);
      if (saved?.followed) setFollowed(saved.followed);
      if (saved?.role) setRole(saved.role);
    } catch { /* use seed state */ }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, wishlist, followed, role })); } catch { /* storage optional */ }
  }, [cart, wishlist, followed, role]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const addToCart = (productId: string) => {
    setCart(items => {
      const existing = items.find(i => i.productId === productId);
      return existing
        ? items.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)
        : [...items, { productId, quantity: 1 }];
    });
    const p = products.find(x => x.id === productId);
    showToast((p?.name ?? 'Item') + ' added to bag');
  };

  const removeFromCart = (productId: string) => setCart(items => items.filter(i => i.productId !== productId));
  const setQuantity = (productId: string, quantity: number) => setCart(items => quantity <= 0 ? items.filter(i => i.productId !== productId) : items.map(i => i.productId === productId ? { ...i, quantity } : i));
  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    const isSaved = wishlist.includes(productId);
    setWishlist(items => isSaved ? items.filter(i => i !== productId) : [...items, productId]);
    showToast(isSaved ? 'Removed from Saved' : 'Saved to your Wishlist');
  };

  const toggleFollow = (sellerId: string) => {
    const isFollowing = followed.includes(sellerId);
    setFollowed(items => isFollowing ? items.filter(i => i !== sellerId) : [...items, sellerId]);
    showToast(isFollowing ? 'Unfollowed seller' : 'Following seller');
  };

  const publishProduct = (product: Product) => {
    setProducts(items => [product, ...items]);
    showToast('Your listing is live on Biddo');
  };

  const value = useMemo(() => ({
    products, cart, wishlist, followed, role, toast,
    addToCart, removeFromCart, setQuantity, toggleWishlist, toggleFollow,
    publishProduct, clearCart, setRole, showToast
  }), [products, cart, wishlist, followed, role, toast]);

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast ? <div className="toast" role="status"><span className="toast-dot" /><span>{toast}</span></div> : null}
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProviders');
  return value;
}
