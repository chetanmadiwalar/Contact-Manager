import React from 'react';
import { motion } from 'framer-motion';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiMoreHorizontal,
} from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5;

  const getPageNumbers = () => {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <motion.div
      className="pagination"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>

      <nav className="pagination-nav" aria-label="Pagination">
        <ul className="pagination-list">
          {/* First Page */}
          {currentPage > 1 && (
            <li>
              <button
                className="pagination-btn first"
                onClick={() => handlePageChange(1)}
                aria-label="Go to first page"
                title="First page"
              >
                <FiChevronsLeft />
              </button>
            </li>
          )}

          {/* Previous Page */}
          {currentPage > 1 && (
            <li>
              <button
                className="pagination-btn prev"
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="Go to previous page"
                title="Previous page"
              >
                <FiChevronLeft />
              </button>
            </li>
          )}

          {/* Page Numbers */}
          {pageNumbers.map((page) => {
            const isCurrent = page === currentPage;

            if (page === 1 && pageNumbers[0] > 1) {
              return (
                <React.Fragment key="start-ellipsis">
                  <li>
                    <button
                      className={`pagination-btn ${isCurrent ? 'active' : ''}`}
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>
                  </li>
                  {pageNumbers[0] > 2 && (
                    <li className="ellipsis">
                      <FiMoreHorizontal />
                    </li>
                  )}
                </React.Fragment>
              );
            }

            return (
              <li key={page}>
                <motion.button
                  className={`pagination-btn ${isCurrent ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                  whileHover={!isCurrent ? { scale: 1.1 } : {}}
                  whileTap={!isCurrent ? { scale: 0.95 } : {}}
                  aria-label={`Go to page ${page}`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {page}
                </motion.button>
              </li>
            );
          })}

          {/* Ellipsis and Last Page */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <li className="ellipsis">
                  <FiMoreHorizontal />
                </li>
              )}
              <li>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}

          {/* Next Page */}
          {currentPage < totalPages && (
            <li>
              <button
                className="pagination-btn next"
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="Go to next page"
                title="Next page"
              >
                <FiChevronRight />
              </button>
            </li>
          )}

          {/* Last Page */}
          {currentPage < totalPages && (
            <li>
              <button
                className="pagination-btn last"
                onClick={() => handlePageChange(totalPages)}
                aria-label="Go to last page"
                title="Last page"
              >
                <FiChevronsRight />
              </button>
            </li>
          )}
        </ul>
      </nav>

      <div className="pagination-controls">
        <select
          className="page-size-select"
          value={10} // This should be dynamic
          onChange={(e) => {
            // Handle page size change
            console.log('Page size changed to:', e.target.value);
          }}
          aria-label="Items per page"
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>
    </motion.div>
  );
};

export default Pagination;