
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

// import required modules

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getRoom } from '../../../services/fetch/ApiUtils';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Map from '../map/MyMapComponent';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import { Button, Comment, Form } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import axios from 'axios';


const ModalRoomDetails = ({ roomId }) => {

    const [comments, setComments] = useState();
    const [roomData, setRoomData] = useState({
        title: '',
        description: '',
        price: 0,
        latitude: 0.0,
        longitude: 0.0,
        address: '',
        locationId: 0,
        category: [{
            id: '', name: ''
        }],
        assets: [
            { name: '', number: '' }
        ],
        roomMedia: [],
        user: ''
    });

    useEffect(() => {
        getRoom(roomId)
            .then(response => {
                const room = response;
                setRoomData(prevState => ({
                    ...prevState,
                    ...room
                }));
            })
            .catch(error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            });
            fetchComments();
    }, [roomId]);



    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/room/${roomId}/comments`);
            const comments = response.data; // Assuming API returns comments data
            setComments(comments);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };


    console.log(roomData)
    return (
        <>
                            <section>
                                <div className="container">
                                    <div className="row">
                                        <div id="property-single-carousel" className="swiper">
                                            <Swiper navigation={true} modules={[Navigation]} className="swiper-wrapper">
                                                {roomData.roomMedia.map(item => {

                                                    return (
                                                        <SwiperSlide className="carousel-item-b swiper-slide">
                                                            <img src={item.files} alt="" style={{width: "100%"}}/>
                                                        </SwiperSlide>
                                                    )
                                                })}
                                            </Swiper>
                                        </div>
                                        <div className="col-md-12 col-lg-8">
                                            <div className="title-single-box">
                                                <h1 className="title-single">{roomData?.title}</h1>
                                                <span className="color-text-a">{roomData?.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

            <section class="property-single nav-arrow-b">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-lg-8">
                            <div id="property-single-carousel" class="swiper">
                                <Swiper navigation={true} modules={[Navigation]} className="swiper-wrapper">
                                    {roomData.roomMedia.map(item => {

                                        return (
                                            <SwiperSlide className="carousel-item-b swiper-slide">
                                                <img src={item.files} alt="" style={{ width: "100%" }} />
                                                            </SwiperSlide>
                                                        )
                                                    })}
                                                </Swiper>
                                            </div>
                                            <div class="property-single-carousel-pagination carousel-pagination"></div>
                                        </div>
                                    </div>


                                    <div class="row">
                                        <div class="col-sm-12">

                                            <div class="row justify-content-between">
                                                <div class="col-md-5 col-lg-4">
                                                    <div class="property-price d-flex justify-content-center foo">
                                                        <div class="card-header-c d-flex">
                                                            <div class="card-box-ico">
                                                                <span class="bi bi-cash"></span>
                                                            </div>
                                                            <div class="card-title-c align-self-center">
                                                                <h5 class="title-c">{roomData?.price.toLocaleString('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND',
                                                                })}</h5>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="property-summary">
                                                        <div class="row">
                                                            <div class="col-sm-12">
                                                                <div class="title-box-d section-t4">
                                                                    <h3 class="title-d">Tóm tắt nhanh</h3>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="summary-list">
                                                            <ul class="list">
                                                                <li class="d-flex justify-content-between">
                                                                    <strong>Mã ID:</strong>
                                                                    <span>{roomId}</span>
                                                                </li>
                                                                <li class="d-flex justify-content-between">
                                                                    <strong>Địa chỉ:</strong>
                                                                    <span>{roomData?.address}</span>
                                                                </li>
                                                                <li class="d-flex justify-content-between">
                                                                    <strong>Thể loại:</strong>
                                                                    <span>Phòng trọ</span>
                                                                </li>
                                                                <li class="d-flex justify-content-between">
                                                                    <strong>Trạng thái:</strong>
                                                                    <span>Chưa thuê</span>
                                                                </li>
                                                                {roomData.assets.map((asset, index) => (
                                                                    <li class="d-flex justify-content-between">

                                                                        <strong>{asset.name}:</strong>
                                                                        <span>
                                                                            <sup>{asset.number}</sup>
                                                                        </span>

                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-7 col-lg-7 section-md-t3">
                                                    <div class="row">
                                                        <div class="col-sm-12">
                                                            <div class="title-box-d">
                                                                <h3 class="title-d">Kê khai tài sản</h3>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="property-description">
                                                        <p class="description color-text-a">
                                                            {roomData.description}
                                                        </p>
                                                    </div>
                                                    <div class="row section-t3">
                                                        <div class="col-sm-12">
                                                            <div class="title-box-d">
                                                                <h3 class="title-d">Tiện ích</h3>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="amenities-list color-text-a">
                                                        <ul class="list-a no-margin">
                                                            <li>Ban công</li>
                                                            <li>Bể bơi</li>
                                                            <li>Trần phơi</li>
                                                            <li>Khu vui chơi</li>
                                                            <li>Phòng tenis</li>
                                                            <li>Khu vệ sinh</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-10 offset-md-1">
                                            <ul class="nav nav-pills-a nav-pills mb-3 section-t3" id="pills-tab" role="tablist">
                                                <li class="nav-item">
                                                    <a class="nav-link active" id="pills-video-tab" data-bs-toggle="pill" href="#pills-video" role="tab" aria-controls="pills-video" aria-selected="true">Video</a>
                                                </li>
                                                <li class="nav-item">
                                                    <a class="nav-link" id="pills-plans-tab" data-bs-toggle="pill" href="#pills-plans" role="tab" aria-controls="pills-plans" aria-selected="false">Sơ đồ tầng</a>
                                                </li>
                                                <li class="nav-item">
                                                    <a class="nav-link" id="pills-map-tab" data-bs-toggle="pill" href="#pills-map" role="tab" aria-controls="pills-map" aria-selected="false">Địa chỉ</a>
                                                </li>
                                            </ul>
                                            <div class="tab-content" id="pills-tabContent">
                                                <div class="tab-pane fade show active" id="pills-video" role="tabpanel" aria-labelledby="pills-video-tab">
                                                    <iframe src="https://player.vimeo.com/video/73221098" width="100%" height="460" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
                                                </div>
                                                <div class="tab-pane fade" id="pills-plans" role="tabpanel" aria-labelledby="pills-plans-tab">
                                                    <img src="../../assets/img/plan2.jpg" alt="" class="img-fluid" />
                                                </div>
                                                <div class="tab-pane fade" id="pills-map" role="tabpanel" aria-labelledby="pills-map-tab">
                                                    <Map latitude={roomData.latitude} longitude={roomData.longitude} />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-12">
                                            <div class="row section-t3">
                                                <div class="col-sm-12">
                                                    <div class="title-box-d">
                                                        <h3 class="title-d">Liên hệ</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-6 col-lg-4">
                                                    <img src={roomData.user.imageUrl} alt="" class="img-fluid" />
                                                </div>
                                                <div class="col-md-6 col-lg-4">
                                                    <div class="property-agent">
                                                        <h4 class="title-agent">{roomData.user.name}</h4>
                                                        <p class="color-text-a">
                                                            Phòng luôn chất lượng đảm bảo đúng sự thật và không các chi tiết khiến người dùng thất vọng
                                                            khi đến xem và kiểm tra phòng. An ninh tuyệt đối.
                                                        </p>
                                                        <ul class="list-unstyled">
                                                            <li class="d-flex justify-content-between">
                                                                <strong>Điện thoại:</strong>
                                                                <span class="color-text-a">{roomData.user.phone}</span>
                                                            </li>
                                                            <li class="d-flex justify-content-between">
                                                                <strong>Email:</strong>
                                                                <span class="color-text-a">{roomData.user.email}</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div class="col-md-12 col-lg-4">
                                                    <div class="property-contact">
                                                        <form class="form-a">
                                                            <div class="row">
                                                                <div class="col-md-12 mb-1">
                                                                    <div class="form-group">
                                                                        <input type="text" class="form-control form-control-lg form-control-a" id="inputName" placeholder="Name *" required />
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-12 mb-1">
                                                                    <div class="form-group">
                                                                        <input type="email" class="form-control form-control-lg form-control-a" id="inputEmail1" placeholder="Email *" required />
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-12 mb-1">
                                                                    <div class="form-group">
                                                                        <textarea id="textMessage" class="form-control" placeholder="Comment *" name="message" cols="45" rows="8" required></textarea>
                                                                    </div>
                                                                </div>
                                                                <div class="col-md-12 mt-3">
                                                                    <button type="submit" class="btn btn-a">Send Message</button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-12">
                                            <div class="row section-t3">
                                                <div class="col-sm-12">
                                                    <div class="title-box-d">
                                                        <h3 class="title-d">Bình luận và đánh giá</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-6 col-lg-4">
                                                    <div class="property-agent">
                                                        {/* <h4 class="title-agent">{rooms ? rooms.user.name : ""}</h4> */}
                                                        <Comment.Group>
                                                            {comments && comments.map((comment) => (
                                                                <Comment>
                                                                    <Comment.Content style={{ padding: '1rem' }}>
                                                                        <Stack spacing={1}>
                                                                            <Rating name="half-rating" defaultValue={comment.rateRating} precision={0.5} readOnly />
                                                                        </Stack>
                                                                        {comment.user.imageUrl ?
                                                                            <Comment.Avatar src={comment.user.imageUrl} style={{ marginRight: "10px" }} />
                                                                            :
                                                                            <Comment.Avatar src="../../assets/img/agent-1.jpg" style={{ marginRight: "10px" }} />
                                                                        }
                                                                        <Comment.Author as='a'>{comment.user.name}</Comment.Author>
                                                                        <Comment.Metadata>
                                                                            <div>{comment.createdAt}</div>
                                                                        </Comment.Metadata>
                                                                        <Comment.Text>{comment.content}</Comment.Text>
                                                                    </Comment.Content>
                                                                </Comment>
                                                            ))}
                                                        </Comment.Group>
                                                    </div>
                                                </div>
                                            </div>


                                        </div>
                                    </div>
                                </div>
                            </section>



            
        </>
    )
}


export default ModalRoomDetails;