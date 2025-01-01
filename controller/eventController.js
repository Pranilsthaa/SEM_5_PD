const eventModel = require('../model/eventModel')

async function postEvent(req, res) {
    const data = req.body;
    const file = req.files;
    // console.log(data)
    // console.log(file)
    try {
        let response = await eventModel.postEventData(data, file);
        if (response) {
            res.status(200).send('Event posted successfully');
        } else {
            res.status(404).send('Something went wrong');
        }
        // console.log(response.insertId)
    } catch (err) {
        res.status(400).send('missing field: ' + err.missingFields);
    }
}

async function getEvents(req, res) {
    try {
        let response = await eventModel.getEvents();
        if (response) {
            res.status(200).send(response);
        } else {
            res.status(404).send('Event not found');
        }
    } catch (err) {
        console.log(err);
    }
}

async function getEventsAdmin(req, res) {
    try {
        let response = await eventModel.getEventsAdmin();
        if (response) {
            res.status(200).send(response);
        } else {
            res.status(404).send('Event not found');
        }
    } catch (err) {
        console.log(err);
    }
}

async function getEventByID(req, res) {
    const { eventID } = req.params;

    if (!eventID) {
        res.status(400).send('Event ID is required');
        return;
    }
    try {
        let eventById = await eventModel.getEventByID(eventID);
        let speakerById = await eventModel.getSpeakerDetailById(eventID);
        let imageById = await eventModel.getEventImages(eventID);
        if (eventById && speakerById) {
            res.send(
                {
                    eventById,
                    speaker: speakerById || null,
                    images: imageById || null
                }
            );
        } else {
            res.status(404).send('Event not found');
        }
    } catch (err) {
        console.log(err);
    }
}

async function editEvent(req, res) {
    const { id } = req.params;
    const data = req.body;
    const file = req.files;
    // console.log(data)
    // console.log(file)
    try {
        let response = await eventModel.editEventData(data, file, id);
        if (response) {
            res.status(200).send('Event posted successfully');
        } else {
            res.status(404).send('Something went wrong');
        }
        // console.log(response.insertId)
    } catch (err) {
        console.log(err);
    }
}

module.exports = { postEvent, getEvents, getEventByID, getEventsAdmin, editEvent };
