import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useEffect } from "react";

interface ProductListProps {
  selectedCategory: string | undefined;
  setSelectedCategory: (category: string | undefined) => void;
}

export function ProductList({ selectedCategory, setSelectedCategory }: ProductListProps) {
  const products = useQuery(api.products.list, { 
    category: selectedCategory,
    featured: selectedCategory === undefined ? true : undefined 
  });
  const categories = useQuery(api.products.getCategories);
  const addToCart = useMutation(api.cart.add);
  const seedProducts = useMutation(api.products.seedProducts);

  useEffect(() => {
    // Seed products on first load
    seedProducts().catch(() => {
      // Products already seeded, ignore error
    });
  }, [seedProducts]);

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart({ productId: productId as any, quantity: 1 });
      toast.success(`Added ${productName} to cart`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
    }
  };

  if (products === undefined || categories === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {selectedCategory ? `${selectedCategory} Products` : "Featured Products"}
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === undefined
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Featured
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-primary">${product.price}</span>
                  <span className="text-sm text-gray-500">{product.stock} in stock</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product._id, product.name)}
                  disabled={product.stock === 0}
                  className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
