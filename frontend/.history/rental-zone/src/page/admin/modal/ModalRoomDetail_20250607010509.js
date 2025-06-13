// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import './ModalRoomDetail.css'

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
                    <div className="row align-items-center mb-4">
                        <div className="col-md-8">
                            <h1 className="fw-bold mb-1">
                                <i className="bi bi-house-door-fill text-primary me-2"></i>
                                {roomData?.title}
                            </h1>
                            <span className="text-muted">
                                <i className="bi bi-geo-alt-fill me-1"></i>
                                {roomData?.address}
                            </span>
                        </div>
                        <div className="col-md-4 text-md-end mt-3 mt-md-0">
                            <span className="fs-4 fw-semibold text-success">
                                <i className="bi bi-cash-coin me-2"></i>
                                {roomData?.price?.toLocaleString('en-US', { style: 'currency', currency: 'VND' })}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="property-single nav-arrow-b">
                <div className="container">
                    <div className="row">
                        {/* Left: Gallery & Tabs */}
                        <div className="col-lg-8 mb-4">
                            {/* Gallery */}
                            <div className="mb-4">
                                <Swiper navigation modules={[Navigation]}>
                                    {roomData.roomMedia?.map((media, idx) => (
                                        <SwiperSlide key={idx}>
                                            <img
                                                src={`http://localhost:8080/document/${media.files}`}
                                                alt=""
                                                style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "12px" }}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                            {/* Tabs */}
                            <div className="card shadow-sm mb-4">
                                <div className="card-body">
                                    <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link active" id="pills-video-tab" data-bs-toggle="pill" data-bs-target="#pills-video" type="button" role="tab" aria-controls="pills-video" aria-selected="true">
                                                <i className="bi bi-camera-video-fill me-1"></i> Video
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link" id="pills-plans-tab" data-bs-toggle="pill" data-bs-target="#pills-plans" type="button" role="tab" aria-controls="pills-plans" aria-selected="false">
                                                <i className="bi bi-layout-text-window-reverse me-1"></i> Floor Plan
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link" id="pills-map-tab" data-bs-toggle="pill" data-bs-target="#pills-map" type="button" role="tab" aria-controls="pills-map" aria-selected="false">
                                                <i className="bi bi-map-fill me-1"></i> Map
                                            </button>
                                        </li>
                                    </ul>
                                    <div className="tab-content" id="pills-tabContent">
                                        <div className="tab-pane fade show active" id="pills-video" role="tabpanel" aria-labelledby="pills-video-tab">
                                            <div style={{ display: "flex", justifyContent: "center" }}>
                                                <iframe
                                                    src="https://player.vimeo.com/video/73221098"
                                                    width="90%"
                                                    height="400"
                                                    style={{ borderRadius: "12px", maxWidth: 800, minHeight: 320 }}
                                                    frameBorder="0"
                                                    allowFullScreen
                                                    title="Room Video"
                                                ></iframe>
                                            </div>
                                        </div>
                                        <div className="tab-pane fade" id="pills-plans" role="tabpanel" aria-labelledby="pills-plans-tab">
                                            <img src="../../assets/img/plan2.jpg" alt="Plan" className="img-fluid rounded" />
                                        </div>
                                        <div className="tab-pane fade" id="pills-map" role="tabpanel" aria-labelledby="pills-map-tab">
                                            <Map latitude={roomData.latitude} longitude={roomData.longitude} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Description & Amenities */}
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <h5 className="fw-semibold mb-2">
                                                <i className="bi bi-card-text me-2"></i>
                                                Description
                                            </h5>
                                            <p className="text-secondary">{roomData.description}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <h5 className="fw-semibold mb-2">
                                                <i className="bi bi-stars me-2"></i>
                                                Amenities
                                            </h5>
                                            <ul className="list-unstyled mb-0">
                                                <li><i className="bi bi-flower1 me-1"></i> Balcony</li>
                                                <li><i className="bi bi-tree-fill me-1"></i> Terrace</li>
                                                <li><i className="bi bi-cloud-sun-fill me-1"></i> Drying ceiling</li>
                                                <li><i className="bi bi-emoji-smile me-1"></i> Playground</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Assets */}
                            <div className="card mt-4 mb-4">
                                <div className="card-body">
                                    <h5 className="fw-semibold mb-2">
                                        <i className="bi bi-box-seam me-2"></i>
                                        Assets
                                    </h5>
                                    <ul className="list-group list-group-flush">
                                        {roomData.assets.map((asset, index) => (
                                            <li className="list-group-item d-flex justify-content-between" key={index}>
                                                <span><i className="bi bi-dot me-1"></i>{asset.name}</span>
                                                <span className="badge bg-light text-dark">{asset.number}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {/* Right: Landlord & Contact */}
                        <div className="col-lg-4">
                            <div className="card mb-4 shadow-sm">
                                <div className="card-body text-center">
                                    <img src={roomData.user.imageUrl} alt="Landlord" className="rounded-circle mb-3" style={{ width: 100, height: 100, objectFit: "cover" }} />
                                    <h5 className="fw-bold">
                                        <i className="bi bi-person-circle me-2"></i>
                                        {roomData.user.name}
                                    </h5>
                                    <div className="mb-2">
                                        <span className="d-block"><i className="bi bi-telephone me-1"></i> {roomData.user.phone}</span>
                                        <span className="d-block"><i className="bi bi-envelope me-1"></i> {roomData.user.email}</span>
                                    </div>
                                    <p className="text-muted mt-2">
                                        <i className="bi bi-shield-lock me-1"></i>
                                        The room always ensures quality and truthfulness, with no details that disappoint users when they come to view and inspect the room. Absolute security.
                                    </p>
                                </div>
                            </div>
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <h5 className="fw-semibold mb-3">
                                        <i className="bi bi-chat-dots-fill me-2"></i>
                                        Contact Landlord
                                    </h5>
                                    <form className="form-a">
                                        <div className="mb-3">
                                            <input type="text" className="form-control" placeholder="Your Name *" required />
                                        </div>
                                        <div className="mb-3">
                                            <input type="email" className="form-control" placeholder="Your Email *" required />
                                        </div>
                                        <div className="mb-3">
                                            <textarea className="form-control" placeholder="Message *" rows="5" required></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-success w-100">
                                            <i className="bi bi-send-fill me-2"></i>
                                            Send Message
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Comments & Reviews */}
                    <div className="row mt-5">
                        <div className="col-lg-8">
                            <div className="card shadow-sm mb-4">
                                <div className="card-body">
                                    <h4 className="fw-semibold mb-4">
                                        <i className="bi bi-chat-left-text-fill me-2"></i>
                                        Comments & Reviews
                                    </h4>
                                    <Comment.Group>
                                        {comments && comments.length > 0 ? comments.map((comment, idx) => (
                                            <Comment key={idx}>
                                                <Comment.Content style={{ padding: '1rem' }}>
                                                    <Stack spacing={1}>
                                                        <Rating name="half-rating" defaultValue={comment.rateRating} precision={0.5} readOnly icon={<i className="bi bi-star-fill text-warning"></i>} />
                                                    </Stack>
                                                    {comment.user.imageUrl ?
                                                        <Comment.Avatar src={comment.user.imageUrl} style={{ marginRight: "10px" }} />
                                                        :
                                                        <Comment.Avatar src="../../assets/img/agent-1.jpg" style={{ marginRight: "10px" }} />
                                                    }
                                                    <Comment.Author as='a'>
                                                        <i className="bi bi-person-circle me-1"></i>
                                                        {comment.user.name}
                                                    </Comment.Author>
                                                    <Comment.Metadata>
                                                        <div><i className="bi bi-clock me-1"></i>{comment.createdAt}</div>
                                                    </Comment.Metadata>
                                                    <Comment.Text>
                                                        <i className="bi bi-chat-quote me-1"></i>
                                                        {comment.content}
                                                    </Comment.Text>
                                                </Comment.Content>
                                            </Comment>
                                        )) : <div className="text-muted"><i className="bi bi-info-circle me-1"></i>No comments yet.</div>}
                                    </Comment.Group>
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