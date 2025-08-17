// src/helpers/apiCommunicators.js
import axios from "axios";

export const signupUser = async (name, email, password,code) => {
  try {
    const response = await axios.post(
      "/api/users/signup",
      { name, email, password },
    );
    return response.data;
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    return { error: error.response?.data?.message || "Signup failed" };
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    // Sends the OTP and email for verification
    const response = await axios.post("/api/users/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    console.error("OTP Verification error:", error.response?.data || error.message);
    return { error: error.response?.data?.message || "OTP verification failed" };
  }
};

export const loginUser = async (email, password,code) => {
  try {
    if(code){
      const response = await axios.get( `/api/users/auth/google?code=${code}`);
      console.log(response)
      return response.data;
    }
    else{
    const response = await axios.post(
      "/api/users/login",
      { email, password },
    );
    return response.data;
    }
  } catch (error) {
    console.log(error.response.data)
    console.error("Login error:", error.response?.data || error.message);
    return { error: error.response?.data || "Login failed" };
  }
};

export const logoutUser = async () => {
  try {
    const response = await axios.post(
      "/api/users/logout",
      {},
    );
    return response.data;
  } catch (error) {
    console.error("Logout error:", error.response?.data || error.message);
    return { error: error.response?.data?.message || "Logout failed" };
  }
};

export const getEventDetailsAPI = async (id) => {
  try {
    const response = await axios.get(`/api/event/${id}`);
    return {
      event: response.data.event,
      liveCount: response.data.event.liveCount || 0,
    };
  } catch (error) {
    console.error("Error fetching event details:", error);
    return { error: "Failed to load event. Please try again later." };
  }
};

export const registerForEvent = async (id) => {
  try {
    const response = await axios.put(
      `/api/event/${id}`,
      {},
    );
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    return {
      error: error.response?.data?.message ||
        "Registration failed. Please try again.",
    };
  }
};

export const deregisterFromEvent = async (id) => {
  try {
    const response = await axios.delete(
      `/api/event/${id}/unregister`,
    );
    return response.data;
  } catch (error) {
    console.error("Deregistration error:", error.response?.data || error.message);
    return {
      error: error.response?.data?.message ||
        "Deregistration failed. Please try again.",
    };
  }
};

export const createEvent = async (data) => {
  try {
    const response = await axios.post(
      "/api/event/create",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating event:",
      error.response?.data || error.message
    );
    return {
      error:
        error.response?.data?.message || "Event creation failed. Please try again.",
    };
  }
};

export const updateEvent = async (id, data) => {
  try {
    const response = await axios.patch(
      `/api/event/${id}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating event:", error.response?.data || error.message);
    return { error: error.response?.data?.message || "Event update failed. Please try again." };
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await axios.delete(
      `/api/event/${id}`,
      
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting event:", error.response?.data || error.message);
    return { error: error.response?.data?.message || "Event deletion failed. Please try again." };
  }
};

export const getRegisteredEvents = async () => {
  try {
    const response = await axios.get(
      "/api/users/eventsRegistered",
    );
    if (response.data.message === "OK") {
      return { events: response.data.events };
    } else {
      return { error: "Failed to fetch registered events." };
    }
  } catch (error) {
    console.error("Error fetching registered events:", error);
    return { error: "Error fetching registered events." };
  }
};
export const getCreatedEvents = async () => {
  try {
    const res = await axios.get("api/users/eventsCreated");
    if (res.status !== 200) {
      throw new Error("Failed to fetch user events");
    }
    return res.data;
  } catch (error) {
    console.error("Error in getUserEvents:", error);
    return { error: error.response?.data?.message || error.message };
  }
};
export const getAllEvents = async () => {
  try {
    const response = await axios.get(
      "/api/event",
    );
    // Assuming the backend responds with { events: [...] }
    return { events: response.data.events };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { error: "Failed to fetch events. Please try again later." };
  }
};

export const verifyUserAPI = async () => {
  try {
    const res = await axios.get(
      "/api/users/auth-status",
    );
    if (res.data.message === "OK") {
      const userData = {
        name: res.data.name,
        email: res.data.email,
        _id: res.data._id,
      };
      return { user: userData };
    } else {
      return { error: "User not authenticated" };
    }
  } catch (error) {
    console.error("User verification failed:", error);
    return { error: error.response?.data?.message || "User verification failed" };
  }
};


export const addQuestionToEvent = async (eventId, data) => {
  try {
    const res = await axios.post(`api/event/${eventId}/questions`, data);
    if (res.status !== 201) {
      throw new Error("Failed to post question");
    }
    return res.data;
  } catch (error) {
    console.error("Error in addQuestionToEvent:", error);
    return { error: error.response?.data?.message || error.message };
  }
};

export const addAnswerToQuestion = async (eventId, questionId, data) => {
  try {
    const res = await axios.post(`api/event/${eventId}/questions/${questionId}/answers`, data);
    if (res.status !== 201) {
      throw new Error("Failed to post answer");
    }
    return res.data;
  } catch (error) {
    console.error("Error in addAnswerToQuestion:", error);
    return { error: error.response?.data?.message || error.message };
  }
};