const Review = require("./other/reviews")
const { valSc, reviewSc } = require("./schemas")
const AppError = require("./other/utilities/error")
const wrapAsync = require("./other/utilities/wrapAsync")
const ejsMate = require("ejs-mate")
const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const Campground = require("./other/server.js")
const { urlencoded } = require("express")
mongoose.connect('mongodb://localhost:27017/camp-ground', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("database connected")
})

app = express()

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(urlencoded({ extended: true }))

app.get("/", (req, res, next) => {
    res.render("main")
})

app.engine("ejs", ejsMate)

const campVal = function (req, res, next) {
    const { error } = valSc.validate(req.body)
    if (error) {
        const msg = error.details.map(e => e.message).join(",")
        throw new AppError(msg, 404)
    } else {
        next()
    }
}

const reviewVal = function (req, res, next) {
    const { error } = reviewSc.validate(req.body)
    if (error) {
        const msg = error.details.map(e => e.message).join(",")
        throw new AppError(msg, 404)
    } else {
        next()
    }
}

app.post("/campgrounds/:id/reviews", reviewVal, wrapAsync(async (req, res, next) => {
    const { id } = req.params
    const { rating, body } = req.body
    const newReview = new Review({ rating, body })
    console.log(newReview)
    Campground.findById(id).then(e => console.log(e.reviews))
    Campground.findById(id).then(e => console.log(e.reviews.push(newReview)))
    Campground.findById(id).then(e => console.log(e))
    await newReview.save()
    res.redirect(`/campgrounds/${id}`)
}))

app.post("campground/:id/reviews/reviewId", wrapAsync(async (req, res, next) => {

}))

app.get("/campgrounds", wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render("camp/index", { campgrounds })
}))

app.get("/campgrounds/new", wrapAsync(async (req, res, next) => {
    res.render("camp/new")
}))

app.post("/campgrounds", campVal, wrapAsync(async (req, res, next) => {
    const { title, location, image, description, price } = req.body
    const nev = new Campground({ title, location, image, description, price })
    await nev.save()
    res.redirect(`/campgrounds/${nev._id}`)
}))

app.get("/campgrounds/:id/edit", wrapAsync(async (req, res, next) => {
    const camp = await Campground.findById(req.params.id)
    res.render("camp/edit", { camp })
}))

app.post("/campgrounds/:id", campVal, wrapAsync(async (req, res, next) => {
    const { title, location, image, description, price } = req.body
    await Campground.findByIdAndUpdate(req.params.id, { title, location, image, description, price })
    res.redirect(`/campgrounds/${req.params.id}`)
}))

app.get("/campgrounds/:id", wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    res.render("camp/show", { campground })
}))

app.post("/campgrounds/:id/delete", wrapAsync(async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id)
    res.redirect(`/campgrounds`)
}))

app.all("*", (req, res, next) => {
    throw new AppError("Page NOT Found", 404)
})

app.use((err, req, res, next) => {
    const { message = "something went wrong", status = 404, stack } = err
    res.status(status).render("error", { message, status, stack })
})




app.listen("3000")
