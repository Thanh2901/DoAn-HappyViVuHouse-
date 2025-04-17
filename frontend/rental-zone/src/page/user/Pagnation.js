const Pagination = ({ itemsPerPage, totalItems, currentPage, paginate }) => {
    const pageNumbers = Math.ceil(totalItems / itemsPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) {
            paginate(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < pageNumbers) {
            paginate(currentPage + 1);
        }
    };

    return (
        <>
            <div className="col-sm-12">
                <nav className="pagination-a">
                    <ul className="pagination justify-content-end">
                        <li className="previous" id="datatables-buttons_previous">
                            <a aria-controls="datatables-buttons" onClick={handlePrevious} aria-role="link" data-dt-idx="previous" tabindex="0" className="page-link"><i class="bi bi-chevron-left"></i></a>
                        </li>
                        {Array.from({ length: pageNumbers }, (_, index) => index + 1).map((number) => (
                            <li key={number}><a href="#" aria-controls="datatables-buttons" aria-role="link" data-dt-idx="1" tabindex="0" onClick={() => paginate(number)} className={currentPage === number ? 'page-link active' : 'page-link '}>{number}</a></li>
                        ))}
                        <li className=" next" id="datatables-buttons_next">
                            <a href="#" aria-controls="datatables-buttons" onClick={handleNext} aria-role="link" data-dt-idx="next" tabindex="0" className="page-link"><i class="bi bi-chevron-right"></i></a>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    );
};

export default Pagination;