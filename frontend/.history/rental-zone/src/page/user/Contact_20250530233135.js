import React, { useState } from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import { Link } from 'react-router-dom';
import { sendEmailForContact } from '../../services/fetch/ApiUtils';
import { toast } from 'react-toastify';

const Contact = (props) => {
  const [title, setTitle] = useState('');
  const [nameOfRentaler, setNameOfRentaler] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [description, setDescription] = useState('');

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
};

const handleRentalerChange = (event) => {
    setNameOfRentaler(event.target.value);
};

const handleToEmailChange = (event) => {
    setToEmail(event.target.value);
};

const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
};

const handleSubmit = (event) => {
    event.preventDefault();
    const sendEmailRequest = { title, nameOfRentaler, toEmail, description };
    sendEmailForContact(sendEmailRequest).then(response => {
        console.log(response.message)
        toast.success(response.message)
        setTitle('');
        setDescription('');
    }).catch(
        error => {
            toast.error((error && error.message) || 'Oops! Có điều gì đó xảy ra. Vui lòng thử lại!');
        }
    )
};
  return (
    <>
      <Header
        authenticated={props.authenticated}
        currentUser={props.currentUser}
        onLogout={props.onLogout}
      />
      <main id="main">
        <section className="intro-single">
          <div className="container">
            <div className="row">
              <div className="col-md-12 col-lg-8">
                <div className="title-single-box">
                  <h1 className="title-single">Contact Us</h1>
                  <span className="color-text-a">
                    If you have any questions, please contact us. We will get back to you soon.
                  </span>
                </div>
              </div>
              <div className="col-md-12 col-lg-4">
                <nav aria-label="breadcrumb" className="breadcrumb-box d-flex justify-content-lg-end">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Contact
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </section>
        <section className="contact">
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <div className="contact-map box">
                  <div id="map" className="contact-map">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes+Square!5e0!3m2!1ses-419!2sve!4v1510329142834"
                      width="100%"
                      height="450"
                      frameBorder="0"
                      style={{ border: '0' }}
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
              <div className="col-sm-12 section-t8">
                <div className="row">
                  <div className="col-md-7">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <input
                              type="text"
                              name="nameOfRentaler"
                              value={nameOfRentaler}
                              onChange={handleRentalerChange}
                              className="form-control form-control-lg form-control-a"
                              placeholder="Full Name"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="form-group">
                            <input
                              name="toEmail"
                              value={toEmail}
                              onChange={handleToEmailChange}
                              type="email"
                              className="form-control form-control-lg form-control-a"
                              placeholder="Your Email"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-12 mb-3">
                          <div className="form-group">
                            <input
                              type="text"
                              name="title"
                              value={title}
                              onChange={handleTitleChange}
                              className="form-control form-control-lg form-control-a"
                              placeholder="Subject"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="form-group">
                            <textarea
                              name="description"
                              value={description}
                              onChange={handleDescriptionChange}
                              className="form-control"
                              cols="45"
                              rows="8"
                              placeholder="Message"
                              required
                            ></textarea>
                          </div>
                        </div>
                        <div className="col-md-12">
                        <button
                          type="submit"
                          className="btn btn-a"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="col-md-5 section-md-t3">
                  <div className="icon-box section-b2">
                    <div className="icon-box-icon">
                      <span className="ion-ios-paper-plane"></span>
                    </div>
                    <div className="icon-box-content table-cell">
                      <div className="icon-box-title">
                        <h4 className="icon-title">Contact</h4>
                      </div>
                      <div className="icon-box-content">
                        <p className="mb-1">
                          <span className="color-a">Address:</span> Thanh Xuan, Hanoi City
                        </p>
                        <p className="mb-1">
                          <span className="color-a">Phone:</span> +84 9688 09252
                        </p>
                        <p className="mb-1">
                          <span className="color-a">Email:</span> thanhvuworkspace@gmail.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Contact;