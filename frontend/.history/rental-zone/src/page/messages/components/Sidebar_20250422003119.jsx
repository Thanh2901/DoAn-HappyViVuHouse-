import React, { useState } from 'react';

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="sidebar border-end bg-white" style={{ width: '300px', height: '100vh' }}>
      {/* Search Box */}
      <div className="search-box p-3 border-bottom">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="conversations-list">
        {/* Conversations will be added here later */}
      </div>
    </div>
  );
};

export default Sidebar;