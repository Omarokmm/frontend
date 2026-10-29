import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as _global from "../../../config/global";

const DepartmentTVView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [clock, setClock] = useState(new Date());
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);

  const videoPlayerRef = useRef(null);

  // Fetch department config
  useEffect(() => {
    const fetchDept = async () => {
      try {
        const res = await axios.get(`${_global.BASE_URL}departments/${id}`);
        setDepartment(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching department for TV:", err);
        setLoading(false);
      }
    };
    fetchDept();

    // Poll updates every 60 seconds
    const interval = setInterval(fetchDept, 60000);
    return () => clearInterval(interval);
  }, [id]);



  // Live Digital Clock
  useEffect(() => {
    const clockTimer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Media Carousel Slide Rotator
  useEffect(() => {
    if (isPaused) return;
    if (!department?.media || department.media.length <= 1) return;

    const currentMedia = department.media[activeSlide];
    if (currentMedia?.resourceType === "video") {
      // Pause automatic sliding during video playback
      return;
    }

    const slideTimer = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % department.media.length);
    }, 10000); // 10s slide timer for images

    return () => clearTimeout(slideTimer);
  }, [activeSlide, department, isPaused]);

  // Video play/pause synchronization
  useEffect(() => {
    if (!videoPlayerRef.current) return;
    if (isPaused) {
      videoPlayerRef.current.pause();
    } else {
      videoPlayerRef.current.play().catch((e) => console.log("video play error:", e));
    }
  }, [isPaused, activeSlide]);

  // Keyboard controls (space, escape, arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setFullscreenMedia(null);
      } else if (e.key === " " && !fullscreenMedia) {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      } else if (e.key === "ArrowLeft" && !fullscreenMedia) {
        if (department?.media && department.media.length > 0) {
          setActiveSlide((prev) => (prev - 1 + department.media.length) % department.media.length);
        }
      } else if (e.key === "ArrowRight" && !fullscreenMedia) {
        if (department?.media && department.media.length > 0) {
          setActiveSlide((prev) => (prev + 1) % department.media.length);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [department, fullscreenMedia]);

  const handleVideoEnded = () => {
    if (department?.media) {
      setActiveSlide((prev) => (prev + 1) % department.media.length);
    }
  };



  const handleMediaClick = (media) => {
    if (!media) return;
    setFullscreenMedia(media);
    setIsPaused(true); // pause automatically to explain
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handlePrevSlide = () => {
    if (!department?.media || department.media.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + department.media.length) % department.media.length);
  };

  const handleNextSlide = () => {
    if (!department?.media || department.media.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % department.media.length);
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center bg-dark text-white" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary me-2" role="status"></div>
        <h4>Initializing TV Display Board...</h4>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="d-flex align-items-center justify-content-center bg-dark text-danger" style={{ height: "100vh" }}>
        <h4>Configuration Error: Department not found.</h4>
      </div>
    );
  }

  const currentMedia = department.media && department.media[activeSlide];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Share+Tech+Mono&display=swap');
        
        .tv-wrapper {
          background-color: #0b0f19;
          color: #f8fafc;
          font-family: 'Outfit', sans-serif;
          height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .tv-header {
          height: 90px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-bottom: 2px solid #3b82f6;
          display: flex;
          align-items: center;
          justify-content: justify;
          padding: 0 30px;
          z-index: 10;
        }

        .tv-title-group h1 {
          font-size: 2.2rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
          background: linear-gradient(to right, #60a5fa, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tv-title-group p {
          font-size: 0.95rem;
          color: #94a3b8;
          margin: 0;
          text-transform: uppercase;
          font-weight: 600;
        }

        .tv-clock-panel {
          text-align: right;
        }

        .tv-clock-time {
          font-family: 'Share Tech Mono', monospace;
          font-size: 2.8rem;
          color: #10b981;
          text-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
          line-height: 1;
        }

        .tv-clock-date {
          font-size: 0.95rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .tv-body-container {
          flex: 1;
          display: flex;
          padding: 15px;
          overflow: hidden;
          height: calc(100vh - 150px);
        }

        .tv-fullscreen-media-container {
          width: 100%;
          height: 100%;
          background-color: #0b0f19;
          border-radius: 12px;
          border: 2px solid #334155;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
        }

        .tv-media-slide-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #030712;
        }

        .tv-media-slide {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background-color: #030712;
          cursor: zoom-in;
          transition: transform 0.2s ease-in-out;
        }

        .tv-media-slide:hover {
          transform: scale(1.02);
        }

        .tv-media-controls-panel {
          height: 50px;
          background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
          border-top: 1px solid #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 15px;
          gap: 10px;
        }

        .tv-media-status-badge {
          position: absolute;
          top: 10px;
          right: 15px;
          z-index: 10;
          background-color: rgba(245, 158, 11, 0.9);
          color: #000000;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          pointer-events: none;
        }

        .tv-fullscreen-lightbox {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(3, 7, 18, 0.96);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
        }

        .tv-lightbox-close {
          position: absolute;
          top: 25px;
          right: 25px;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid #334155;
          color: #f8fafc;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          z-index: 2010;
        }

        .tv-lightbox-close:hover {
          background-color: #ef4444;
          border-color: #f87171;
          transform: scale(1.1);
        }

        .tv-lightbox-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 90vw;
          max-height: 85vh;
        }

        .tv-lightbox-media {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
          border-radius: 8px;
        }

        .tv-lightbox-caption {
          margin-top: 15px;
          color: #94a3b8;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .tv-no-media {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
          color: #475569;
        }

        .tv-no-media i {
          font-size: 4rem;
          margin-bottom: 15px;
        }

        .tv-card-header {
          padding: 15px 20px;
          border-bottom: 1px solid #334155;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: rgba(15, 23, 42, 0.4);
        }

        .tv-card-header h2 {
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0;
          color: #f1f5f9;
          text-transform: uppercase;
        }

        .tv-cases-scroll {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none; /* Hide scrollbar for clean signage display */
        }
        
        .tv-cases-scroll::-webkit-scrollbar {
          display: none;
        }

        .tv-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }

        .tv-table th {
          background-color: #0f172a;
          color: #94a3b8;
          font-weight: 600;
          padding: 12px 15px;
          text-align: left;
          text-transform: uppercase;
          font-size: 0.85rem;
          border-bottom: 2px solid #334155;
          position: sticky;
          top: 0;
          z-index: 2;
        }

        .tv-table td {
          padding: 14px 15px;
          font-size: 1.05rem;
          border-bottom: 1px solid #334155;
          font-weight: 600;
        }

        .tv-table tr:nth-child(even) {
          background-color: rgba(15, 23, 42, 0.2);
        }

        .tv-table tr {
          transition: background-color 0.2s;
        }

        .badge-tv {
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 800;
          font-size: 0.8rem;
          text-transform: uppercase;
          display: inline-block;
        }

        .badge-tv-start {
          background-color: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid #059669;
        }

        .badge-tv-pause {
          background-color: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid #d97706;
        }

        .badge-tv-hold {
          background-color: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid #dc2626;
        }

        /* Continuous Horizontal Announcer Ticker */
        .tv-marquee-header {
          height: 60px;
          background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
          border-bottom: 2px solid #ef4444;
          display: flex;
          align-items: center;
          overflow: hidden;
          z-index: 10;
        }

        .tv-marquee-label {
          background-color: #7f1d1d;
          color: #fca5a5;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 25px;
          font-weight: 800;
          font-size: 1.15rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-right: 2px solid #ef4444;
          box-shadow: 5px 0 15px rgba(0,0,0,0.3);
          z-index: 3;
          white-space: nowrap;
        }

        .tv-marquee-scroll-container {
          flex: 1;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .tv-marquee-text {
          font-size: 1.45rem;
          font-weight: 600;
          color: #ffffff;
          white-space: nowrap;
          animation: tv-marquee-anim 25s linear infinite;
          padding-left: 100%;
        }

        @keyframes tv-marquee-anim {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
      `}</style>

      <div className="tv-wrapper">
        {/* Marquee Header News Announcement */}
        <footer className="tv-marquee-header">
          <div className="tv-marquee-label">
            <i className="fa-solid fa-bullhorn me-2"></i>Announcements
          </div>
          <div className="tv-marquee-scroll-container">
            <div className="tv-marquee-text">
              {(department.newsList && department.newsList.length > 0)
                ? department.newsList.filter(n => n.active).map(n => n.text).join("   •   ") || "Welcome to Arak Dental Lab."
                : department.newsBar || "Welcome to Arak Dental Lab. Please keep workflows updated in real-time."}
            </div>
          </div>
        </footer>

        {/* Header Block */}
        <header className="tv-header d-flex justify-content-between align-items-center">
          <div className="tv-title-group">
            <h1>{department.name} WORKSTATION</h1>
            <p>Arak Dental Production Dashboard</p>
          </div>
          <div className="tv-clock-panel">
            <div className="tv-clock-time">
              {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="tv-clock-date">
              {clock.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </header>

        {/* Central Display */}
        <div className="tv-body-container">
          {/* Entire Queue Dashboard Layout Area */}
          <div className="tv-fullscreen-media-container">
            {isPaused && (
              <div className="tv-media-status-badge">
                <i className="fa-solid fa-pause me-1"></i> Paused
              </div>
            )}

            <div className="tv-media-slide-container">
              {department.media && department.media.length > 0 ? (
                currentMedia?.resourceType === "video" ? (
                  <video
                    ref={videoPlayerRef}
                    src={currentMedia.url}
                    className="tv-media-slide"
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnded}
                    onClick={() => handleMediaClick(currentMedia)}
                  />
                ) : (
                  <img
                    src={currentMedia?.url}
                    className="tv-media-slide"
                    alt={`Signage Slide ${activeSlide + 1}`}
                    onClick={() => handleMediaClick(currentMedia)}
                  />
                )
              ) : (
                <div className="tv-no-media">
                  <i className="fa-solid fa-photo-film"></i>
                  <h3>No Media Configured</h3>
                  <p className="small">Set slides in Department Settings to start loops</p>
                </div>
              )}
            </div>

            <div className="tv-media-controls-panel">
              <button
                className="btn btn-dark btn-sm text-white"
                onClick={handlePrevSlide}
                disabled={!department.media || department.media.length <= 1}
                title="Previous Slide"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                className={`btn btn-sm ${isPaused ? "btn-warning text-dark" : "btn-outline-primary text-white"}`}
                onClick={togglePause}
                title={isPaused ? "Play Slideshow" : "Pause Slideshow"}
              >
                <i className={isPaused ? "fa-solid fa-play" : "fa-solid fa-pause"}></i>
              </button>
              <button
                className="btn btn-dark btn-sm text-white"
                onClick={handleNextSlide}
                disabled={!department.media || department.media.length <= 1}
                title="Next Slide"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
              <button
                className="btn btn-secondary btn-sm ms-auto text-white"
                onClick={() => handleMediaClick(currentMedia)}
                disabled={!currentMedia}
                title="Fullscreen"
              >
                <i className="fa-solid fa-expand"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Lightbox Overlay */}
        {fullscreenMedia && (
          <div className="tv-fullscreen-lightbox" onClick={() => setFullscreenMedia(null)}>
            <button
              className="tv-lightbox-close"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenMedia(null);
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="tv-lightbox-content" onClick={(e) => e.stopPropagation()}>
              {fullscreenMedia.resourceType === "video" ? (
                <video
                  src={fullscreenMedia.url}
                  controls
                  autoPlay
                  playsInline
                  className="tv-lightbox-media"
                />
              ) : (
                <img
                  src={fullscreenMedia.url}
                  alt="Fullscreen signage content"
                  className="tv-lightbox-media"
                />
              )}
              <div className="tv-lightbox-caption">
                Slide {activeSlide + 1} of {department.media?.length} | Press ESC to exit
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DepartmentTVView;
