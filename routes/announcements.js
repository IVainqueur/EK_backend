const express = require('express')
const app = express.Router()
const path = require('path')


app.post('/add',async  (req, res)=>{
    console.log(req.body)
    // return res.json({code: "#Success"})
    let newAnnouncement = require('../models/ml-announcement')({
        composer_id: req.body.composer_id,
        title: req.body.title,
        content: req.body.content,
        meantFor: req.body.meantFor,
        expiry: (req.body.expiry == '')? Date.now() + 2592000000 : new Date(req.body.expiry)
    })
    try{
        let saveAnnouncement = await newAnnouncement.save()
        res.json({code: "#Success", doc: saveAnnouncement})
    }catch(e){
        res.json({code: "#Error", message: e})
    }
})

app.get('/view',async (req, res)=>{
    try{
        let announcementsQuery = await require('../models/ml-announcement').find({meantFor: {$in: [req.body.prefix]}})
        let announcements = announcementsQuery.map(x => x)
        if(announcements.length != 0){
            for(let i=0; i < announcements.length; i++){
                let composer = await require('../models/ml-educator').findOne({_id: announcements[i].composer})
                // console.log(composer)
                announcements[i]._doc.writtenBy = composer.names
                // announcements[i].composer = composer.names
                // console.dir(announcements[i]._doc)
            }
        }
        return res.json({code: "#Success", doc: announcements})
    }catch(e){
        console.log(e)
        return res.status(500).json({code: "#InternalServerError", message: e})
    }
})

module.exports = app