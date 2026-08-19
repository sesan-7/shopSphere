import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [rating, setRating] = useState("all");
  const [sort, setSort] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const productsPerPage = 9;

  const searchParam = searchParams.get("search");
  const categoryParam = searchParams.get("category");

  const loadCatalog = async () => {
    try {
      setLoading(true);
      setError("");

      let response;
      if (searchParam) {
        setSearch(searchParam);
        response = await api.get(`/products/search?query=${encodeURIComponent(searchParam)}`);
      } else {
        response = await api.get("/products");
      }

      setProducts(response.data.products);
    } catch (err) {
      console.error(err);
      setError("Failed to load products list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
    document.title = "Products Catalog | ShopSphere Premium";
  }, [searchParam]);

  useEffect(() => {
    if (categoryParam) {
      setCategory(categoryParam);
    } else {
      setCategory("all");
    }
    setCurrentPage(1);
  }, [categoryParam]);

  const handleClearFilters = () => {
    setCategory("all");
    setPriceRange("all");
    setRating("all");
    setSort("default");
    setSearch("");
    setSearchParams({});
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    if (search.trim()) {
      setSearchParams({ search: search.trim() });
    } else {
      setSearchParams({});
    }
  };

  // Derive categories list from fetched products
  const categoriesList = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // Category Filtering
  const categoryFiltered =
    category === "all"
      ? products
      : products.filter((p) => p.category === category);

  // Price Filtering
  const priceFiltered = categoryFiltered.filter((p) => {
    if (priceRange === "all") return true;
    if (priceRange === "under10000") return p.price < 10000;
    if (priceRange === "10000to50000") return p.price >= 10000 && p.price <= 50000;
    if (priceRange === "above50000") return p.price > 50000;
    return true;
  });

  // Rating Filtering
  const ratingFiltered = priceFiltered.filter((p) => {
    if (rating === "all") return true;
    return p.rating >= Number(rating);
  });

  // Sorting
  const sortedProducts = [...ratingFiltered];
  if (sort === "priceLowToHigh") sortedProducts.sort((a, b) => a.price - b.price);
  if (sort === "priceHighToLow") sortedProducts.sort((a, b) => b.price - a.price);
  if (sort === "ratingHighToLow") sortedProducts.sort((a, b) => b.rating - a.rating);
  if (sort === "nameAZ") sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "nameZA") sortedProducts.sort((a, b) => b.name.localeCompare(a.name));

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + productsPerPage);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 text-left">
      {/* Header Info */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 m-0">Products Catalog</h1>
          {searchParam && (
            <p className="text-xs text-gray-500 mt-1">
              Showing results for "<span className="font-semibold text-blue-600">{searchParam}</span>" ({sortedProducts.length} items)
            </p>
          )}
        </div>

        {/* Global Catalog Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items in catalog..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button type="submit" className="rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 transition">
            Search
          </button>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sticky Filters Panel (Flipkart Style Left Column) */}
        <aside className="w-full lg:w-64 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm sticky top-24 h-auto lg:max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
            <span className="font-extrabold text-gray-900 text-sm">Filters</span>
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-6 text-xs text-gray-700">
            {/* Category Filter */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400 mb-3">Categories</h4>
              <div className="space-y-2">
                {categoriesList.map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer font-medium hover:text-black">
                    <input
                      type="radio"
                      name="category"
                      value={item}
                      checked={category === item}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="accent-blue-600 h-3.5 w-3.5"
                    />
                    <span className="capitalize">{item === "all" ? "All Categories" : item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400 mb-3">Price Range</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-black">
                  <input
                    type="radio"
                    name="priceRange"
                    value="all"
                    checked={priceRange === "all"}
                    onChange={(e) => {
                      setPriceRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="accent-blue-600 h-3.5 w-3.5"
                  />
                  <span>All Prices</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-black">
                  <input
                    type="radio"
                    name="priceRange"
                    value="under10000"
                    checked={priceRange === "under10000"}
                    onChange={(e) => {
                      setPriceRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="accent-blue-600 h-3.5 w-3.5"
                  />
                  <span>Under ₹10,000</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-black">
                  <input
                    type="radio"
                    name="priceRange"
                    value="10000to50000"
                    checked={priceRange === "10000to50000"}
                    onChange={(e) => {
                      setPriceRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="accent-blue-600 h-3.5 w-3.5"
                  />
                  <span>₹10,000 - ₹50,000</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-black">
                  <input
                    type="radio"
                    name="priceRange"
                    value="above50000"
                    checked={priceRange === "above50000"}
                    onChange={(e) => {
                      setPriceRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="accent-blue-600 h-3.5 w-3.5"
                  />
                  <span>Above ₹50,000</span>
                </label>
              </div>
            </div>

            {/* Ratings Filter */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-gray-400 mb-3">Customer Ratings</h4>
              <div className="space-y-2">
                {["all", "4", "3", "2"].map((val) => (
                  <label key={val} className="flex items-center gap-2 cursor-pointer font-medium hover:text-black">
                    <input
                      type="radio"
                      name="rating"
                      value={val}
                      checked={rating === val}
                      onChange={(e) => {
                        setRating(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="accent-blue-600 h-3.5 w-3.5"
                    />
                    <span>{val === "all" ? "All Ratings" : `⭐ ${val} & Above`}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Sorting Header & Products Grid */}
        <section className="flex-1 w-full">
          {/* Sorting controls */}
          <div className="flex justify-between items-center mb-6 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm text-xs font-semibold">
            <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              Showing {startIndex + 1} - {Math.min(startIndex + productsPerPage, sortedProducts.length)} of {sortedProducts.length} items
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1 font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="default">Popularity</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
                <option value="ratingHighToLow">Ratings</option>
                <option value="nameAZ">Name: A to Z</option>
                <option value="nameZA">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && <Loader />}

          {/* Error */}
          {!loading && error && (
            <ErrorMessage message={error} onRetry={loadCatalog} />
          )}

          {/* No Products Found */}
          {!loading && !error && sortedProducts.length === 0 && (
            <div className="rounded-2xl border border-gray-200 p-16 text-center bg-gray-50">
              <span className="text-4xl block mb-4">🔍</span>
              <p className="text-gray-500 font-medium">No products found matching the criteria.</p>
              <button
                onClick={handleClearFilters}
                className="mt-6 rounded-lg bg-black px-5 py-2 text-xs font-bold text-white hover:bg-gray-800 transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && paginatedProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Products;