const apiurl = `https://go-kashi-backend.onrender.com/`;

export async function createPackage(packageData) {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/admin/createPackage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(packageData),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    return { error: true, message: "Network Error " };
  }
}

export async function addCar(carData) {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/admin/addCar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(carData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: true, message: "Network Error " };
  }
}

// === API: Register User ===
export async function registerUser(userData) {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: true, message: "Network Error " };
  }
}

// === API: User Login ===
export async function loginUser(loginData) {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    return { status: false, message: error.message };
  }
}

//===forget Password ===
export async function forgetPass(forgetData) {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/forgetPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(forgetData),
    });

    const data = await response.json();

    return data;
  } catch (error) {
    return { error: true, message: "Network Error " };
  }
}

//===session  required====
export async function getUserSession() {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/session-user`, {
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { loggedIn: false, user: { userType: "guest" } };
  }
}

// === API: Book Package ===
export async function bookPackage(bookingData) {
  const userId = bookingData.userId;
  try {
    const response = await fetch(
      `${apiurl}kashikaTravel/bookPackage/${userId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bookingData),
      }
    );

    const data = await response.json();

    return data;
  } catch (error) {
    return { error: true, message: "Network Error " };
  }
}

// === API: Book Car ===
export async function bookingCar(bookingData) {
  const userId = bookingData.userId;
  try {
    const response = await fetch(
      `${apiurl}kashikaTravel/carbooking/${userId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bookingData),
      }
    );

    const data = await response.json();

    return data;
  } catch (error) {
    return { error: true, message: "Network Error " };
  }
}

//===API: Get all Cars ===
export async function getAllCars() {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/getCar`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: true, message: "Network Error" };
  }
}

//===API: Get all Packages ===
export async function getAllPackages() {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/getPackage`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: true, message: "Network Error" };
  }
}

//===API: Delete Car ===
export async function deleteCar(id) {
  try {
    const response = await fetch(
      `${apiurl}kashikaTravel/admin/carDelete/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: true, message: "Network Error" };
  }
}

//===API: Delete Package ===
export async function deletePackage(id) {
  try {
    const response = await fetch(
      `${apiurl}kashikaTravel/admin/packageDelete/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: true, message: "Network Problem" };
  }
}

//=== API: Get all user ===
export async function getUsers() {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/getUser`, {
      credentials: "include",
    });
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: true, message: "Network Error" };
  }
}

//===API :Type changed ===
export async function userTypeChanged(typeData) {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/changeUserType`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(typeData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { error: true, message: "Network Error" };
  }
}

//===API :Log out ===

// === API: User Logout ===
export async function logoutRequested() {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/logout`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { status: false, message: "Network Error" };
  }
}

//===api fetch : user hitory ===

export async function userHistory(id) {
  try {
    const response = await fetch(`${apiurl}kashikaTravel/userHistory/${id}`, {
      credentials: "include",
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Network Error" };
  }
}

export async function sendMail(data) {
  const payload = {
    to: data.to,
    subject: data.subject,
    websiteName: "Kashika Travel",
    message: data.message,
  };

  try {
    const response = await fetch(
      `https://anubhavmail.anubhavsingh.website/sendMail`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return { message: "Network Error" };
  }
}
