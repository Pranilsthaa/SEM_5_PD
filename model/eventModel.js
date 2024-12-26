const { connection } = require("../connection");
const _ = require('lodash');

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

    // const parsedSpeakers = speakers && speakers.length > 0 && JSON.parse(speakers);
    const parsedSpeakers = typeof speakers === "string" ? JSON.parse(speakers) : speakers;
    const bannerFilename = existingBanner ? existingBanner : banner[0].filename;
    let existingimagesArr = Array.isArray(data.existingImages) ? existingImages : [existingImages];
    const parsedExistingImages = existingimagesArr && existingimagesArr.length > 0 && existingimagesArr.map(image => JSON.parse(image));

    return new Promise((resolve, reject) => {
        const updateEventQuery = "UPDATE events SET title = ?, description = ?, start_time = ?, end_time = ?, date = ?, location = ?, banner_img=? WHERE id = ?";

        connection.query(updateEventQuery, [title, description, startTime, endTime, date, location, bannerFilename, id], (err) => {
            if (err) {
                console.error('Error updating event:', err);
                return reject(err);
            }

            const fetchImagesQuery = "SELECT * FROM events_image WHERE event_id = ?";
            connection.query(fetchImagesQuery, [id], (err, existingImageRecords) => {
                if (err) {
                    console.error('Error fetching event images:', err);
                    return reject(err);
                }

                // Compare existingImages and dbImageSet by 'name'
                const existingImageSet = existingImages && existingImages.length > 0 && parsedExistingImages.map(image => ({ id: image.id, name: image.image }));
                const dbImageSet = existingImageRecords.map(record => ({ id: record.id, name: record.image }));

                const imagesToDelete = _.differenceBy(dbImageSet, existingImageSet, 'id');

                // console.log(dbImageSet, existingImageSet, imagesToDelete);

                const deleteImagePromises = imagesToDelete.map(image => {
                    return new Promise((resolve, reject) => {
                        const deleteQuery = "DELETE FROM events_image WHERE id = ?";
                        connection.query(deleteQuery, [image.id], (err, result) => {
                            if (err) {
                                console.error('Error deleting image:', err);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                });

                let insertImagePromises = [];
                if (additionalImages && additionalImages.length > 0) {
                    insertImagePromises = additionalImages.map(image => {
                        return new Promise((resolve, reject) => {
                            const insertQuery = "INSERT INTO events_image (event_id, image) VALUES (?, ?)";
                            connection.query(insertQuery, [id, image.filename], (err, result) => {
                                if (err) {
                                    console.error('Error inserting image:', err);
                                    return reject(err);
                                }
                                resolve(result);
                            });
                        });
                    });
                }

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

                Promise.all([...deleteImagePromises, ...insertImagePromises, ...speakerUpdatePromises])
                    .then(results => {
                        resolve(results);
                    })
                    .catch(err => {
                        console.error('Error during updates, rolling back:', err);
                        reject(err);
                    });
            });
        });
    });
}

// function countEvent(status = 'pending') {
//     return new Promise((resolve, reject) => {
//         // Query to count all inquiries
//         const eventQuery = 'SELECT COUNT(*) AS total FROM customer_inquiries';
//         // Query to count inquiries by status
//         const upcomingEvent = 'SELECT COUNT(*) AS count FROM customer_inquiries WHERE status = ?';

//         // Execute the total count query
//         connection.query(eventQuery, (err, totalResult) => {
//             if (err) {
//                 return reject(err);
//             }

//             // Execute the pending inquiry count query
//             connection.query(pendingInquiry, [status], (err, pendingResult) => {
//                 if (err) {
//                     return reject(err);
//                 }

//                 // Resolve the promise with both results
//                 resolve({
//                     total: totalResult[0].total,
//                     pendingCount: pendingResult[0].count
//                 });
//             });
//         });
//     });
// }


module.exports = { postEventData, getEvents, getEventByID, getSpeakerDetailById, getEventImages, getEventsAdmin, editEventData };
