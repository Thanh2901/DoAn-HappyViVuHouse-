import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom'
import Nav from './Nav';
import SidebarNav from './SidebarNav';
import '../../assets/css/app.css';
import BarChart from './chart/BarChart';
import PieChart from './chart/PieChart';
import { getByCost, getByMonth, getNumber } from '../../services/fetch/ApiUtils';
import { RevenueData } from '../../utils/Data';
import SubChart from './chart/SubChart';


function DashboardRentaler(props) {
    console.log("Props:", props)
    const { authenticated, role, currentUser, location, onLogout } = props;

    const [number, setNumber] = useState({
        numberOfRoom: '',
        numberOfPeople: '',
        numberOfEmptyRoom: '',
        revenue: '',
        waterCost: '',
        publicElectricCost: '',
        internetCost: '',
    });

    const [contentRevenue, setContentRevenue] = useState([]);
    const [currentMonthData, setCurrentMonthData] = useState([]);

    const [revenueData, setRevenueData] = useState(); 

    const [subData, setSubData] = useState({
        labels: [],
        datasets: [
          {
            label: "Doanh thu",
            data: [],
            backgroundColor: [
              "rgba(75,192,192,1)",
              "#ecf0f1",
              "#50AF95",
              "#f3ba2f",
              "#2a71d0",
            ],
            borderColor: "black",
            borderWidth: 2,
          },
        ],
    });

    const [userData, setUserData] = useState({
        labels: [],
        datasets: [
          {
            label: "Doanh thu",
            data: [],
            backgroundColor: [
              "rgba(75,192,192,1)",
              "#ecf0f1",
              "#50AF95",
              "#f3ba2f",
              "#2a71d0",
            ],
            borderColor: "black",
            borderWidth: 2,
          },
        ],
      });


      const [costData, setCostData] = useState({
        labels: [],
        datasets: [
          {
            label: "Doanh thu",
            data: [],
            backgroundColor: [
              "rgba(75,192,192,1)",
              "#ecf0f1",
              "#50AF95",
              "#f3ba2f",
              "#2a71d0",
            ],
            borderColor: "black",
            borderWidth: 2,
          },
        ],
      });

    useEffect(() => {
        getNumber()
            .then(response => {
                const number = response;
                setNumber(prevState => ({
                    ...prevState,
                    ...number
                }));
            })
            .catch(error => {
                console.log(error)
            });


    }, []);

    const monthOfNow = new Date().getMonth() + 1;

    useEffect(() => {
        getByMonth()
          .then((revenueData) => {
            setUserData((prevUserData) => ({
              ...prevUserData,
              labels: revenueData.content.filter((data) => data.month === monthOfNow).map((data) => "Tháng " + data.month),
              datasets: [
                {
                  ...prevUserData.datasets[0],
                  data: revenueData.content.map((data) => data.revenue),
                },
              ],
            }));
            console.log("userData", userData);
            setContentRevenue(revenueData.content);
            setSubData((prevUserData) => ({
                ...prevUserData,
                labels: revenueData.content.filter((data) => data.month === monthOfNow).map((data) => "Tháng " + data.month),
                datasets: [
                  {
                    ...prevUserData.datasets[0],
                    label: "Tiền nước",
                    backgroundColor: "rgba(75,192,192,1)",
                    data: revenueData.content.map((data) => data.waterCost),
                  },
                  {
                    ...prevUserData.datasets[0],
                    label: "Tiền điện",
                    backgroundColor: "#ecf0f1",
                    data: revenueData.content.map((data) => data.publicElectricCost),
                  },
                  {
                    ...prevUserData.datasets[2],
                    label: "Tiền internet",
                    backgroundColor: "#50AF95",
                    data: revenueData.content.map((data) => data.internetCost),
                  }
                ],
              }));
          })
          .catch((error) => {
            console.log(error);
          });

        //   getByCost()
        //   .then((revenueData) => {
        //     setCostData((prevUserData) => ({
        //       ...prevUserData,
        //       labels: revenueData.content.map((data) => data.name),
        //       datasets: [
        //         {
        //           ...prevUserData.datasets[0],
        //           data: revenueData.content.map((data) => data.cost),
        //         },
        //       ],
        //     }));
        //   })
        //   .catch((error) => {
        //     console.log(error);
        //   });
      }, []);

      useEffect(() => {
        const date = new Date();
        const currentMonth = date.getMonth() + 1;
        const currentMonthData = contentRevenue.filter(content => content.month === currentMonth)
        console.log("currentMonthData", currentMonthData);
      })

console.log("subData", subData);
    if (!props.authenticated) {
        return <Navigate
            to={{
                pathname: "/login-rentaler",
                state: { from: location }
            }} />;
    }

    return (
        <div className="wrapper">
            <nav id="sidebar" className="sidebar js-sidebar">
                <div className="sidebar-content js-simplebar">
                    <a className="sidebar-brand" href="/rentaler/">
                        <span className="align-middle">RENTALER PRO</span>
                    </a>
                    <SidebarNav />
                </div>
            </nav>

            <div className="main">
                <Nav onLogout={onLogout} currentUser={currentUser} />

                <main style={{ margin: "20px 20px 20px 20px" }}>
                    <div className="container-fluid p-0">
                        <div className="row mb-2 mb-xl-3">
                            <div className="col-auto d-none d-sm-block">
                                <h3><strong>✨</strong> Statistics</h3>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-6 col-xl-3">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col mt-0">
                                                <h5 className="card-title">Total rooms</h5>
                                            </div>

                                            <div className="col-auto">
                                                <div className="stat text-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                         viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2"
                                                         strokeLinecap="round"
                                                         strokeLinejoin="round"
                                                         className="feather feather-door align-middle">
                                                        <rect x="6" y="2" width="12" height="20"></rect>
                                                        <circle cx="15" cy="12" r="1"></circle>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <h1 className="mt-1 mb-3">{number.numberOfRoom}</h1>
                                        <div className="mb-0">
                                            <span className="badge badge-success-light"> <i className="mdi mdi-arrow-bottom-right"></i> 3.65% </span>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-xl-3">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col mt-0">
                                                <h5 className="card-title">Number of tenants</h5>
                                            </div>

                                            <div className="col-auto">
                                                <div className="stat text-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                         viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2"
                                                         strokeLinecap="round"
                                                         strokeLinejoin="round"
                                                         className="feather feather-user align-middle">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                        <circle cx="12" cy="7" r="4"></circle>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <h1 className="mt-1 mb-3">{number.numberOfPeople}</h1>
                                        <div className="mb-0">
                                            <span className="badge badge-danger-light"> <i
                                                className="mdi mdi-arrow-bottom-right"></i> -5.25% </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-xl-3">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col mt-0">
                                                <h5 className="card-title">Available rooms</h5>
                                            </div>

                                            <div className="col-auto">
                                                <div className="stat text-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                         viewBox="0 0 24 24"
                                                         fill="none" stroke="#008001" strokeWidth="2"
                                                         strokeLinecap="round"
                                                         strokeLinejoin="round"
                                                         className="feather feather-check-circle align-middle">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <h1 className="mt-1 mb-3">{number.numberOfEmptyRoom}</h1>
                                        <div className="mb-0">
                                            <span className="badge badge-success-light"> <i
                                                className="mdi mdi-arrow-bottom-right"></i> 4.65% </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-xl-3">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col mt-0">
                                                <h5 className="card-title">Doanh Thu</h5>
                                            </div>

                                            <div className="col-auto">
                                                <div className="stat text-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                         viewBox="0 0 24 24"
                                                         fill="none" stroke="currentColor" strokeWidth="2"
                                                         strokeLinecap="round"
                                                         strokeLinejoin="round"
                                                         className="feather feather-dollar-sign align-middle">
                                                        <line x1="12" y1="1" x2="12" y2="23"></line>
                                                        <path
                                                            d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <h1 className="mt-1 mb-4"
                                            style={{fontSize: "xx-large"}}>{number.revenue.toLocaleString('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        })}
                                        </h1>
                                        <div className="mb-0">
                                            <span className="badge badge-success-light"> <i className="mdi mdi-arrow-bottom-right"></i> 2.35% </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 col-lg-6 d-flex">
                                <div className="card flex-fill w-100">
                                    <div className="card-header">
                                        <div className="float-end">

                                        </div>
                                        <h5 className="card-title mb-0">Doanh Thu Tiền Phòng</h5>
                                    </div>
                                    <div className="card-body pt-2 pb-3">
                                        <div className="chart chart-md"><div className="chartjs-size-monitor"><div className="chartjs-size-monitor-expand"><div class=""></div></div><div class="chartjs-size-monitor-shrink"><div class=""></div></div></div>
                                            <BarChart chartData={userData} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-lg-6 d-flex">
                                <div className="card flex-fill w-100">
                                    <div className="card-header">
                                        <div className="float-end">
                                        </div>
                                        <h5 className="card-title mb-0">Doanh Thu Từ Chi Phí Khác</h5>
                                    </div>
                                    <SubChart chartData={subData} />
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    )
}

export default DashboardRentaler;