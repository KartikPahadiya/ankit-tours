import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top whenever the route path changes.
 * Without this, navigating between pages preserves the old scroll
 * position — making new pages look blank when they are shorter
 * than the previous page's scroll offset.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
