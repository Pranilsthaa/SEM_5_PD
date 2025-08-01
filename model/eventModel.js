const { connection, runQuery } = require("../connection");
const _ = require("lodash");

async function postEventData(data, file) {
  const { title, description, date, startTime, endTime, location, speakers } =
    data;
  let parsedSpeakers;
  try {
    parsedSpeakers =
      speakers && speakers.length > 0 ? JSON.parse(speakers) : [];
  } catch (err) {
    throw {
      success: false,
      message: "Invalid JSON format for speakers.",
    };
  }

  const { banner, additionalImages } = file || {};
  const missingFields = [];
  if (!title) missingFields.push("title");
  if (!description) missingFields.push("description");
  if (!date) missingFields.push("date");
  if (!startTime) missingFields.push("startTime");
  if (!endTime) missingFields.push("endTime");
  if (!location) missingFields.push("location");
  if (!banner || !banner[0] || !banner[0].filename)
    missingFields.push("banner");

  if (missingFields.length > 0) {
    throw {
      success: false,
      message: "Missing required fields.",
      missingFields,
    };
  }

  try {
    await new Promise((resolve, reject) =>
      connection.beginTransaction((err) => (err ? reject(err) : resolve()))
    );

    const eventQuery =
      "INSERT INTO events (title, description, start_time, end_time, date, location, banner_img) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const eventResult = await runQuery(eventQuery, [
      title,
      description,
      startTime,
      endTime,
      date,
      location,
      banner[0].filename,
    ]);

    const eventId = eventResult.insertId;

    const speakerInserts = parsedSpeakers.map((speaker) =>
      runQuery(
        "INSERT INTO speaker_detail (name, designation, photoURL, event_id) VALUES (?, ?, ?, ?)",
        [speaker.name, speaker.designation, speaker.photo, eventId]
      )
    );

    const imageInserts =
      additionalImages?.map((image) =>
        runQuery("INSERT INTO events_image (image, event_id) VALUES (?, ?)", [
          image.filename,
          eventId,
        ])
      ) || [];

    await Promise.all([...speakerInserts, ...imageInserts]);

    await new Promise((resolve, reject) =>
      connection.commit((err) => (err ? reject(err) : resolve()))
    );

    return {
      success: true,
      message: "Transaction committed successfully.",
    };
  } catch (err) {
    await new Promise((resolve) => connection.rollback(() => resolve()));
    throw {
      success: false,
      message: "Error during transaction.",
      error: err,
    };
  }
}

async function getEvents() {
  try {
    const query = "SELECT * FROM events";
    return await runQuery(query);
  } catch (err) {
    console.error("Error fetching events:", err);
    throw err;
  }
}

async function getEventsAdmin() {
  try {
    const query = "SELECT id, title, date, location FROM events";
    return await runQuery(query);
  } catch (err) {
    console.error("Error fetching events:", err);
    throw err;
  }
}

async function getEventImages(eventID) {
  try {
    const query = "SELECT * FROM events_image WHERE event_id = ?";
    return await runQuery(query, [eventID]);
  } catch (err) {
    console.error("Error fetching event images:", err);
    throw err;
  }
}

async function getEventByID(eventID) {
  try {
    const query = "SELECT * FROM events WHERE id = ?";
    return await runQuery(query, [eventID]);
  } catch (err) {
    console.error("Error fetching event by ID:", err);
    throw err;
  }
}

async function getSpeakerDetailById(eventID) {
  try {
    const query = "SELECT * FROM speaker_detail WHERE event_id = ?";
    return await runQuery(query, [eventID]);
  } catch (err) {
    console.error("Error fetching speaker details:", err);
    throw err;
  }
}

async function editEventData(data, file, id) {
  const {
    title,
    description,
    startTime,
    endTime,
    date,
    location,
    existingImages,
    existingBanner,
    speakers,
  } = data;
  const { additionalImages, banner } = file;

  const parsedSpeakers =
    typeof speakers === "string" ? JSON.parse(speakers) : speakers;
  const bannerFilename = existingBanner ? existingBanner : banner[0].filename;
  let existingimagesArr = Array.isArray(data.existingImages)
    ? existingImages
    : [existingImages];
  const parsedExistingImages =
    existingimagesArr &&
    existingimagesArr.length > 0 &&
    existingimagesArr
      .map((image) => {
        try {
          return image ? JSON.parse(image) : null;
        } catch (error) {
          console.error("Invalid JSON:", image, error);
          return null;
        }
      })
      .filter((parsed) => parsed !== null);

  try {
    const updateEventQuery =
      "UPDATE events SET title = ?, description = ?, start_time = ?, end_time = ?, date = ?, location = ?, banner_img=? WHERE id = ?";
    await runQuery(updateEventQuery, [
      title,
      description,
      startTime,
      endTime,
      date,
      location,
      bannerFilename,
      id,
    ]);

    const fetchImagesQuery = "SELECT * FROM events_image WHERE event_id = ?";
    const existingImageRecords = await runQuery(fetchImagesQuery, [id]);

    const existingImageSet =
      existingImages &&
      existingImages.length > 0 &&
      parsedExistingImages.map((image) => ({
        id: image.id,
        name: image.image,
      }));
    const dbImageSet = existingImageRecords.map((record) => ({
      id: record.id,
      name: record.image,
    }));

    const imagesToDelete = _.differenceBy(dbImageSet, existingImageSet, "id");

    const deleteImagePromises = imagesToDelete.map((image) =>
      runQuery("DELETE FROM events_image WHERE id = ?", [image.id])
    );

    let insertImagePromises = [];
    if (additionalImages && additionalImages.length > 0) {
      insertImagePromises = additionalImages.map((image) =>
        runQuery("INSERT INTO events_image (event_id, image) VALUES (?, ?)", [
          id,
          image.filename,
        ])
      );
    }

    const speakerUpdatePromises = parsedSpeakers.map((speaker) =>
      runQuery(
        "UPDATE speaker_detail SET name = ?, designation = ?, photoURL = ? WHERE id = ?",
        [speaker.name, speaker.designation, speaker.photoURL, speaker.id]
      )
    );

    await Promise.all([
      ...deleteImagePromises,
      ...insertImagePromises,
      ...speakerUpdatePromises,
    ]);

    return {
      success: true,
      message: "Event updated successfully.",
    };
  } catch (err) {
    console.error("Error during updates:", err);
    throw err;
  }
}

module.exports = {
  postEventData,
  getEvents,
  getEventByID,
  getSpeakerDetailById,
  getEventImages,
  getEventsAdmin,
  editEventData,
};
