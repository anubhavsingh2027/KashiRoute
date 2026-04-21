import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// Removed local sample data import — initialize empty and rely on API
import { bookingCar, getAllCars, getUserSession } from "../api/services";

function formatIndianNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function normalizeCar(car) {
  return {
    id: car.id || car._id || car.carName,
    carName: car.carName,
    price: Number(car.price) || 0,
    totalSeats: car.totalSeats || car.seats || 4,
    description: car.description || "",
    url: car.url || car.image || "",
  };
}

function CarBookingPage() {
  const [cars, setCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [duration, setDuration] = useState(1);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const session = await getUserSession();
      if (session && session.user) {
        setUser(session.user);
      }

      const data = await getAllCars();
      if (data && !data.error) {
        const items = Array.isArray(data.cars)
          ? data.cars
          : Array.isArray(data)
            ? data
            : [];
        if (items.length > 0) {
          const normalized = items.map(normalizeCar);
          setCars(normalized);
          setSelectedCarId(normalized[0].id);
        }
      }
      setIsLoading(false);
    }

    load();
  }, []);

  const selectedCar = useMemo(
    () => cars.find((car) => car.id === selectedCarId) || cars[0],
    [cars, selectedCarId],
  );

  const totalPrice = selectedCar ? selectedCar.price * duration : 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (!user || !user._id) {
      setIsError(true);
      setMessage("Please login before booking. Redirecting to home...");
      setTimeout(() => navigate("/home"), 2500);
      return;
    }

    if (!selectedCar) {
      setIsError(true);
      setMessage("Please select a valid car before booking.");
      return;
    }

    setIsSubmitting(true);

    const bookingData = {
      userId: user._id,
      carName: selectedCar.carName,
      price: selectedCar.price,
      duration,
      date,
      notes,
      totalPrice,
    };

    const result = await bookingCar(bookingData);
    setIsSubmitting(false);

    if (result?.error) {
      setIsError(true);
      setMessage(result.message || "Booking failed. Please try again.");
      return;
    }

    setIsSubmitted(true);
    setMessage(result.message || "Car booking successful!");
    setIsError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="booking-page container">
      <div className="section-heading">
        <p className="section-label">Car Booking</p>
        <h1>Reserve the right vehicle for your Varanasi journey.</h1>
      </div>

      <div className="booking-layout">
        <form className="booking-form card-block" onSubmit={handleSubmit}>
          {message && (
            <div className={`success-box ${isError ? "error-box" : ""}`}>
              <strong>{isError ? "Error" : "Success"}:</strong> {message}
            </div>
          )}

          <label>
            Select a car
            <select
              value={selectedCarId}
              onChange={(event) => setSelectedCarId(event.target.value)}
            >
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.carName} — ₹{car.price}/day
                </option>
              ))}
            </select>
          </label>

          <label>
            Number of days
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value) || 1)}
            />
          </label>

          <label>
            Pick-up date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>

          <label>
            Special requests
            <textarea
              placeholder="Any preferred route or pickup instructions"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Submitting..." : "Confirm booking"}
          </button>

          {isSubmitted && !isError && (
            <div className="success-box">
              <strong>Booking completed!</strong>
              <p>
                Your {selectedCar.carName} will be booked for {duration} day(s)
                starting from {date || "your selected date"}. Total cost is ₹
                {formatIndianNumber(totalPrice)}.
              </p>
            </div>
          )}
        </form>

        <aside className="preview-panel card-block">
          <div
            className="preview-image"
            style={{ backgroundImage: `url(${selectedCar?.url})` }}
          />
          <div className="preview-copy">
            <span className="badge">Selected vehicle</span>
            <h2>{selectedCar?.carName || "Loading cars..."}</h2>
            <p>
              {selectedCar?.description ||
                "Select a car to preview the details."}
            </p>
            <div className="preview-meta">
              <span>{selectedCar?.totalSeats ?? "--"} seats</span>
              <span>₹{selectedCar?.price ?? "--"} / day</span>
            </div>
            <div className="preview-total">
              <span>Total estimate</span>
              <strong>₹{formatIndianNumber(totalPrice)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default CarBookingPage;
