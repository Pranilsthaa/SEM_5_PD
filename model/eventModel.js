const { connection } = require("../connection");

function postEventData(data, file) {
    const { title, description, date, startTime, endTime, location, speakers } = data;
    let parsedSpeakers = JSON.parse(speakers);
    const { banner, additionalImages } = file;
    console.log(file)

    return new Promise((resolve, reject) => {
        connection.beginTransaction(err => {
            if (err) return reject(err);

            const eventQuery = 'INSERT INTO events (title, description, start_time, end_time, date, location, banner_img) VALUES (?, ?, ?, ?, ?, ?, ?)';
            connection.query(eventQuery, [title, description, startTime, endTime, date, location, banner[0].filename], (err, eventResult) => {
                if (err) {
                    return connection.rollback(() => {
                        console.error('Error inserting event:', err);
                        reject(err);
                    });
                }

                const eventId = eventResult.insertId;
                const speakerInserts = parsedSpeakers.map(speaker => {
                    return new Promise((resolve, reject) => {
                        const speakerQuery = "INSERT INTO speaker_detail (name, designation, photoURL, event_id) VALUES (?, ?, ?, ?)";
                        connection.query(speakerQuery, [speaker.name, speaker.designation, speaker.photo, eventId], (err, result) => {
                            if (err) {
                                console.error('Error inserting speaker:', err);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                });
                const imageInsert = additionalImages.map(image => {
                    return new Promise((resolve, reject) => {
                        const speakerQuery = "INSERT INTO events_image (image, event_id) VALUES (?, ?)";
                        connection.query(speakerQuery, [image.filename, eventId], (err, result) => {
                            if (err) {
                                console.error('Error inserting speaker:', err);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                });

                Promise.all(speakerInserts, imageInsert)
                    .then(results => {
                        connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    console.error('Error committing transaction:', err);
                                    reject(err);
                                });
                            }
                            console.log('Transaction committed successfully.');
                            resolve(results);
                        });
                    })
                    .catch(err => {
                        connection.rollback(() => {
                            console.error('Error during speaker inserts, rolling back:', err);
                            reject(err);
                        });
                    });
            });
        });
    });
}

function getEvents() {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM events";
        connection.query(query, (err, result) => {
            if (err) {
                console.error('Error fetching events:', err);
                return reject(err);
            }
            resolve(result);
        });
    })
}

function getEventsAdmin() {
    return new Promise((resolve, reject) => {
        const query = "SELECT id, title, date, location FROM events";
        connection.query(query, (err, result) => {
            if (err) {
                console.error('Error fetching events:', err);
                return reject(err);
            }
            resolve(result);
        });
    })
}

function getEventImages(eventID) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM events_image WHERE event_id = ?";
        connection.query(query, [eventID], (err, result) => {
            if (err) {
                console.error('Error fetching events:', err);
                return reject(err);
            }
            resolve(result);
        });
    })
}

function getEventByID(eventID) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM events WHERE id = ?";
        connection.query(query, [eventID], (err, result) => {
            if (err) {
                console.error('Error fetching events:', err);
                return reject(err);
            }
            resolve(result);
        });
    })
}

function getSpeakerDetailById(eventID) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM speaker_detail WHERE event_id = ?";
        connection.query(query, [eventID], (err, result) => {
            if (err) {
                console.error('Error fetching events:', err);
                return reject(err);
            }
            resolve(result);
        });
    })
}

function editEventData(data, file, id) {
    const {
        title,
        description,
        startTime,
        endTime,
        date,
        location,
        existingImages,
        existingBanner,
        speakers
    } = data;
    const { additionalImages, banner } = file;
    console.log(existingBanner, banner)
    const parsedSpeakers = JSON.parse(speakers);
    const bannerFilename = existingBanner ? existingBanner : banner[0].filename;

    const parsedExistingImages = existingImages && existingImages.length > 0 && existingImages.map(imageString => {
        try {
            return JSON.parse(imageString); // Parse each JSON string
        } catch (error) {
            console.error('Error parsing image JSON:', imageString, error);
            throw new Error('Invalid existingImages data');
        }
    });
    return new Promise((resolve, reject) => {
        const updateEventQuery = "UPDATE events SET title = ?, description = ?, start_time = ?, end_time = ?, date = ?, location = ?, banner_img=? WHERE id = ?";

        // First, update the event details
        connection.query(updateEventQuery, [title, description, startTime, endTime, date, location, bannerFilename, id], (err, result) => {
            if (err) {
                console.error('Error updating event:', err);
                return reject(err);
            }

            // Process speaker updates
            const speakerUpdatePromises = parsedSpeakers.map(speaker => {
                return new Promise((resolve, reject) => {
                    const speakerQuery = "UPDATE speaker_detail SET name = ?, designation = ?, photoURL = ? WHERE id = ?";
                    connection.query(speakerQuery, [speaker.name, speaker.designation, speaker.photoURL, speaker.id], (err, result) => {
                        if (err) {
                            console.error('Error updating speaker:', err);
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
            });


            let imageInsertPromises
            // Process additional images
            if (additionalImages && additionalImages.length > 0) {
                imageInsertPromises = additionalImages.map(image => {
                    return new Promise((resolve, reject) => {
                        const imageQuery = "UPDATE events_image SET image = ? WHERE id = ?";
                        connection.query(imageQuery, [image.filename, image.id], (err, result) => {
                            if (err) {
                                console.error('Error inserting image:', err);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                });
            }

            // Execute all promises for speaker and image updates
            Promise.all([speakerUpdatePromises, imageInsertPromises])
                .then(results => {
                    resolve(results);
                })
                .catch(err => {
                    console.error('Error during updates, rolling back:', err);
                    reject(err);
                });
        });
    });
}

module.exports = { postEventData, getEvents, getEventByID, getSpeakerDetailById, getEventImages, getEventsAdmin, editEventData };
