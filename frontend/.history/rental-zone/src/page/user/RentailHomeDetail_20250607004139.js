import React, { Component } from "react";
import Header from "../../common/Header";
import Footer from "../../common/Footer";
import axios from "axios"; // Import axios for making API requests
import { Swiper, SwiperSlide } from 'swiper/react';
import "react-alice-carousel/lib/alice-carousel.css";
import { Navigation } from 'swiper/modules';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import { Button, Comment, Form } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import Map from "../rentaler/map/MyMapComponent";
import { saveBlog, sendEmailForContact } from "../../services/fetch/ApiUtils";
import { toast } from "react-toastify";

class RentailHomeDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rooms: null, // State to store fetched rooms data
            showCommentForm: false,
            content: "",
            rate: 5,
            submittingComment: false,
            comments: [],
            toEmail: "",
            description: "",
            title: "",
            nameOfRentaler: "",
        };
    }

    componentDidMount() {
        this.fetchRooms(); // Call the fetchRooms function when component mounts
        this.fetchComments();
    }

    handleInputChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const sendEmailRequest = { title: this.state.title, nameOfRentaler: this.state.nameOfRentaler, toEmail: this.state.toEmail, description: this.state.description };
        sendEmailForContact(sendEmailRequest).then(response => {
            console.log(response.message)
            toast.success(response.message)
            this.setState({
                title: "",
                nameOfRentaler: "",
                description: ""
            })
        }).catch(
            error => {
                toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
            }
        )
    };


    fetchRooms = async () => {
        try {
            const id = window.location.pathname.split("/").pop();
            const response = await axios.get(`http://localhost:8080/room/${id}`);
            const data = response.data; // Assuming API returns rooms data

            this.setState({
                rooms: data,
            });
            this.setState({
                toEmail: data.user?.email
            })
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    fetchComments = async () => {
        try {
            const id = window.location.pathname.split("/").pop();
            const response = await axios.get(`http://localhost:8080/room/${id}/comments`);
            const comments = response.data; // Assuming API returns comments data

            this.setState({
                comments: comments,
            });
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    handleSaveBlog = (id) => {
        const storeRequest = { roomId: id };
        saveBlog(storeRequest)
            .then(response => {
                toast.success(response.message)
            })
            .catch(error => {
                toast.error((error && error.message) || 'Vui lòng đăng nhập để có thể lưu bài đăng.');
            });

    }

    handleSubmitComment = async (event) => {
        event.preventDefault();
        const { content, rate, rooms } = this.state;
        const roomId = window.location.pathname.split("/").pop();; // Assuming room id is available

        // Construct the comment data
        const commentData = {
            content: content,
            rateRating: rate,
            room_id: roomId,
        };

        // Replace with your JWT token retrieval logic from localStorage
        const accessToken = localStorage.getItem("accessToken");

        try {
            this.setState({ submittingComment: true });
            // Make the API request to submit the comment
            const response = await axios.post(
                `http://localhost:8080/room/${roomId}/comments`,
                commentData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            // Handle success and reset the form
            console.log("Comment submitted:", response.data);
            this.setState({
                content: "",
                rate: 5,
                submittingComment: false,
                showCommentForm: false, // Hide the form after submitting
            });
            this.fetchComments();
        } catch (error) {
            console.log(commentData)
            console.error("Error submitting comment:", error);
            this.setState({ submittingComment: false });
        }
    };

    render() {

        const { rooms, comments, showCommentForm, content, rate, submittingComment } = this.state;

        return (
            <>
                <Header authenticated={this.props.authenticated} currentUser={this.props.currentUser} onLogout={this.props.onLogout} />
                <main id="main">
                    <section class="intro-single">
                        <div class="container">
                            <div class="row">
                                <div class="col-md-12 col-lg-8">
                                    <div class="title-single-box">
                                        <h1 class="title-single">{rooms ? rooms.title : ""} </h1>
                                        <span class="color-text-a">Area: {rooms ? rooms.location?.cityName : ""}</span> &nbsp;&nbsp;
                                        <button type="button" onClick={() => this.handleSaveBlog(rooms?.id)} class="btn btn-outline-success rounded-pill">Save +</button>
                                    </div>
                                </div>
                                <div class="col-md-12 col-lg-4">
                                    <nav aria-label="breadcrumb" class="breadcrumb-box d-flex justify-content-lg-end">
                                        <ol class="breadcrumb">
                                            <li class="breadcrumb-item">
                                                <a href="/">Home</a>
                                            </li>
                                            <li class="breadcrumb-item">
                                                {rooms ? rooms.category?.name : ""}
                                            </li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="property-single nav-arrow-b">
                        <div class="container">
                            <div class="row justify-content-center">
                                {/* Gallery & Price */}
                                <div className="col-lg-8 mb-4">
                                    <div className="property-gallery mb-3">
                                        <Swiper autoHeight navigation modules={[Navigation]} className="swiper-wrapper">
                                            {rooms && rooms.roomMedia?.map((media, idx) => (
                                                <SwiperSlide className="carousel-item-b swiper-slide" key={idx}>
                                                    <img src={"http://localhost:8080/document/" + media.files} alt="" style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "12px" }} />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h2 className="fw-bold mb-0">{rooms?.title}</h2>
                                        <span className="badge bg-success fs-5">
                                            {rooms?.price?.toLocaleString('en-US', { style: 'currency', currency: 'VND' })}
                                        </span>
                                    </div>
                                    <div className="mb-2 text-muted">
                                        <i className="bi bi-geo-alt"></i> {rooms?.address}
                                    </div>
                                    <div className="mb-3">
                                        <span className="me-3"><b>Type:</b> {rooms?.category?.name}</span>
                                        <span className="me-3"><b>Status:</b> {rooms?.status === "ROOM_RENT" ? "For rent" : "Rented"}</span>
                                        <span><b>Area:</b> {rooms?.location?.cityName}</span>
                                    </div>
                                    <div className="mb-4">
                                        <h5 className="fw-semibold">Description</h5>
                                        <p className="text-secondary">{rooms?.description}</p>
                                    </div>
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <h6 className="fw-semibold">Assets</h6>
                                            <ul className="list-group list-group-flush">
                                                {rooms?.assets?.map((item, idx) => (
                                                    <li className="list-group-item d-flex justify-content-between" key={idx}>
                                                        <span>{item?.name}</span>
                                                        <span className="badge bg-light text-dark">{item.number}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="col-md-6">
                                            <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                                                <li className="nav-item" role="presentation">
                                                    <button className="nav-link active" id="pills-video-tab" data-bs-toggle="pill" data-bs-target="#pills-video" type="button" role="tab" aria-controls="pills-video" aria-selected="true">Video</button>
                                                </li>
                                                <li className="nav-item" role="presentation">
                                                    <button className="nav-link" id="pills-plans-tab" data-bs-toggle="pill" data-bs-target="#pills-plans" type="button" role="tab" aria-controls="pills-plans" aria-selected="false">Infrastructure</button>
                                                </li>
                                                <li className="nav-item" role="presentation">
                                                    <button className="nav-link" id="pills-map-tab" data-bs-toggle="pill" data-bs-target="#pills-map" type="button" role="tab" aria-controls="pills-map" aria-selected="false">Map</button>
                                                </li>
                                            </ul>
                                            <div className="tab-content" id="pills-tabContent">
                                                <div className="tab-pane fade show active" id="pills-video" role="tabpanel" aria-labelledby="pills-video-tab">
                                                    <iframe
                                                        src="https://player.vimeo.com/video/73221098"
                                                        width="100%"
                                                        height="320" // tăng chiều cao từ 220 lên 320
                                                        style={{ borderRadius: "12px" }}
                                                        frameBorder="0"
                                                        allowFullScreen
                                                        title="Room Video"
                                                    ></iframe>
                                                </div>
                                                <div className="tab-pane fade" id="pills-plans" role="tabpanel" aria-labelledby="pills-plans-tab">
                                                    <img src="../../assets/img/plan2.jpg" alt="Plan" className="img-fluid rounded" />
                                                </div>
                                                <div className="tab-pane fade" id="pills-map" role="tabpanel" aria-labelledby="pills-map-tab">
                                                    <Map latitude={rooms?.latitude} longitude={rooms?.longitude} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Sidebar: Landlord & Contact */}
                                <div className="col-lg-4">
                                    <div className="card mb-4 shadow-sm">
                                        <div className="card-body text-center">
                                            <img src={rooms?.user?.imageUrl || "../../assets/img/agent-4.jpg"} alt="Landlord" className="rounded-circle mb-3" style={{ width: 100, height: 100, objectFit: "cover" }} />
                                            <h5 className="fw-bold">{rooms?.user?.name}</h5>
                                            <p className="text-muted mb-2">{rooms?.user?.address}</p>
                                            <div className="mb-2">
                                                <span className="d-block"><i className="bi bi-telephone"></i> {rooms?.user?.phone}</span>
                                                <span className="d-block"><i className="bi bi-envelope"></i> {rooms?.user?.email}</span>
                                            </div>
                                            <div className="mb-3">
                                                {rooms?.user?.facebookUrl && (
                                                    <a href={rooms.user.facebookUrl} className="btn btn-sm btn-outline-primary rounded-circle me-2" target="_blank" rel="noopener noreferrer">
                                                        <i className="bi bi-facebook"></i>
                                                    </a>
                                                )}
                                                {rooms?.user?.zaloUrl && (
                                                    <a href={rooms.user.zaloUrl} className="btn btn-sm btn-outline-success rounded-circle" target="_blank" rel="noopener noreferrer">
                                                        {/* Zalo SVG */}
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 50 50">
                                                            <path d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 15.576172 6 C 12.118043 9.5981082 10 14.323627 10 19.5 C 10 24.861353 12.268148 29.748596 15.949219 33.388672 C 15.815412 33.261195 15.988635 33.48288 16.005859 33.875 C 16.023639 34.279773 15.962689 34.835916 15.798828 35.386719 C 15.471108 36.488324 14.785653 37.503741 13.683594 37.871094 A 1.0001 1.0001 0 0 0 13.804688 39.800781 C 16.564391 40.352722 18.51646 39.521812 19.955078 38.861328 C 21.393696 38.200845 22.171033 37.756375 23.625 38.34375 A 1.0001 1.0001 0 0 0 23.636719 38.347656 C 26.359037 39.41176 29.356235 40 32.5 40 C 36.69732 40 40.631169 38.95117 44 37.123047 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 18.496094 6 L 41 6 C 42.668484 6 44 7.3315161 44 9 L 44 34.804688 C 40.72689 36.812719 36.774644 38 32.5 38 C 29.610147 38 26.863646 37.459407 24.375 36.488281 C 22.261967 35.634656 20.540725 36.391201 19.121094 37.042969 C 18.352251 37.395952 17.593707 37.689389 16.736328 37.851562 C 17.160501 37.246758 17.523335 36.600775 17.714844 35.957031 C 17.941109 35.196459 18.033096 34.45168 18.003906 33.787109 C 17.974816 33.12484 17.916946 32.518297 17.357422 31.96875 L 17.355469 31.966797 C 14.016928 28.665356 12 24.298743 12 19.5 C 12 14.177406 14.48618 9.3876296 18.496094 6 z M 32.984375 14.986328 A 1.0001 1.0001 0 0 0 32 16 L 32 25 A 1.0001 1.0001 0 1 0 34 25 L 34 16 A 1.0001 1.0001 0 0 0 32.984375 14.986328 z M 18 16 A 1.0001 1.0001 0 1 0 18 18 L 21.197266 18 L 17.152344 24.470703 A 1.0001 1.0001 0 0 0 18 26 L 23 26 A 1.0001 1.0001 0 1 0 23 24 L 19.802734 24 L 23.847656 17.529297 A 1.0001 1.0001 0 0 0 23 16 L 18 16 z M 29.984375 18.986328 A 1.0001 1.0001 0 0 0 29.162109 19.443359 C 28.664523 19.170123 28.103459 19 27.5 19 C 25.578848 19 24 20.578848 24 22.5 C 24 24.421152 25.578848 26 27.5 26 C 28.10285 26 28.662926 25.829365 29.160156 25.556641 A 1.0001 1.0001 0 0 0 31 25 L 31 22.5 L 31 20 A 1.0001 1.0001 0 0 0 29.984375 18.986328 z M 38.5 19 C 36.578848 19 35 20.578848 35 22.5 C 35 24.421152 36.578848 26 38.5 26 C 40.421152 26 42 24.421152 42 22.5 C 42 20.578848 40.421152 19 38.5 19 z M 27.5 21 C 28.340272 21 29 21.659728 29 22.5 C 29 23.340272 28.340272 24 27.5 24 C 26.659728 24 26 23.340272 26 22.5 C 26 21.659728 26.659728 21 27.5 21 z M 38.5 21 C 39.340272 21 40 21.659728 40 22.5 C 40 23.340272 39.340272 24 38.5 24 C 37.659728 24 37 23.340272 37 22.5 C 37 21.659728 37.659728 21 38.5 21 z"></path>
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card shadow-sm">
                                        <div className="card-body">
                                            <h5 className="fw-semibold mb-3">Contact Landlord</h5>
                                            <form className="form-a" onSubmit={this.handleSubmit}>
                                                <div className="mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Your Name *"
                                                        name="nameOfRentaler"
                                                        value={this.state.nameOfRentaler}
                                                        onChange={this.handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        placeholder="Your Email *"
                                                        name="title"
                                                        value={this.state.title}
                                                        onChange={this.handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <textarea
                                                        className="form-control"
                                                        placeholder="Message *"
                                                        name="description"
                                                        value={this.state.description}
                                                        onChange={this.handleInputChange}
                                                        rows="5"
                                                        required
                                                    ></textarea>
                                                </div>
                                                <button type="submit" className="btn btn-success w-100">Send Message</button>
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
                                            <h4 className="fw-semibold mb-4">Comments & Reviews</h4>
                                            <Comment.Group>
                                                {comments && comments.length > 0 ? comments.map((comment, idx) => (
                                                    <Comment key={idx}>
                                                        <Comment.Content style={{ padding: '1rem' }}>
                                                            <Stack spacing={1}>
                                                                <Rating name="half-rating" defaultValue={comment.rateRating} precision={0.5} readOnly />
                                                            </Stack>
                                                            {comment.user?.imageUrl ?
                                                                <Comment.Avatar src={comment.user.imageUrl} style={{ marginRight: "10px" }} />
                                                                :
                                                                <Comment.Avatar src="../../assets/img/agent-1.jpg" style={{ marginRight: "10px" }} />
                                                            }
                                                            <Comment.Author as='a'>{comment.user?.name}</Comment.Author>
                                                            <Comment.Metadata>
                                                                <div>{comment.createdAt}</div>
                                                            </Comment.Metadata>
                                                            <Comment.Text>{comment.content}</Comment.Text>
                                                        </Comment.Content>
                                                    </Comment>
                                                )) : <div className="text-muted">No comments yet.</div>}
                                            </Comment.Group>
                                            {this.props.authenticated &&
                                                (showCommentForm ? (
                                                    <Form onSubmit={this.handleSubmitComment} className="mt-4">
                                                        <h6>Rate the quality</h6>
                                                        <Stack spacing={1}>
                                                            <Rating
                                                                name="half-rating"
                                                                value={rate}
                                                                precision={0.5}
                                                                onChange={(event, newValue) =>
                                                                    this.setState({ rate: newValue })
                                                                }
                                                            />
                                                        </Stack>
                                                        <Form.TextArea
                                                            label="Room quality"
                                                            placeholder="Leave your feedback here...."
                                                            value={content}
                                                            onChange={(event) =>
                                                                this.setState({ content: event.target.value })
                                                            }
                                                        />
                                                        <div className="mt-3">
                                                            <Button
                                                                type="submit"
                                                                className="btn btn-success"
                                                                disabled={submittingComment}
                                                            >
                                                                {submittingComment ? "Sending..." : "Comment"}
                                                            </Button>
                                                        </div>
                                                    </Form>
                                                ) : (
                                                    <div className="mt-3">
                                                        <button onClick={() => this.setState({ showCommentForm: true })} className="btn btn-outline-success">Add Comment</button>
                                                    </div>
                                                ))
                                            }
                                            {!this.props.authenticated && <div className="text-danger mt-3">Please log in to comment and review.</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </main>
                <Footer />
            </>
        )
    }
}

export default RentailHomeDetail;