import app from './index.js'
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Users Service listening on port :${PORT}`)
})