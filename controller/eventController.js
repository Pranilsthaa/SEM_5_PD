const eventModel = require('../model/eventModel')

async function postEvent(req, res) {
    const data = req.body;
    const file = req.file;
    // console.log(data)
    try {
        let response = await eventModel.postEventData(data, file);
        // console.log(response.insertId)
    } catch (err) {
        console.log(err);
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

async function getEventByID(req, res) {
    const { eventID } = req.params;

    if (!eventID) {
        res.status(400).send('Event ID is required');
        return;
    }
    try {
        let eventById = await eventModel.getEventByID(eventID);
        let speakerById = await eventModel.getSpeakerDetailById(eventID);
        if (eventById && speakerById) {
            res.send(
                {
                    eventById,
                    speaker: speakerById || null
                }
            );
        } else {
            res.status(404).send('Event not found');
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = { postEvent, getEvents, getEventByID };
