import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// Removed local sample data import — initialize empty and rely on API
import {
  bookPackage,
  getAllPackages,
  getUserSession,
  createOrder,
  getRazorpayKey,
  verifyPayment,
} from "../api/services";

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

    const bookingDetails = {
      packageName: selectedPackage.packageName,
      price: selectedPackage.price,
      guestNo: guestCount,
      arrivalDate,
      request: notes,
      totalPrice,
    };

    try {
      const orderResp = await createOrder({
        amount: totalPrice,
        bookingType: "package",
        bookingDetails,
        userId: user._id,
      });

      if (!orderResp || orderResp.error || !orderResp.order) {
        setIsError(true);
        setMessage(orderResp?.message || "Failed to create payment order.");
        setIsSubmitting(false);
        return;
      }

      const keyResp = await getRazorpayKey();
      const razorKey = keyResp?.key;

      await new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve();
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      const options = {
        key: razorKey,
        amount: orderResp.order.amount,
        currency: orderResp.order.currency || "INR",
        name: "Kashi Route",
        description: `Package - ${selectedPackage.packageName}`,
        order_id: orderResp.order.id,
        handler: async function (response) {
          const verifyResp = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          setIsSubmitting(false);

          if (verifyResp?.success) {
            setIsSubmitted(true);
            setIsError(false);
            setMessage("Payment successful and booking completed.");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            setIsError(true);
            setMessage(verifyResp?.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: user.userName,
          email: user.email,
        },
        theme: { color: "#6b21a8" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setIsError(true);
      setMessage(err?.message || "Payment flow failed. Try again later.");
      console.error(err);
      setIsSubmitting(false);
    }
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
