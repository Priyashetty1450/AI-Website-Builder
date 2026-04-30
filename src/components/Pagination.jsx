export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <button
        type="button"
        className="button button-secondary"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>

      <div className="pagination-pages">
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`pagination-page${pageNumber === page ? ' pagination-page-active' : ''}`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="button button-secondary"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}
