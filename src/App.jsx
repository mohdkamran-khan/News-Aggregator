import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import NewsCard from "./components/NewsCard";
import CategoryFilter from "./components/CategoryFilter";
import SearchBar from "./components/SearchBar";
import Loader from "./components/Loader";
import Error from "./components/Error";

function App() {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("general");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

  const fetchNews = async () => {
    const cacheKey = `news-${category}-${query}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setArticles(JSON.parse(cached));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url;

      if (query) {
        url = `https://newsapi.org/v2/everything?q=${query}&pageSize=20&apiKey=${API_KEY}`;
      } else {
        url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=20&apiKey=${API_KEY}`;
      }

      const res = await axios.get(url);

      setArticles(res.data.articles);

      localStorage.setItem(cacheKey, JSON.stringify(res.data.articles));
    } catch (err) {
      setError("Failed to fetch news.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showBookmarks) fetchNews();
  }, [category, query, showBookmarks]);

  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    setBookmarks(JSON.parse(localStorage.getItem("bookmarks")) || []);
  }, [articles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 transition dark:text-white">
      <Navbar setShowBookmarks={setShowBookmarks} />

      {!showBookmarks && (
        <>
          <SearchBar setQuery={setQuery} category={category} />
          <CategoryFilter setCategory={setCategory} />
        </>
      )}

      {loading && <Loader />}
      {error && <Error message={error} />}

      <div className="grid gap-8 p-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(showBookmarks ? bookmarks : articles).map((article, index) => (
          <NewsCard key={index} article={article} />
        ))}
      </div>

      {showBookmarks && bookmarks.length === 0 && (
        <p className="text-center text-lg mt-20 opacity-70">
          No bookmarks yet.
        </p>
      )}
    </div>
  );
}

export default App;
