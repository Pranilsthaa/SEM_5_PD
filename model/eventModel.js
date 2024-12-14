const { connection } = require("../connection");

function postEventData(data, file) {
    const { title, description, date, startTime, endTime, location, speakers } = data;
    let parsedSpeakers = JSON.parse(speakers);
    const { filename } = file;

    return new Promise((resolve, reject) => {
        connection.beginTransaction(err => {
            if (err) return reject(err);

            const eventQuery = 'INSERT INTO events (title, description, start_time, end_time, date, location, banner_img) VALUES (?, ?, ?, ?, ?, ?, ?)';
            connection.query(eventQuery, [title, description, startTime, endTime, date, location, filename], (err, eventResult) => {
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

                Promise.all(speakerInserts)
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

module.exports = { postEventData, getEvents, getEventByID, getSpeakerDetailById };
