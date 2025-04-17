import {Navigate, useNavigate, useParams} from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import { getRequestById } from '../../services/fetch/ApiUtils';
import * as XLSX from 'xlsx';


function ExportBillRequier(props) {
    const { authenticated, role, currentUser, location, onLogout } = props;
    const { id } = useParams();
    const navigate = useNavigate()
    const [contractData, setContractData] = useState({
        nameBill: '',
        description: '',
        price: 0,
        nameOfRent: '',
        nameRoom: ''
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setContractData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };



    const handleSubmit = (event) => {
        event.preventDefault();
        toast.success("Xuât hóa đơn thành công!!")
        setContractData({
            nameBill: "",
            price: "",
            
        });
        navigate('/rentaler/request-management')
    };

    useEffect(() => {
        getRequestById(id)
            .then(response => {
                const  description = response.description;
                const nameOfRent = response.name;
                const nameRoom = response.room.title
                setContractData({
                    description,
                    nameOfRent,
                    nameRoom
                });
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
    }, []);

    const handleExport = () => {
        exportToExcel(contractData);
    };


    if (!authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }
    return (
        <>
            <div className="wrapper">
                <nav id="sidebar" className="sidebar js-sidebar">
                    <div className="sidebar-content js-simplebar">
                        <a className="sidebar-brand" href="index.html">
                            <span className="align-middle">RENTALER PRO</span>
                        </a>
                        <SidebarNav />
                    </div>
                </nav>

                <div className="main">
                    <Nav onLogout={onLogout} currentUser={currentUser} />

                    <br />
                    <div className="container-fluid p-0">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title">Xuất hóa đơn</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>

                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="price">Tên Hóa Đơn</label>
                                        <input type="text" className="form-control" id="price" name="nameBill" value={contractData.nameBill}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="price">Mô tả</label>
                                        <input type="text" className="form-control" id="price" name="description" value={contractData.description}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="price">Chi Phí</label>
                                        <input type="number" className="form-control" id="price" name="price" value={contractData.price}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="price">Tên Phòng</label>
                                        <input type="text" className="form-control" id="price" name="nameRoom" value={contractData.nameRoom}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="price">Người thuê</label>
                                        <input type="text" className="form-control" id="price" name="nameOfRent" value={contractData.nameOfRent}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <button type="submit" onClick={handleExport} className="btn btn-primary">Xuất hóa đơn</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div >
            </div >

        </>
    )
}



  function exportToExcel(contractData) {
    // Create an empty workbook
    const workbook = XLSX.utils.book_new();

    const formattedPrice = contractData.price ? formatCurrency(contractData.price) : '';
  
    // Add a worksheet to the workbook
    const worksheet = XLSX.utils.aoa_to_sheet([
        ['Tên Hóa Đơn', 'Mô tả', 'Chi Phí', 'Tên Người Thuê', 'Tên Phòng'],
        [contractData.nameBill, contractData.description, formattedPrice, contractData.nameOfRent, contractData.nameRoom],
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
    function formatCurrency(value) {
        return value.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
      }
    
    // Generate the Excel file data
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  
    // Create a Blob from the Excel file data
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hoa_don.xlsx';
    a.click();
  
    // Cleanup
    URL.revokeObjectURL(url);
  }

export default ExportBillRequier;