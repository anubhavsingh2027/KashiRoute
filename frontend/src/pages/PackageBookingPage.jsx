import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// Removed local sample data import — initialize empty and rely on API
import { bookPackage, getAllPackages, getUserSession } from "../api/services";

function formatIndianNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function normalizePackage(pkg) {
  return {
    id: pkg.id || pkg._id || pkg.packageName,
    packageName: pkg.packageName,
    price: Number(pkg.price) || 0,
    packageDuration: pkg.packageDuration || pkg.duration || 0,
    description: pkg.description || "",
    url: pkg.url || pkg.image || "",
    place: pkg.place || "",
  };
}

function PackageBookingPage() {
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [arrivalDate, setArrivalDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const session = await getUserSession();
      if (session && session.user) {
        setUser(session.user);
      }

      const data = await getAllPackages();
      if (data && !data.error) {
        const items = Array.isArray(data.packages)
          ? data.packages
          : Array.isArray(data)
            ? data
            : [];
        if (items.length > 0) {
          const normalized = items.map(normalizePackage);
          setPackages(normalized);
          setSelectedPackageId(normalized[0].id);
        }
      }
      setIsLoading(false);
    }

    load();
  }, []);

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === selectedPackageId) || packages[0],
    [packages, selectedPackageId],
  );

  const totalPrice = selectedPackage ? selectedPackage.price * guestCount : 0;

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

    if (!selectedPackage) {
      setIsError(true);
      setMessage("Please select a valid package before booking.");
      return;
    }

    setIsSubmitting(true);

    const bookingData = {
      userId: user._id,
      packageName: selectedPackage.packageName,
      price: selectedPackage.price,
      guestCount,
      arrivalDate,
      request: notes,
      totalPrice,
    };

    const result = await bookPackage(bookingData);
    setIsSubmitting(false);

    if (result?.error) {
      setIsError(true);
      setMessage(result.message || "Package booking failed. Please try again.");
      return;
    }

    setIsSubmitted(true);
    setMessage(result.message || "Package booked successfully!");
    setIsError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="booking-page container">
      <div className="section-heading">
        <p className="section-label">Package Booking</p>
        <h1>Reserve your spiritual itinerary today.</h1>
      </div>

      <div className="booking-layout">
        <form className="booking-form card-block" onSubmit={handleSubmit}>
          {message && (
            <div className={`success-box ${isError ? "error-box" : ""}`}>
              <strong>{isError ? "Error" : "Success"}:</strong> {message}
            </div>
          )}

          <label>
            Choose a package
            <select
              value={selectedPackageId}
              onChange={(event) => setSelectedPackageId(event.target.value)}
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.packageName} — ₹{pkg.price}/person
                </option>
              ))}
            </select>
          </label>

          <label>
            Guests
            <input
              type="number"
              min="1"
              value={guestCount}
              onChange={(event) =>
                setGuestCount(Number(event.target.value) || 1)
              }
            />
          </label>

          <label>
            Arrival date
            <input
              type="date"
              value={arrivalDate}
              onChange={(event) => setArrivalDate(event.target.value)}
            />
          </label>

          <label>
            Additional notes
            <textarea
              placeholder="Requests for guide, accommodation, or special itinerary"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Submitting..." : "Confirm package"}
          </button>

          {isSubmitted && !isError && (
            <div className="success-box">
              <strong>Package booking created!</strong>
              <p>
                {guestCount} guest(s) will join the{" "}
                {selectedPackage.packageName}. Total price estimate is ₹
                {formatIndianNumber(totalPrice)}.
              </p>
            </div>
          )}
        </form>

        <aside className="preview-panel card-block">
          <div
            className="preview-image"
            style={{ backgroundImage: `url(${selectedPackage?.url})` }}
          />
          <div className="preview-copy">
            <span className="badge">Package overview</span>
            <h2>{selectedPackage?.packageName || "Loading packages..."}</h2>
            <p>
              {selectedPackage?.description ||
                "Select a package to preview the itinerary."}
            </p>
            <div className="preview-meta">
              <span>{selectedPackage?.packageDuration ?? "--"} days</span>
              <span>₹{selectedPackage?.price ?? "--"} / person</span>
            </div>
            <div className="preview-total">
              <span>Estimated total</span>
              <strong>₹{formatIndianNumber(totalPrice)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default PackageBookingPage;
