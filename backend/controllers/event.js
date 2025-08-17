import Event from "../model/event.model.js";
import User from "../model/user.model.js";
import cloudinary from "../cloudconfig.js";
import fs from 'fs';
import { promisify } from 'util';
const unlinkAsync = promisify(fs.unlink);


export const createEvent = async (req, res) => {
  try {
    // Log to verify file upload
    console.log("Temporary file path:", req.file.path);

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'events'
    });
    const coverimage = result.secure_url;
    console.log("Cloudinary upload result:", result);

    // Delete the temporary file
    await unlinkAsync(req.file.path);

    // Get form fields from req.body
    const { title, description, date, time, location, category } = req.body;
    const eventDate = new Date(date);
    const creator = res.locals.jwtData.id;

    // Create the new event document
    const event = new Event({ 
      title, 
      description, 
      date: eventDate, 
      time, 
      location, 
      category, 
      coverimage, 
      creator 
    });

    // Save event and update user
    await event.save();
    const user = await User.findById(creator);
    user.events_created.push(event._id);
    await user.save();

    return res.status(201).json({ message: "OK", event });
  } catch (error) {
    console.error("Error in createEvent:", error);
    return res.status(500).json({ message: "ERROR", cause: error.message });
  }
};

export const getAllEvents = async (req, res) => {
    try {          
        const events = await Event.find();
        if (!events) {
            return res.status(404).json({ message: "No events found" });
        }
        return res.status(200).json({ message: "OK", events });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause: error.message });
    }
}

export const getEvent = async (req, res) => {
    try {
        // This is the key change
        const event = await Event.findById(req.params.id).populate('creator', 'name');    
        if (!event) {
        return res.status(404).json({ message: "Event not found" });
        }
        return res.status(200).json({ message: "OK", event });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause: error.message });
    }
}

export const addUserToEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        const user = await User.findById(res.locals.jwtData.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if(event.registered_users.includes(user._id)){
            return res.status(200).json({ message: "User already registered for this event" });
        }
        if(event.creator.toString() === user._id.toString()){
            return res.status(200).json({ message: "Creator cannot register for their own event" });
        }
        event.registered_users.push(user._id);
        await event.save();
        user.events_registered.push(event._id);
        await user.save();
        return res.status(200).json({ message: "OK", event });
    } catch (error) {
        console.log(error);
        return res.status(200).json({ message: "ERROR", cause: error.message });
    }
}

export const editEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        if (event.creator.toString() !== res.locals.jwtData.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Store the old image URL before any updates
        const oldImageUrl = event.coverimage;

        // Check if a new image file is being uploaded
        if (req.file) {
            // 1. Upload the new image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'events'
            });
            event.coverimage = result.secure_url; // Set the new image URL

            // 2. Delete the temporary file from local server
            await unlinkAsync(req.file.path);

            // 3. If there was an old image, delete it from Cloudinary
            if (oldImageUrl) {
                // Extract public_id from the stored oldImageUrl
                const publicId = oldImageUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`events/${publicId}`);
            }
        }

        // Update the rest of the event details from req.body
        const { title, description, date, time, location, category } = req.body;
        event.title = title;
        event.description = description;
        event.date = date;
        event.time = time;
        event.location = location;
        event.category = category;

        await event.save();
        return res.status(200).json({ message: "OK", event });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
}
export const deleteEvent = async (req, res) => {
    try {
      // Find the event by id
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      // Check if the current user is the creator of the event
      if (event.creator.toString() !== res.locals.jwtData.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Delete the event
      await Event.findByIdAndDelete(req.params.id);
  
      // Remove the event from the creator's events_created array
      await User.findByIdAndUpdate(
        event.creator,
        { $pull: { events_created: mongoose.Types.ObjectId(req.params.id) } }
      );
  
      // Remove the event from all users' events_registered arrays using $in to ensure the array contains the id
      await User.updateMany(
        { events_registered: { $in: [mongoose.Types.ObjectId(req.params.id)] } },
        { $pull: { events_registered: mongoose.Types.ObjectId(req.params.id) } }
      );
  
      return res.status(200).json({ message: "OK", event });
    } catch (error) {
      console.log(error);
      return res.status(200).json({ message: "ERROR", cause: error.message });
    }
  };

  export const unregisterUser = async (req, res) => {
    try {
      // Find the event by id.
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      // Find the user from token data.
      const user = await User.findById(res.locals.jwtData.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Remove the user from event's registered_users array.
      event.registered_users.pull(user._id);
      await event.save();
      // Remove the event from user's events_registered array.
      user.events_registered.pull(event._id);
      await user.save();
      return res.status(200).json({ message: "OK", event });
    } catch (error) {
      console.error("Error during deregistration:", error);
      return res.status(200).json({ message: "ERROR", cause: error.message });
    }
  };

  export const addQuestion = async (req, res) => {
    try {
        const { id: eventId } = req.params;
        const { text } = req.body;
        const { id: authorId } = res.locals.jwtData;

        // --- FIX: Fetch the user to get their name ---
        const author = await User.findById(authorId);
        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }
        const authorName = author.name;
        // --- UPDATE THIS ---
        

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // --- UPDATE THIS ---
        const newQuestion = {
            text,
            author: authorId,
            authorName: authorName, // Store the name directly
            answers: []
        };

        event.qna.push(newQuestion);
        await event.save();

        // --- UPDATE THIS --- (Removed populate)
        // The newly added question is the last one in the array
        const createdQuestion = event.qna[event.qna.length - 1];

        return res.status(201).json({ message: "Question added", question: createdQuestion });

    } catch (error) {
        console.error("Error adding question:", error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};

export const addAnswer = async (req, res) => {
    try {
        const { id: eventId, questionId } = req.params;
        const { text } = req.body;
        // --- UPDATE THIS ---
        const { id: authorId } = res.locals.jwtData;

        // --- FIX: Fetch the user to get their name ---
        const author = await User.findById(authorId);
        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }
        const authorName = author.name;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const question = event.qna.id(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // --- UPDATE THIS ---
        const newAnswer = {
            text,
            author: authorId,
            authorName: authorName // Store the name directly
        };

        question.answers.push(newAnswer);
        await event.save();
        
        // --- UPDATE THIS --- (Removed populate)
        // Return the question with the newly added answer
        const updatedQuestion = event.qna.id(questionId);

        return res.status(201).json({ message: "Answer added", question: updatedQuestion });

    } catch (error) {
        console.error("Error adding answer:", error);
        return res.status(500).json({ message: "ERROR", cause: error.message });
    }
};

